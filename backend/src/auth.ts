import crypto from "crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { config } from "./config";

export const SESSION_COOKIE = "reneo_resto_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
  uid: number;
  email: string;
  name: string;
  role: "superadmin" | "tenant_admin";
  tenantId: number | null;
  exp: number;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, "hex");
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

export function signSession(payload: Omit<SessionPayload, "exp">): string {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(full), "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", config.sessionSecret)
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto
    .createHmac("sha256", config.sessionSecret)
    .update(body)
    .digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (typeof parsed.exp !== "number" || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isHttpsRequest(request: FastifyRequest): boolean {
  const proto = request.headers["x-forwarded-proto"];
  if (typeof proto === "string" && proto.toLowerCase().includes("https")) {
    return true;
  }
  return request.protocol === "https";
}

export function setSessionCookie(request: FastifyRequest, reply: FastifyReply, token: string): void {
  reply.setCookie(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isHttpsRequest(request),
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(request: FastifyRequest, reply: FastifyReply): void {
  reply.clearCookie(SESSION_COOKIE, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isHttpsRequest(request),
    maxAge: 0,
    expires: new Date(0),
  });
}

export function getSessionFromRequest(request: FastifyRequest): SessionPayload | null {
  return verifySession(request.cookies?.[SESSION_COOKIE]);
}

export async function requireSuperadmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<SessionPayload | null> {
  const session = getSessionFromRequest(request);
  if (!session || session.role !== "superadmin") {
    reply.code(403).send({ error: "Akses khusus Superadmin Reneo." });
    return null;
  }
  return session;
}

export async function requireTenantAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  tenantId: number
): Promise<SessionPayload | null> {
  const session = getSessionFromRequest(request);
  if (!session) {
    reply.code(401).send({ error: "Sesi berakhir. Silakan masuk kembali." });
    return null;
  }
  if (session.role === "superadmin" || session.tenantId === tenantId) {
    return session;
  }
  reply.code(403).send({ error: "Anda tidak memiliki akses ke restoran ini." });
  return null;
}
