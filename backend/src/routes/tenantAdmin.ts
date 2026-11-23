import type { FastifyInstance } from "fastify";
import type { Pool } from "pg";
import { requireTenantAccess } from "../auth";

export function registerTenantAdminRoutes(app: FastifyInstance, pool: Pool): void {
  // Full overview for tenant admin dashboard
  app.get<{ Params: { tenantId: string } }>("/api/admin/tenants/:tenantId/overview", async (request, reply) => {
    const tenantId = Number(request.params.tenantId);
    if (!(await requireTenantAccess(request, reply, tenantId))) return;

    const tRes = await pool.query("SELECT * FROM tenants WHERE id = $1", [tenantId]);
    if (!tRes.rows[0]) return reply.code(404).send({ error: "Restoran tidak ditemukan." });

    const [branches, categories, menuItems, promos, events, reservations] = await Promise.all([
      pool.query("SELECT * FROM branches WHERE tenant_id = $1 ORDER BY is_primary DESC, id ASC", [tenantId]),
      pool.query("SELECT * FROM menu_categories WHERE tenant_id = $1 ORDER BY sort_order ASC, id ASC", [tenantId]),
      pool.query("SELECT * FROM menu_items WHERE tenant_id = $1 ORDER BY sort_order ASC, id DESC", [tenantId]),
      pool.query("SELECT * FROM promos WHERE tenant_id = $1 ORDER BY id DESC", [tenantId]),
      pool.query("SELECT * FROM event_packages WHERE tenant_id = $1 ORDER BY sort_order ASC, id ASC", [tenantId]),
      pool.query(
        `SELECT r.*, b.name AS branch_name
         FROM reservation_leads r
         LEFT JOIN branches b ON b.id = r.branch_id
         WHERE r.tenant_id = $1
         ORDER BY r.created_at DESC
         LIMIT 100`,
        [tenantId]
      ),
    ]);

    return {
      tenant: tRes.rows[0],
      branches: branches.rows,
      categories: categories.rows,
      menu_items: menuItems.rows,
      promos: promos.rows,
      event_packages: events.rows,
      reservations: reservations.rows,
    };
  });

  // Update restaurant profile & theme
  app.patch<{
    Params: { tenantId: string };
    Body: {
      name?: string;
      tagline?: string;
      story?: string;
      theme_preset?: "heritage" | "bistro" | "cafe";
      primary_color?: string;
      logo_url?: string;
      hero_image_url?: string;
      instagram_url?: string;
      facebook_url?: string;
      tiktok_url?: string;
    };
  }>("/api/admin/tenants/:tenantId/profile", async (request, reply) => {
    const tenantId = Number(request.params.tenantId);
    if (!(await requireTenantAccess(request, reply, tenantId))) return;

    const b = request.body || {};
    const res = await pool.query(
      `UPDATE tenants SET
        name = COALESCE($1, name),
        tagline = COALESCE($2, tagline),
        story = COALESCE($3, story),
        theme_preset = COALESCE($4, theme_preset),
        primary_color = COALESCE($5, primary_color),
        logo_url = COALESCE($6, logo_url),
        hero_image_url = COALESCE($7, hero_image_url),
        instagram_url = COALESCE($8, instagram_url),
        facebook_url = COALESCE($9, facebook_url),
        tiktok_url = COALESCE($10, tiktok_url),
        updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        b.name ?? null,
        b.tagline ?? null,
        b.story ?? null,
        b.theme_preset ?? null,
        b.primary_color ?? null,
        b.logo_url ?? null,
        b.hero_image_url ?? null,
        b.instagram_url ?? null,
        b.facebook_url ?? null,
        b.tiktok_url ?? null,
        tenantId,
      ]
    );
    return { tenant: res.rows[0] };
  });

  // Categories
  app.post<{ Params: { tenantId: string }; Body: { name?: string; sort_order?: number } }>(
    "/api/admin/tenants/:tenantId/categories",
    async (request, reply) => {
      const tenantId = Number(request.params.tenantId);
      if (!(await requireTenantAccess(request, reply, tenantId))) return;
      const name = (request.body?.name || "").trim();
      if (!name) return reply.code(400).send({ error: "Nama kategori wajib diisi." });
      const res = await pool.query(
        "INSERT INTO menu_categories (tenant_id, name, sort_order) VALUES ($1, $2, $3) RETURNING *",
        [tenantId, name, Number(request.body?.sort_order || 10)]
      );
      return reply.code(201).send({ category: res.rows[0] });
    }
  );

  app.delete<{ Params: { tenantId: string; id: string } }>(
    "/api/admin/tenants/:tenantId/categories/:id",
    async (request, reply) => {
      const tenantId = Number(request.params.tenantId);
      if (!(await requireTenantAccess(request, reply, tenantId))) return;
      await pool.query("DELETE FROM menu_categories WHERE id = $1 AND tenant_id = $2", [Number(request.params.id), tenantId]);
      return { ok: true };
    }
  );

  // Menu items
  app.post<{
    Params: { tenantId: string };
    Body: {
      category_id?: number | null;
      name?: string;
      description?: string;
      price?: number;
      image_url?: string;
      badge?: string;
      is_available?: boolean;
    };
  }>("/api/admin/tenants/:tenantId/menu-items", async (request, reply) => {
    const tenantId = Number(request.params.tenantId);
    if (!(await requireTenantAccess(request, reply, tenantId))) return;
    const name = (request.body?.name || "").trim();
    if (!name) return reply.code(400).send({ error: "Nama menu wajib diisi." });
    const res = await pool.query(
      `INSERT INTO menu_items (tenant_id, category_id, name, description, price, image_url, badge, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        tenantId,
        request.body?.category_id ? Number(request.body.category_id) : null,
        name,
        (request.body?.description || "").trim(),
        Math.max(0, Number(request.body?.price || 0)),
        (request.body?.image_url || "").trim(),
        (request.body?.badge || "").trim(),
        request.body?.is_available !== false,
      ]
    );
    return reply.code(201).send({ item: res.rows[0] });
  });

  app.patch<{
    Params: { tenantId: string; id: string };
    Body: {
      category_id?: number | null;
      name?: string;
      description?: string;
      price?: number;
      image_url?: string;
      badge?: string;
      is_available?: boolean;
    };
  }>("/api/admin/tenants/:tenantId/menu-items/:id", async (request, reply) => {
    const tenantId = Number(request.params.tenantId);
    if (!(await requireTenantAccess(request, reply, tenantId))) return;
    const b = request.body || {};
    const res = await pool.query(
      `UPDATE menu_items SET
        category_id = COALESCE($1, category_id),
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        image_url = COALESCE($5, image_url),
        badge = COALESCE($6, badge),
        is_available = COALESCE($7, is_available)
       WHERE id = $8 AND tenant_id = $9
       RETURNING *`,
      [
        b.category_id !== undefined ? b.category_id : null,
        b.name ?? null,
        b.description ?? null,
        b.price !== undefined ? Math.max(0, Number(b.price)) : null,
        b.image_url ?? null,
        b.badge ?? null,
        b.is_available !== undefined ? Boolean(b.is_available) : null,
        Number(request.params.id),
        tenantId,
      ]
    );
    return { item: res.rows[0] };
  });

  app.delete<{ Params: { tenantId: string; id: string } }>(
    "/api/admin/tenants/:tenantId/menu-items/:id",
    async (request, reply) => {
      const tenantId = Number(request.params.tenantId);
      if (!(await requireTenantAccess(request, reply, tenantId))) return;
      await pool.query("DELETE FROM menu_items WHERE id = $1 AND tenant_id = $2", [Number(request.params.id), tenantId]);
      return { ok: true };
    }
  );

  // Branches
  app.post<{
    Params: { tenantId: string };
    Body: { name?: string; address?: string; maps_url?: string; open_hours?: string; whatsapp_number?: string; is_primary?: boolean };
  }>("/api/admin/tenants/:tenantId/branches", async (request, reply) => {
    const tenantId = Number(request.params.tenantId);
    if (!(await requireTenantAccess(request, reply, tenantId))) return;
    const name = (request.body?.name || "").trim();
    if (!name) return reply.code(400).send({ error: "Nama cabang wajib diisi." });
    const res = await pool.query(
      `INSERT INTO branches (tenant_id, name, address, maps_url, open_hours, whatsapp_number, is_primary)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        tenantId,
        name,
        (request.body?.address || "").trim(),
        (request.body?.maps_url || "").trim(),
        (request.body?.open_hours || "10.00 - 22.00 WIB").trim(),
        (request.body?.whatsapp_number || "").trim(),
        Boolean(request.body?.is_primary),
      ]
    );
    return reply.code(201).send({ branch: res.rows[0] });
  });

  app.delete<{ Params: { tenantId: string; id: string } }>(
    "/api/admin/tenants/:tenantId/branches/:id",
    async (request, reply) => {
      const tenantId = Number(request.params.tenantId);
      if (!(await requireTenantAccess(request, reply, tenantId))) return;
      await pool.query("DELETE FROM branches WHERE id = $1 AND tenant_id = $2", [Number(request.params.id), tenantId]);
      return { ok: true };
    }
  );

  // Promos
  app.post<{
    Params: { tenantId: string };
    Body: { title?: string; description?: string; banner_url?: string; start_date?: string | null; end_date?: string | null };
  }>("/api/admin/tenants/:tenantId/promos", async (request, reply) => {
    const tenantId = Number(request.params.tenantId);
    if (!(await requireTenantAccess(request, reply, tenantId))) return;
    const title = (request.body?.title || "").trim();
    if (!title) return reply.code(400).send({ error: "Judul promo wajib diisi." });
    const res = await pool.query(
      `INSERT INTO promos (tenant_id, title, description, banner_url, start_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING *`,
      [
        tenantId,
        title,
        (request.body?.description || "").trim(),
        (request.body?.banner_url || "").trim(),
        request.body?.start_date || null,
        request.body?.end_date || null,
      ]
    );
    return reply.code(201).send({ promo: res.rows[0] });
  });

  app.delete<{ Params: { tenantId: string; id: string } }>(
    "/api/admin/tenants/:tenantId/promos/:id",
    async (request, reply) => {
      const tenantId = Number(request.params.tenantId);
      if (!(await requireTenantAccess(request, reply, tenantId))) return;
      await pool.query("DELETE FROM promos WHERE id = $1 AND tenant_id = $2", [Number(request.params.id), tenantId]);
      return { ok: true };
    }
  );

  // Event Packages
  app.post<{
    Params: { tenantId: string };
    Body: { title?: string; capacity?: string; price_label?: string; description?: string; image_url?: string };
  }>("/api/admin/tenants/:tenantId/events", async (request, reply) => {
    const tenantId = Number(request.params.tenantId);
    if (!(await requireTenantAccess(request, reply, tenantId))) return;
    const title = (request.body?.title || "").trim();
    if (!title) return reply.code(400).send({ error: "Nama paket acara wajib diisi." });
    const res = await pool.query(
      `INSERT INTO event_packages (tenant_id, title, capacity, price_label, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        tenantId,
        title,
        (request.body?.capacity || "").trim(),
        (request.body?.price_label || "").trim(),
        (request.body?.description || "").trim(),
        (request.body?.image_url || "").trim(),
      ]
    );
    return reply.code(201).send({ event_package: res.rows[0] });
  });

  app.delete<{ Params: { tenantId: string; id: string } }>(
    "/api/admin/tenants/:tenantId/events/:id",
    async (request, reply) => {
      const tenantId = Number(request.params.tenantId);
      if (!(await requireTenantAccess(request, reply, tenantId))) return;
      await pool.query("DELETE FROM event_packages WHERE id = $1 AND tenant_id = $2", [Number(request.params.id), tenantId]);
      return { ok: true };
    }
  );

  // Reservations status update
  app.patch<{
    Params: { tenantId: string; id: string };
    Body: { status?: "new" | "confirmed" | "completed" | "cancelled" };
  }>("/api/admin/tenants/:tenantId/reservations/:id", async (request, reply) => {
    const tenantId = Number(request.params.tenantId);
    if (!(await requireTenantAccess(request, reply, tenantId))) return;
    const status = request.body?.status;
    if (!status || !["new", "confirmed", "completed", "cancelled"].includes(status)) {
      return reply.code(400).send({ error: "Status reservasi tidak valid." });
    }
    const res = await pool.query(
      "UPDATE reservation_leads SET status = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *",
      [status, Number(request.params.id), tenantId]
    );
    return { reservation: res.rows[0] };
  });
}
