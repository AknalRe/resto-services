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

  if (fs.existsSync(config.frontendDistDir)) {
    await app.register(fastifyStatic, {
      root: config.frontendDistDir,
      prefix: "/",
      wildcard: false,
    });

    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith("/api/")) {
        return reply.code(404).send({ error: "Endpoint API tidak ditemukan." });
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
