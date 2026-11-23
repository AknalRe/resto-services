import path from "path";
import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 5057),
  host: process.env.HOST || "0.0.0.0",
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5432/reneo_resto",
  dataDir: path.resolve(process.env.DATA_DIR || path.join(process.cwd(), "..", "data")),
  frontendDistDir: path.resolve(
    process.env.FRONTEND_DIST_DIR || path.join(process.cwd(), "..", "frontend", "dist")
  ),
  adminEmail: (process.env.ADMIN_EMAIL || "admin@reneo.my.id").trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || "reneo-admin-123",
  sessionSecret: process.env.SESSION_SECRET || "reneo-resto-dev-secret-change-in-prod",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  platformDomain: (process.env.PLATFORM_DOMAIN || "resto.reneo.my.id").trim().toLowerCase(),
  isProd: process.env.NODE_ENV === "production",
};
