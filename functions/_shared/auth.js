import { getClientIp } from "./http.js";
import { randomToken, sha256 } from "./crypto.js";

const SESSION_DAYS = 30;
const PRODUCTION_COOKIE = "__Host-3c_session";
const DEVELOPMENT_COOKIE = "3c_session";

export function publicUser(row) {
  if (!row) return null;

  let metadata = {};
  try {
    metadata = JSON.parse(row.metadata_json || "{}");
  } catch {
    metadata = {};
  }

  return {
    id: row.id,
    email: row.email,
    email_confirmed_at: row.email_verified_at,
    confirmed_at: row.email_verified_at,
    created_at: row.created_at,
    user_metadata: metadata,
  };
}

function parseCookies(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = new Map();
  for (const item of cookieHeader.split(";")) {
    const separator = item.indexOf("=");
    if (separator < 0) continue;
    const key = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    if (key) cookies.set(key, decodeURIComponent(value));
  }
  return cookies;
}

function cookieName(request) {
  return new URL(request.url).protocol === "https:" ? PRODUCTION_COOKIE : DEVELOPMENT_COOKIE;
}

export function sessionCookie(request, token, maxAgeSeconds = SESSION_DAYS * 24 * 60 * 60) {
  const secure = new URL(request.url).protocol === "https:";
  const parts = [
    `${cookieName(request)}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie(request) {
  return sessionCookie(request, "", 0);
}

export async function createSession(env, request, userId) {
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  await env.DB.prepare(
    `INSERT INTO sessions
      (id, user_id, token_hash, ip_address, user_agent, expires_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      crypto.randomUUID(),
      userId,
      tokenHash,
      getClientIp(request),
      request.headers.get("user-agent"),
      expiresAt,
      now.toISOString(),
    )
    .run();

  return { token, tokenHash, expiresAt };
}

export async function getSession(request, env, { touch = true } = {}) {
  const cookies = parseCookies(request);
  const rawToken = cookies.get(PRODUCTION_COOKIE) || cookies.get(DEVELOPMENT_COOKIE);
  if (!rawToken) return null;

  const tokenHash = await sha256(rawToken);
  const now = new Date().toISOString();
  const row = await env.DB.prepare(
    `SELECT
       s.id AS session_id,
       s.token_hash,
       s.expires_at,
       u.id,
       u.email,
       u.email_verified_at,
       u.status,
       u.metadata_json,
       u.created_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ? AND u.status = 'active'
     LIMIT 1`,
  )
    .bind(tokenHash, now)
    .first();

  if (!row) {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    return null;
  }

  if (touch) {
    await env.DB.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?")
      .bind(now, row.session_id)
      .run()
      .catch(() => {});
  }

  return { user: publicUser(row), sessionId: row.session_id, tokenHash, expiresAt: row.expires_at };
}

export async function requireSession(request, env) {
  const session = await getSession(request, env);
  if (!session) {
    const error = new Error("Authentication required");
    error.status = 401;
    throw error;
  }
  return session;
}

export async function deleteSession(request, env) {
  const cookies = parseCookies(request);
  const rawToken = cookies.get(PRODUCTION_COOKIE) || cookies.get(DEVELOPMENT_COOKIE);
  if (!rawToken) return;
  const tokenHash = await sha256(rawToken);
  await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}

export async function enforceRateLimit(env, key, limit, windowSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const nextReset = now + windowSeconds;
  const [, readResult] = await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO rate_limits (rate_key, request_count, reset_at)
       VALUES (?, 1, ?)
       ON CONFLICT(rate_key) DO UPDATE SET
         request_count = CASE WHEN reset_at <= ? THEN 1 ELSE request_count + 1 END,
         reset_at = CASE WHEN reset_at <= ? THEN ? ELSE reset_at END`,
    ).bind(key, nextReset, now, now, nextReset),
    env.DB.prepare(
      "SELECT request_count, reset_at FROM rate_limits WHERE rate_key = ? LIMIT 1",
    ).bind(key),
  ]);
  const row = readResult?.results?.[0] || null;

  if (Number(row?.request_count || 0) > limit) {
    const error = new Error("Too many requests. Please try again later.");
    error.status = 429;
    error.retryAfter = Math.max(1, Number(row.reset_at) - now);
    throw error;
  }

  return row;
}
