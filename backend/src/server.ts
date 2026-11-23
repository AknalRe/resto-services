import fs from "fs";
import path from "path";
import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { config } from "./config";
import { getPool, initDatabase } from "./db";
import { registerAuthRoutes } from "./routes/auth";
import { registerPublicRoutes } from "./routes/public";
import { registerTenantAdminRoutes } from "./routes/tenantAdmin";
import { registerSuperadminRoutes } from "./routes/superadmin";
import { registerUploadRoutes } from "./routes/uploads";

export async function buildApp(customDbUrl?: string): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    bodyLimit: 6 * 1024 * 1024,
  });

  const pool = getPool(customDbUrl);
  await initDatabase(pool);

  await app.register(cookie);
  await app.register(cors, {
    origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",").map((s) => s.trim()),
    credentials: true,
  });

  app.get("/api/health", async () => {
    await pool.query("SELECT 1");
    return {
      status: "ok",
      service: "reneo-resto",
      timestamp: new Date().toISOString(),
    };
  });

  registerAuthRoutes(app, pool);
  registerPublicRoutes(app, pool);
  registerTenantAdminRoutes(app, pool);
  registerSuperadminRoutes(app, pool);
  registerUploadRoutes(app);

  if (fs.existsSync(config.frontendDistDir)) {
    await app.register(fastifyStatic, {
      root: config.frontendDistDir,
      prefix: "/",
      wildcard: false,
    });

    app.setNotFoundHandler((request, reply) => {
      const urlPath = request.url.split("?")[0];
      if (urlPath.startsWith("/api/")) {
        return reply.code(404).send({ error: "Endpoint API tidak ditemukan." });
      }

      // Support relative ./assets/*, ./demo/*, and ./logo.svg when SPA is opened on nested routes
      // (e.g. /preview/banquet or /r/slug/menu under both root domain and /app/reneo-resto proxy)
      const nestedAsset = urlPath.match(/\/((?:assets|demo)\/[^/]+|logo\.svg)$/);
      if (nestedAsset) {
        const relPath = nestedAsset[1];
        const candidate = path.resolve(config.frontendDistDir, relPath);
        if (candidate.startsWith(path.resolve(config.frontendDistDir)) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return reply.sendFile(relPath);
        }
      }

      const indexFile = path.join(config.frontendDistDir, "index.html");
      if (fs.existsSync(indexFile)) {
        return reply.type("text/html").send(fs.readFileSync(indexFile));
      }
      return reply.code(404).send({ error: "Halaman tidak ditemukan." });
    });
  }

  return app;
}

if (require.main === module) {
  buildApp()
    .then((app) => app.listen({ port: config.port, host: config.host }))
    .catch((err) => {
      console.error("Gagal menjalankan Reneo Resto:", err);
      process.exit(1);
    });
}
