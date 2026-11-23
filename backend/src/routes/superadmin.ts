import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";
import { hashPassword, requireSuperadmin } from "../auth";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function registerSuperadminRoutes(app: FastifyInstance, pool: Pool): void {
  app.get("/api/superadmin/tenants", async (request, reply) => {
    if (!(await requireSuperadmin(request, reply))) return;

    const res = await pool.query(
      `SELECT t.*,
        (SELECT COUNT(*)::int FROM branches b WHERE b.tenant_id = t.id) AS branch_count,
        (SELECT COUNT(*)::int FROM menu_items m WHERE m.tenant_id = t.id) AS menu_count,
        (SELECT COUNT(*)::int FROM reservation_leads r WHERE r.tenant_id = t.id) AS reservation_count
       FROM tenants t
       ORDER BY t.id DESC`
    );
    return { tenants: res.rows };
  });

  app.post<{
    Body: {
      name?: string;
      slug?: string;
      custom_domain?: string;
      theme_preset?: "banquet" | "heritage" | "bistro" | "cafe" | "omakase" | "coastal" | "street";
      primary_color?: string;
      plan?: "starter" | "profesional" | "multi-cabang";
      owner_email?: string;
      owner_password?: string;
      whatsapp_number?: string;
    };
  }>("/api/superadmin/tenants", async (request, reply) => {
    if (!(await requireSuperadmin(request, reply))) return;

    const name = (request.body?.name || "").trim();
    const slug = slugify(request.body?.slug || name);
    if (!name || !slug) {
      return reply.code(400).send({ error: "Nama dan slug restoran wajib diisi." });
    }

    const customDomain = (request.body?.custom_domain || "").trim().toLowerCase() || null;
    const preset = request.body?.theme_preset || "banquet";
    const color = (request.body?.primary_color || "#8B1E24").trim();
    const plan = request.body?.plan || "profesional";

    try {
      const created = await pool.query<{ id: number }>(
        `INSERT INTO tenants (slug, name, tagline, custom_domain, theme_preset, primary_color, plan, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
         RETURNING *`,
        [slug, name, "Sajian hangat pilihan untuk keluarga dan kolega.", customDomain, preset, color, plan]
      );
      const tenant = created.rows[0];

      // Create default primary branch
      await pool.query(
        "INSERT INTO branches (tenant_id, name, address, open_hours, whatsapp_number, is_primary) VALUES ($1, 'Cabang Utama', 'Alamat cabang utama', '10.00 - 22.00 WIB', $2, TRUE)",
        [tenant.id, (request.body?.whatsapp_number || "").trim()]
      );

      // Optional owner login account
      const ownerEmail = (request.body?.owner_email || "").trim().toLowerCase();
      const ownerPassword = request.body?.owner_password || "";
      if (ownerEmail && ownerPassword) {
        await pool.query(
          `INSERT INTO users (email, name, password_hash, role, tenant_id)
           VALUES ($1, $2, $3, 'tenant_admin', $4)
           ON CONFLICT (email) DO NOTHING`,
          [ownerEmail, `Admin ${name}`, hashPassword(ownerPassword), tenant.id]
        );
      }

      return reply.code(201).send({ tenant });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("unique") || msg.includes("duplicate")) {
        return reply.code(409).send({ error: `Slug "${slug}" atau domain kustom sudah digunakan.` });
      }
      throw err;
    }
  });

  app.patch<{
    Params: { id: string };
    Body: {
      custom_domain?: string | null;
      plan?: "starter" | "profesional" | "multi-cabang";
      status?: "active" | "suspended";
      theme_preset?: "banquet" | "heritage" | "bistro" | "cafe" | "omakase" | "coastal" | "street";
    };
  }>("/api/superadmin/tenants/:id", async (request, reply) => {
    if (!(await requireSuperadmin(request, reply))) return;
    const id = Number(request.params.id);
    const b = request.body || {};
    const domain = b.custom_domain !== undefined ? (b.custom_domain?.trim().toLowerCase() || null) : undefined;

    const res = await pool.query(
      `UPDATE tenants SET
        custom_domain = CASE WHEN $1::boolean THEN $2 ELSE custom_domain END,
        plan = COALESCE($3, plan),
        status = COALESCE($4, status),
        theme_preset = COALESCE($5, theme_preset),
        updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [domain !== undefined, domain ?? null, b.plan ?? null, b.status ?? null, b.theme_preset ?? null, id]
    );
    return { tenant: res.rows[0] };
  });

  app.delete<{ Params: { id: string } }>("/api/superadmin/tenants/:id", async (request, reply) => {
    if (!(await requireSuperadmin(request, reply))) return;
    await pool.query("DELETE FROM tenants WHERE id = $1", [Number(request.params.id)]);
    return { ok: true };
  });
}
