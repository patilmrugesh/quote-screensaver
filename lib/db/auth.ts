import crypto from "node:crypto";
import { getDb } from "./index";

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  createdAt: number;
}

const SESSION_EXPIRY_DAYS = 30;

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computedHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(hash));
  } catch {
    return false;
  }
}

export function createSession(userId: string): { token: string; expiresAt: number } {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  const expiresAt = now + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  const stmt = db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(token, userId, expiresAt, now);

  return { token, expiresAt };
}

export function validateSession(token: string): SafeUser | null {
  if (!token || typeof token !== "string") return null;
  const db = getDb();

  const stmt = db.prepare(`
    SELECT users.id, users.username, users.email, users.created_at, sessions.expires_at
    FROM sessions
    INNER JOIN users ON sessions.user_id = users.id
    WHERE sessions.token = ?
  `);

  const result = stmt.get(token) as {
    id: string;
    username: string;
    email: string;
    created_at: number;
    expires_at: number;
  } | undefined;

  if (!result) return null;

  if (Date.now() > result.expires_at) {
    // Expired session: delete it
    deleteSession(token);
    return null;
  }

  return {
    id: result.id,
    username: result.username,
    email: result.email,
    createdAt: result.created_at,
  };
}

export function deleteSession(token: string): void {
  const db = getDb();
  const stmt = db.prepare("DELETE FROM sessions WHERE token = ?");
  stmt.run(token);
}

export function getAuthUser(request: Request): SafeUser | null {
  // 1. Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const user = validateSession(token);
    if (user) return user;
  }

  // 2. Check Cookie header
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc, part) => {
      const [rawKey, ...rest] = part.trim().split("=");
      if (rawKey) {
        acc[rawKey] = decodeURIComponent(rest.join("="));
      }
      return acc;
    }, {} as Record<string, string>);

    if (cookies.auth_token) {
      return validateSession(cookies.auth_token);
    }
  }

  return null;
}
