import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { FastifyInstance } from "fastify";
import { config } from "../config";
import { requireTenantAccess } from "../auth";

const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

const EXT_TO_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export function registerUploadRoutes(app: FastifyInstance): void {
  const uploadsRoot = path.join(config.dataDir, "uploads");
  fs.mkdirSync(uploadsRoot, { recursive: true });

  // Tenant Admin: upload base64 data URL image
  app.post<{
    Params: { tenantId: string };
    Body: { data_url?: string; filename?: string };
  }>("/api/admin/tenants/:tenantId/upload", async (request, reply) => {
    const tenantId = Number(request.params.tenantId);
    if (!(await requireTenantAccess(request, reply, tenantId))) return;

    const dataUrl = (request.body?.data_url || "").trim();
    const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
    if (!match) {
      return reply.code(400).send({ error: "Format gambar tidak valid. Gunakan PNG, JPG, WebP, atau SVG." });
    }

    const mime = match[1].toLowerCase();
    const ext = ALLOWED_MIME[mime];
    if (!ext) {
      return reply.code(400).send({ error: "Jenis file tidak didukung. Gunakan PNG, JPG, WebP, atau SVG." });
    }

    const buf = Buffer.from(match[2], "base64");
    if (buf.length === 0 || buf.length > 5 * 1024 * 1024) {
      return reply.code(413).send({ error: "Ukuran gambar maksimal 5 MB." });
    }

    const tenantDirName = `tenant-${tenantId}`;
    const tenantDir = path.join(uploadsRoot, tenantDirName);
    fs.mkdirSync(tenantDir, { recursive: true });

    const safeFile = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
    fs.writeFileSync(path.join(tenantDir, safeFile), buf);

    return reply.code(201).send({
      url: `/api/uploads/${tenantDirName}/${safeFile}`,
      size_bytes: buf.length,
    });
  });

  // Public: serve uploaded tenant images
  app.get<{ Params: { tenantDir: string; filename: string } }>(
    "/api/uploads/:tenantDir/:filename",
    async (request, reply) => {
      const { tenantDir, filename } = request.params;
      if (!/^tenant-\d+$/.test(tenantDir) || !/^[a-zA-Z0-9._-]+$/.test(filename)) {
        return reply.code(400).send({ error: "Path berkas tidak valid." });
      }

      const fullPath = path.join(uploadsRoot, tenantDir, filename);
      if (!fs.existsSync(fullPath)) {
        return reply.code(404).send({ error: "Gambar tidak ditemukan." });
      }

      const ext = path.extname(filename).toLowerCase();
      const mime = EXT_TO_MIME[ext] || "application/octet-stream";
      reply.header("Content-Type", mime);
      reply.header("Cache-Control", "public, max-age=86400");
      reply.header("X-Content-Type-Options", "nosniff");
      return reply.send(fs.readFileSync(fullPath));
    }
  );
}
