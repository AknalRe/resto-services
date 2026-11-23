import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";
import { config } from "../config";

function normalizeHost(rawHost?: string): string {
  return (rawHost || "").split(":")[0].trim().toLowerCase();
}

export function registerPublicRoutes(app: FastifyInstance, pool: Pool): void {
  // Resolve current host (custom domain / subdomain) or return active restaurant directory
  app.get("/api/public/resolve", async (request) => {
    const host = normalizeHost(String(request.headers["x-forwarded-host"] || request.headers.host || ""));

    if (host && host !== "localhost" && host !== "127.0.0.1" && host !== config.platformDomain) {
      // 1. Check custom domain match
      const byDomain = await pool.query(
        "SELECT slug, name FROM tenants WHERE lower(custom_domain) = $1 AND status = 'active' LIMIT 1",
        [host]
      );
      if (byDomain.rows[0]) {
        return { mode: "tenant", slug: byDomain.rows[0].slug };
      }

      // 2. Check subdomain <slug>.resto.reneo.my.id
      if (host.endsWith(`.${config.platformDomain}`)) {
        const sub = host.slice(0, -(config.platformDomain.length + 1));
        if (sub && !sub.includes(".")) {
          const bySub = await pool.query(
            "SELECT slug FROM tenants WHERE slug = $1 AND status = 'active' LIMIT 1",
            [sub]
          );
          if (bySub.rows[0]) {
            return { mode: "tenant", slug: bySub.rows[0].slug };
          }
        }
      }
    }

    const list = await pool.query(
      `SELECT t.id, t.slug, t.name, t.tagline, t.theme_preset, t.primary_color, t.custom_domain, t.hero_image_url,
        (SELECT COUNT(*)::int FROM branches b WHERE b.tenant_id = t.id) AS branch_count,
        (SELECT COUNT(*)::int FROM menu_items m WHERE m.tenant_id = t.id AND m.is_available = TRUE) AS menu_count
       FROM tenants t
       WHERE t.status = 'active'
       ORDER BY t.id ASC`
    );

    return {
      mode: "platform",
      restaurants: list.rows,
    };
  });

  // Full restaurant storefront data by slug
  app.get<{ Params: { slug: string } }>("/api/public/restaurants/:slug", async (request, reply) => {
    const slug = request.params.slug.trim().toLowerCase();
    const tRes = await pool.query(
      `SELECT id, slug, name, tagline, story, custom_domain, theme_preset, primary_color,
        logo_url, hero_image_url, hero_images, hero_transition, hero_interval_ms,
        instagram_url, facebook_url, tiktok_url, plan
       FROM tenants WHERE slug = $1 AND status = 'active' LIMIT 1`,
      [slug]
    );
    const tenant = tRes.rows[0];
    if (!tenant) {
      return reply.code(404).send({ error: "Halaman restoran tidak ditemukan atau sedang nonaktif." });
    }

    const [branches, categories, items, promos, events] = await Promise.all([
      pool.query("SELECT * FROM branches WHERE tenant_id = $1 ORDER BY is_primary DESC, id ASC", [tenant.id]),
      pool.query("SELECT * FROM menu_categories WHERE tenant_id = $1 AND is_active = TRUE ORDER BY sort_order ASC, id ASC", [tenant.id]),
      pool.query("SELECT * FROM menu_items WHERE tenant_id = $1 ORDER BY sort_order ASC, id ASC", [tenant.id]),
      pool.query(
        `SELECT * FROM promos
         WHERE tenant_id = $1 AND is_active = TRUE
           AND (start_date IS NULL OR start_date <= CURRENT_DATE)
           AND (end_date IS NULL OR end_date >= CURRENT_DATE)
         ORDER BY id DESC`,
        [tenant.id]
      ),
      pool.query("SELECT * FROM event_packages WHERE tenant_id = $1 ORDER BY sort_order ASC, id ASC", [tenant.id]),
    ]);

    return {
      tenant,
      branches: branches.rows,
      categories: categories.rows,
      menu_items: items.rows,
      promos: promos.rows,
      event_packages: events.rows,
    };
  });

  // Submit reservation lead -> persist in PostgreSQL & return formatted WhatsApp URL
  app.post<{
    Params: { slug: string };
    Body: {
      branch_id?: number;
      guest_name?: string;
      guest_phone?: string;
      event_type?: string;
      date_time?: string;
      pax?: number;
      notes?: string;
    };
  }>("/api/public/restaurants/:slug/reservations", async (request, reply) => {
    const slug = request.params.slug.trim().toLowerCase();
    const tRes = await pool.query<{ id: number; name: string }>(
      "SELECT id, name FROM tenants WHERE slug = $1 AND status = 'active' LIMIT 1",
      [slug]
    );
    const tenant = tRes.rows[0];
    if (!tenant) {
      return reply.code(404).send({ error: "Restoran tidak ditemukan." });
    }

    const guestName = (request.body?.guest_name || "").trim();
    const guestPhone = (request.body?.guest_phone || "").trim();
    const dateTime = (request.body?.date_time || "").trim();
    const eventType = (request.body?.event_type || "Makan Keluarga").trim();
    const pax = Math.max(1, Math.min(500, Number(request.body?.pax || 2)));
    const notes = (request.body?.notes || "").trim();

    if (!guestName || !guestPhone || !dateTime) {
      return reply.code(400).send({ error: "Nama tamu, nomor WhatsApp, dan jadwal reservasi wajib diisi." });
    }

    let branchId: number | null = null;
    let branchName = tenant.name;
    let waNumber = "";

    if (request.body?.branch_id) {
      const bRes = await pool.query<{ id: number; name: string; whatsapp_number: string }>(
        "SELECT id, name, whatsapp_number FROM branches WHERE id = $1 AND tenant_id = $2",
        [Number(request.body.branch_id), tenant.id]
      );
      if (bRes.rows[0]) {
        branchId = bRes.rows[0].id;
        branchName = bRes.rows[0].name;
        waNumber = bRes.rows[0].whatsapp_number;
      }
    }
    if (!branchId) {
      const bDef = await pool.query<{ id: number; name: string; whatsapp_number: string }>(
        "SELECT id, name, whatsapp_number FROM branches WHERE tenant_id = $1 ORDER BY is_primary DESC, id ASC LIMIT 1",
        [tenant.id]
      );
      if (bDef.rows[0]) {
        branchId = bDef.rows[0].id;
        branchName = bDef.rows[0].name;
        waNumber = bDef.rows[0].whatsapp_number;
      }
    }

    const inserted = await pool.query(
      `INSERT INTO reservation_leads (
        tenant_id, branch_id, guest_name, guest_phone, event_type, date_time, pax, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [tenant.id, branchId, guestName, guestPhone, eventType, dateTime, pax, notes]
    );

    const cleanWa = waNumber.replace(/[^0-9]/g, "");
    const messageLines = [
      `Halo ${tenant.name} (${branchName}), saya ingin mengajukan reservasi:`,
      `Nama: ${guestName}`,
      `No. WhatsApp: ${guestPhone}`,
      `Jadwal: ${dateTime}`,
      `Jumlah Tamu: ${pax} orang`,
      `Keperluan: ${eventType}`,
      notes ? `Catatan: ${notes}` : "",
    ].filter(Boolean);

    const whatsappUrl = cleanWa
      ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(messageLines.join("\n"))}`
      : "";

    return reply.code(201).send({
      reservation: inserted.rows[0],
      whatsapp_url: whatsappUrl,
    });
  });
}
