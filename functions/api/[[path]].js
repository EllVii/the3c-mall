const SESSION_COOKIE = "threec_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;
// Cloudflare Workers caps a single PBKDF2 operation at 100,000 iterations.
// Keep new hashes within that limit so credential verification cannot crash
// after a matching account is found.
const PASSWORD_ITERATIONS = 100000;
const MAX_PASSWORD_ITERATIONS = 100000;
const MAX_JSON_BYTES = 64 * 1024;
const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
let authSchemaReady = false;

async function ensureAuthSchema(env) {
  if (authSchemaReady) return;

  // Pages deployments do not automatically apply D1 migration files. Keep the
  // authentication boundary self-healing so a fresh or partially initialized
  // production database cannot turn every login into an opaque HTTP 500.
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      password_iterations INTEGER NOT NULL DEFAULT 100000,
      email_verified_at TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'deleted')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      user_agent_hash TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS account_access (
      user_id TEXT PRIMARY KEY,
      approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
      full_name TEXT,
      request_reason TEXT,
      requested_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      decided_at TEXT,
      decision_note TEXT,
      decided_by TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(
      "CREATE INDEX IF NOT EXISTS idx_account_access_status_requested ON account_access(approval_status, requested_at)",
    ),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS rate_limits (
      rate_key TEXT PRIMARY KEY,
      window_start INTEGER NOT NULL,
      request_count INTEGER NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS auth_rate_limits_v2 (
      rate_key TEXT PRIMARY KEY,
      window_start INTEGER NOT NULL,
      request_count INTEGER NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      actor_user_id TEXT,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
    )`),
  ]);

  // CREATE TABLE IF NOT EXISTS cannot repair an older table that already
  // exists with fewer columns. Upgrade those legacy tables in place so the
  // current queries work while preserving all existing accounts and rows.
  const requiredColumns = {
    users: {
      password_hash: "TEXT",
      password_salt: "TEXT",
      password_iterations: "INTEGER DEFAULT 100000",
      email_verified_at: "TEXT",
      status: "TEXT DEFAULT 'active'",
      created_at: "TEXT",
      updated_at: "TEXT",
    },
    rate_limits: {
      rate_key: "TEXT",
      window_start: "INTEGER DEFAULT 0",
      request_count: "INTEGER DEFAULT 0",
      updated_at: "TEXT",
    },
  };

  for (const [table, columns] of Object.entries(requiredColumns)) {
    const schema = await env.DB.prepare(`PRAGMA table_info(${table})`).all();
    const existing = new Set((schema.results || []).map((column) => column.name));
    for (const [column, definition] of Object.entries(columns)) {
      if (!existing.has(column)) {
        await env.DB.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
      }
    }
  }

  // Accounts that existed before approval controls were introduced are known
  // users and remain approved. New signups explicitly insert a pending row in
  // the same database batch as their user record.
  await env.DB.prepare(
    `INSERT OR IGNORE INTO account_access (
      user_id, approval_status, requested_at, decided_at, decided_by
    )
    SELECT
      id,
      'approved',
      COALESCE(created_at, CURRENT_TIMESTAMP),
      COALESCE(updated_at, CURRENT_TIMESTAMP),
      'legacy_migration'
    FROM users`,
  ).run();

  authSchemaReady = true;
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}

function error(message, status = 400, code = "bad_request") {
  return json({ error: message, code }, status);
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function bytesToHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return new Uint8Array();
  const result = new Uint8Array(hex.length / 2);
  for (let index = 0; index < result.length; index += 1) {
    result[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return result;
}

function base64UrlToBytes(value) {
  const encoded = String(value || "");
  if (!/^[a-zA-Z0-9_-]+$/.test(encoded)) return new Uint8Array();
  try {
    const normalized = encoded.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return new Uint8Array();
  }
}

function timingSafeEqual(left, right) {
  const a = typeof left === "string" ? new TextEncoder().encode(left) : left;
  const b = typeof right === "string" ? new TextEncoder().encode(right) : right;
  let mismatch = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    mismatch |= (a[index % Math.max(a.length, 1)] || 0) ^ (b[index % Math.max(b.length, 1)] || 0);
  }
  return mismatch === 0;
}

async function sha256Hex(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return bytesToHex(new Uint8Array(digest));
}

function randomToken(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function validPassword(value) {
  return typeof value === "string" && value.length >= 10 && value.length <= 128;
}

function cleanText(value, maxLength) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isoAfter(seconds) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

async function hashPassword(password, saltHex = null, iterations = PASSWORD_ITERATIONS) {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  if (
    salt.length !== 16 ||
    !Number.isInteger(iterations) ||
    iterations < 1 ||
    iterations > MAX_PASSWORD_ITERATIONS
  ) {
    throw new Error("Unsupported password hash parameters");
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  );
  return {
    hash: bytesToHex(new Uint8Array(bits)),
    salt: bytesToHex(salt),
    iterations,
  };
}

async function verifyPassword(password, user) {
  const storedHash = String(user?.password_hash || "");

  // Accounts created by the first D1 authentication implementation stored a
  // single encoded value: pbkdf2_sha256$iterations$salt$hash. Preserve those
  // accounts and upgrade them after their next successful login.
  if (storedHash.startsWith("pbkdf2_sha256$")) {
    const [algorithm, iterationsText, saltText, expectedText, ...extra] = storedHash.split("$");
    const iterations = Number(iterationsText);
    const salt = base64UrlToBytes(saltText);
    const expected = base64UrlToBytes(expectedText);
    if (
      algorithm !== "pbkdf2_sha256" ||
      extra.length > 0 ||
      !Number.isInteger(iterations) ||
      iterations < 1 ||
      iterations > MAX_PASSWORD_ITERATIONS ||
      salt.length !== 16 ||
      expected.length !== 32
    ) {
      return { valid: false, needsUpgrade: false };
    }

    try {
      const derived = await hashPassword(password, bytesToHex(salt), iterations);
      const valid = timingSafeEqual(hexToBytes(derived.hash), expected);
      return { valid, needsUpgrade: valid };
    } catch {
      return { valid: false, needsUpgrade: false };
    }
  }

  const iterations = Number(user?.password_iterations);
  const salt = hexToBytes(String(user?.password_salt || ""));
  const expected = hexToBytes(storedHash);
  if (
    !Number.isInteger(iterations) ||
    iterations < 1 ||
    iterations > MAX_PASSWORD_ITERATIONS ||
    salt.length !== 16 ||
    expected.length !== 32
  ) {
    return { valid: false, needsUpgrade: false };
  }

  try {
    const derived = await hashPassword(password, bytesToHex(salt), iterations);
    const valid = timingSafeEqual(hexToBytes(derived.hash), expected);
    return { valid, needsUpgrade: valid && iterations !== PASSWORD_ITERATIONS };
  } catch {
    return { valid: false, needsUpgrade: false };
  }
}

function parseCookies(request) {
  const result = {};
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const index = part.indexOf("=");
    if (index < 1) continue;
    result[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return result;
}

function sessionCookie(token) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

async function readJson(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_JSON_BYTES) throw new Error("payload_too_large");
  const text = await request.text();
  if (text.length > MAX_JSON_BYTES) throw new Error("payload_too_large");
  if (!text) return {};
  return JSON.parse(text);
}

function allowedOrigin(request, env) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const requestOrigin = new URL(request.url).origin;
  const configured = String(env.APP_ORIGIN || requestOrigin).replace(/\/$/, "");
  return origin === requestOrigin || origin === configured;
}

function clientKey(request, suffix) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  return `${suffix}:${ip}`;
}

async function checkRateLimit(env, key, limit, windowSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % windowSeconds);
  const existing = await env.DB.prepare(
    "SELECT window_start, request_count FROM auth_rate_limits_v2 WHERE rate_key = ?",
  ).bind(key).first();
  if (existing) {
    await env.DB.prepare(
      `UPDATE auth_rate_limits_v2
       SET request_count = CASE WHEN window_start = ? THEN request_count + 1 ELSE 1 END,
           window_start = ?, updated_at = CURRENT_TIMESTAMP
       WHERE rate_key = ?`,
    ).bind(windowStart, windowStart, key).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO auth_rate_limits_v2 (rate_key, window_start, request_count, updated_at)
       VALUES (?, ?, 1, CURRENT_TIMESTAMP)`,
    ).bind(key, windowStart).run();
  }
  const row = await env.DB.prepare(
    "SELECT window_start, request_count FROM auth_rate_limits_v2 WHERE rate_key = ?",
  ).bind(key).first();
  return row && Number(row.window_start) === windowStart && Number(row.request_count) <= limit;
}

async function audit(env, action, actorUserId = null, targetType = null, targetId = null, metadata = {}) {
  try {
    await env.DB.prepare(
      `INSERT INTO audit_log (id, actor_user_id, action, target_type, target_id, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), actorUserId, action, targetType, targetId, JSON.stringify(metadata)).run();
  } catch (auditError) {
    console.error("Audit log failure", auditError);
  }
}

async function currentUser(request, env, { required = false } = {}) {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) {
    if (required) throw new Response(JSON.stringify({ error: "Authentication required", code: "unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    return null;
  }
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT
       users.id,
       users.email,
       users.email_verified_at,
       users.status,
       COALESCE(account_access.approval_status, 'approved') AS approval_status,
       sessions.id AS session_id
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     LEFT JOIN account_access ON account_access.user_id = users.id
     WHERE sessions.token_hash = ?
       AND sessions.expires_at > CURRENT_TIMESTAMP
       AND users.status = 'active'
       AND COALESCE(account_access.approval_status, 'approved') = 'approved'`,
  ).bind(tokenHash).first();
  if (!row) {
    if (required) throw new Response(JSON.stringify({ error: "Authentication required", code: "unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
    return null;
  }
  env.DB.prepare("UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id = ?").bind(row.session_id).run().catch(() => {});
  return row;
}

async function createSession(env, userId) {
  const token = randomToken(32);
  const tokenHash = await sha256Hex(token);
  // Use columns shared by both the original and current sessions schemas.
  // The legacy table stores user-agent data under a different column name.
  await env.DB.prepare(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at)
     VALUES (?, ?, ?, ?)`,
  ).bind(crypto.randomUUID(), userId, tokenHash, isoAfter(SESSION_TTL_SECONDS)).run();
  return token;
}

async function sendTransactionalEmail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY) return { sent: false, reason: "email_not_configured" };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL || "3C Mall <no-reply@the3cmall.app>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!response.ok) {
    console.error("Email delivery failed", response.status, await response.text());
    return { sent: false, reason: "delivery_failed" };
  }
  return { sent: true };
}

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    emailVerified: Boolean(row.email_verified_at),
    approvalStatus: row.approval_status || "approved",
  };
}

async function handleSignup(request, env) {
  if (!(await checkRateLimit(env, clientKey(request, "signup"), 5, 3600))) return error("Too many attempts", 429, "rate_limited");
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const fullName = cleanText(body.metadata?.fullName, 100);
  const requestReason = cleanText(body.metadata?.reason, 500);
  if (!validEmail(email)) return error("Enter a valid email address");
  if (!validPassword(body.password)) return error("Password must be 10 to 128 characters");
  if (fullName.length < 2) return error("Enter your full name");

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) {
    return json({
      ok: true,
      message: "If the address is eligible, access-request instructions will be sent.",
    }, 202);
  }

  const userId = crypto.randomUUID();
  const password = await hashPassword(body.password);
  const rawToken = randomToken(32);
  const tokenHash = await sha256Hex(rawToken);
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, password_salt, password_iterations)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(userId, email, password.hash, password.salt, password.iterations),
    env.DB.prepare(
      `INSERT INTO account_access (
        user_id, approval_status, full_name, request_reason, requested_at
      ) VALUES (?, 'pending', ?, ?, CURRENT_TIMESTAMP)`,
    ).bind(userId, fullName, requestReason || null),
    env.DB.prepare(
      `INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), userId, tokenHash, isoAfter(60 * 60 * 24)),
  ]);

  const origin = String(env.APP_ORIGIN || new URL(request.url).origin).replace(/\/$/, "");
  const verificationUrl = `${origin}/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
  const delivery = await sendTransactionalEmail(env, {
    to: email,
    subject: "Confirm your 3C Mall access request",
    html: `<p>Confirm your email for your 3C Mall access request.</p><p><a href="${verificationUrl}">Confirm email</a></p><p>This link expires in 24 hours. Confirming your email does not grant access; your request must also be approved.</p>`,
  });

  let adminNotification = { sent: false, reason: "admin_email_not_configured" };
  const adminEmail = normalizeEmail(env.ADMIN_NOTIFICATION_EMAIL);
  if (validEmail(adminEmail)) {
    const reviewUrl = `${origin}/admin/access-requests`;
    adminNotification = await sendTransactionalEmail(env, {
      to: adminEmail,
      subject: "New 3C Mall access request",
      html: `<p>A new access request is ready for review.</p><p><strong>Name:</strong> ${escapeHtml(fullName)}<br><strong>Email:</strong> ${escapeHtml(email)}${requestReason ? `<br><strong>Reason:</strong> ${escapeHtml(requestReason)}` : ""}</p><p><a href="${reviewUrl}">Review access requests</a></p>`,
    });
  }

  await audit(env, "auth.access_requested", userId, "user", userId, {
    verificationDelivery: delivery.sent,
    adminNotification: adminNotification.sent,
  });
  const response = {
    ok: true,
    status: "pending",
    message: "Access request received. Confirm your email, then wait for approval. We will email you after your request is reviewed.",
    emailDeliveryConfigured: Boolean(env.RESEND_API_KEY),
  };
  if (env.PILOT_SHOW_AUTH_LINKS === "true") response.verificationUrl = verificationUrl;
  return json(response, 202);
}

async function handleVerifyEmail(request, env) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!token) return error("Verification token is required");
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT id, user_id FROM email_verification_tokens
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP`,
  ).bind(tokenHash).first();
  if (!row) return error("Verification link is invalid or expired", 400, "invalid_token");
  await env.DB.batch([
    env.DB.prepare("UPDATE email_verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?").bind(row.id),
    env.DB.prepare("UPDATE users SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(row.user_id),
  ]);
  await audit(env, "auth.email_verified", row.user_id, "user", row.user_id);
  const origin = String(env.APP_ORIGIN || new URL(request.url).origin).replace(/\/$/, "");
  return Response.redirect(`${origin}/login?verified=1`, 302);
}

async function handleLogin(request, env) {
  if (!(await checkRateLimit(env, clientKey(request, "login"), 15, 900))) return error("Too many attempts", 429, "rate_limited");
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const user = await env.DB.prepare(
    `SELECT
       users.id,
       users.email,
       users.password_hash,
       users.password_salt,
       users.password_iterations,
       users.email_verified_at,
       users.status,
       COALESCE(account_access.approval_status, 'approved') AS approval_status
     FROM users
     LEFT JOIN account_access ON account_access.user_id = users.id
     WHERE users.email = ?`,
  ).bind(email).first();
  const password = String(body.password || "");
  const passwordCheck = user && user.status === "active"
    ? await verifyPassword(password, user)
    : { valid: false, needsUpgrade: false };
  if (!passwordCheck.valid) {
    await audit(env, "auth.login_failed", user?.id || null, "user", user?.id || null);
    return error("Email or password is incorrect", 401, "invalid_credentials");
  }
  if (user.approval_status === "pending") {
    await audit(env, "auth.login_pending_approval", user.id, "user", user.id);
    return error(
      "Your access request is still being reviewed. We will email you after a decision.",
      403,
      "approval_pending",
    );
  }
  if (user.approval_status !== "approved") {
    await audit(env, "auth.login_not_approved", user.id, "user", user.id);
    return error(
      "This access request was not approved. Contact 3C Mall support if you believe this is a mistake.",
      403,
      "access_not_approved",
    );
  }
  if (!user.email_verified_at) return error("Verify your email before logging in", 403, "email_not_verified");
  if (passwordCheck.needsUpgrade) {
    const upgraded = await hashPassword(password);
    await env.DB.prepare(
      `UPDATE users
       SET password_hash = ?, password_salt = ?, password_iterations = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    ).bind(upgraded.hash, upgraded.salt, upgraded.iterations, user.id).run();
  }
  const token = await createSession(env, user.id);
  await audit(env, "auth.login", user.id, "session", null);
  return json({ user: publicUser(user) }, 200, { "set-cookie": sessionCookie(token) });
}

async function handleLogout(request, env) {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (token) {
    const tokenHash = await sha256Hex(token);
    const session = await env.DB.prepare("SELECT id, user_id FROM sessions WHERE token_hash = ?").bind(tokenHash).first();
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
    await audit(env, "auth.logout", session?.user_id || null, "session", session?.id || null);
  }
  return json({ ok: true }, 200, { "set-cookie": clearSessionCookie() });
}

async function handleSession(request, env) {
  const user = await currentUser(request, env);
  return json({ user: user ? publicUser(user) : null });
}

async function handlePasswordResetRequest(request, env) {
  if (!(await checkRateLimit(env, clientKey(request, "password-reset"), 8, 3600))) return error("Too many attempts", 429, "rate_limited");
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const user = validEmail(email)
    ? await env.DB.prepare(
      `SELECT users.id, users.email
       FROM users
       LEFT JOIN account_access ON account_access.user_id = users.id
       WHERE users.email = ?
         AND users.status = 'active'
         AND COALESCE(account_access.approval_status, 'approved') = 'approved'`,
    ).bind(email).first()
    : null;
  let resetUrl = null;
  if (user) {
    const rawToken = randomToken(32);
    const tokenHash = await sha256Hex(rawToken);
    await env.DB.prepare(
      `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), user.id, tokenHash, isoAfter(3600)).run();
    const origin = String(env.APP_ORIGIN || new URL(request.url).origin).replace(/\/$/, "");
    resetUrl = `${origin}/login?resetToken=${encodeURIComponent(rawToken)}`;
    await sendTransactionalEmail(env, {
      to: user.email,
      subject: "Reset your 3C Mall password",
      html: `<p>Use the link below to reset your password.</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in one hour.</p>`,
    });
    await audit(env, "auth.password_reset_requested", user.id, "user", user.id);
  }
  const response = { ok: true, message: "If the address exists, reset instructions will be sent." };
  if (env.PILOT_SHOW_AUTH_LINKS === "true" && resetUrl) response.resetUrl = resetUrl;
  return json(response, 202);
}

async function handlePasswordReset(request, env) {
  const body = await readJson(request);
  if (!validPassword(body.password)) return error("Password must be 10 to 128 characters");
  const tokenHash = await sha256Hex(String(body.token || ""));
  const row = await env.DB.prepare(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP`,
  ).bind(tokenHash).first();
  if (!row) return error("Reset token is invalid or expired", 400, "invalid_token");
  const password = await hashPassword(body.password);
  await env.DB.batch([
    env.DB.prepare("UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?").bind(row.id),
    env.DB.prepare("UPDATE users SET password_hash = ?, password_salt = ?, password_iterations = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(password.hash, password.salt, password.iterations, row.user_id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(row.user_id),
  ]);
  await audit(env, "auth.password_reset_completed", row.user_id, "user", row.user_id);
  return json({ ok: true });
}

async function handleChangePassword(request, env) {
  const user = await currentUser(request, env, { required: true });
  const body = await readJson(request);
  if (!validPassword(body.password)) return error("Password must be 10 to 128 characters");
  const password = await hashPassword(body.password);
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET password_hash = ?, password_salt = ?, password_iterations = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(password.hash, password.salt, password.iterations, user.id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ? AND id <> ?").bind(user.id, user.session_id),
  ]);
  await audit(env, "auth.password_changed", user.id, "user", user.id);
  return json({ ok: true });
}

function validProfileKey(value) {
  return /^[a-zA-Z0-9._-]{1,80}$/.test(String(value || ""));
}

async function handleProfile(request, env) {
  const user = await currentUser(request, env, { required: true });
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!validProfileKey(key)) return error("A valid profile key is required");
  if (request.method === "GET") {
    const row = await env.DB.prepare(
      "SELECT value_json, updated_at FROM user_profile_data WHERE user_id = ? AND profile_key = ?",
    ).bind(user.id, key).first();
    return json({ key, value: row ? JSON.parse(row.value_json) : null, updatedAt: row?.updated_at || null });
  }
  const body = await readJson(request);
  const serialized = JSON.stringify(body.value ?? null);
  if (serialized.length > MAX_JSON_BYTES) return error("Profile value is too large", 413, "payload_too_large");
  await env.DB.prepare(
    `INSERT INTO user_profile_data (user_id, profile_key, value_json, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id, profile_key) DO UPDATE SET value_json = excluded.value_json, updated_at = CURRENT_TIMESTAMP`,
  ).bind(user.id, key, serialized).run();
  await audit(env, "profile.updated", user.id, "profile", key);
  return json({ ok: true, key });
}

async function handleConsent(request, env) {
  const user = await currentUser(request, env, { required: true });
  if (request.method === "GET") {
    const row = await env.DB.prepare(
      "SELECT family_code, consent_version, consented_at, withdrawn_at FROM pilot_consents WHERE user_id = ?",
    ).bind(user.id).first();
    return json({ consent: row || null });
  }
  const body = await readJson(request);
  if (body.accepted !== true && body.withdraw !== true) return error("Consent acceptance or withdrawal is required");
  if (body.withdraw === true) {
    await env.DB.prepare("UPDATE pilot_consents SET withdrawn_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?").bind(user.id).run();
    await audit(env, "pilot.consent_withdrawn", user.id, "pilot_consent", user.id);
    return json({ ok: true, withdrawn: true });
  }
  const version = String(body.consentVersion || "phase-i-v1").slice(0, 80);
  const familyCode = body.familyCode ? String(body.familyCode).trim().slice(0, 40) : null;
  await env.DB.prepare(
    `INSERT INTO pilot_consents (user_id, family_code, consent_version, consented_at, withdrawn_at, updated_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id) DO UPDATE SET family_code = excluded.family_code, consent_version = excluded.consent_version,
       consented_at = CURRENT_TIMESTAMP, withdrawn_at = NULL, updated_at = CURRENT_TIMESTAMP`,
  ).bind(user.id, familyCode, version).run();
  await audit(env, "pilot.consent_accepted", user.id, "pilot_consent", user.id, { version });
  return json({ ok: true, accepted: true, consentVersion: version });
}

async function requireActiveConsent(userId, env) {
  const consent = await env.DB.prepare(
    "SELECT family_code FROM pilot_consents WHERE user_id = ? AND withdrawn_at IS NULL",
  ).bind(userId).first();
  if (!consent) throw new Response(JSON.stringify({ error: "Active pilot consent is required", code: "consent_required" }), { status: 403, headers: { "content-type": "application/json" } });
  return consent;
}

async function handlePilotEvent(request, env) {
  const user = await currentUser(request, env, { required: true });
  await requireActiveConsent(user.id, env);
  const body = await readJson(request);
  const eventName = String(body.eventName || "").trim();
  if (!/^[a-z0-9._-]{1,80}$/i.test(eventName)) return error("A valid event name is required");
  const properties = body.properties && typeof body.properties === "object" ? body.properties : {};
  const serialized = JSON.stringify(properties);
  if (serialized.length > 16 * 1024) return error("Event properties are too large", 413, "payload_too_large");
  await env.DB.prepare(
    `INSERT INTO pilot_events (id, user_id, event_name, event_version, properties_json)
     VALUES (?, ?, ?, ?, ?)`,
  ).bind(crypto.randomUUID(), user.id, eventName, Number(body.eventVersion || 1), serialized).run();
  return json({ ok: true }, 201);
}

function boundedInteger(value, minimum, maximum, nullable = true) {
  if (value === null || value === undefined || value === "") return nullable ? null : minimum;
  const number = Number(value);
  if (!Number.isInteger(number) || number < minimum || number > maximum) throw new Error("invalid_number");
  return number;
}

async function handlePilotFeedback(request, env) {
  const user = await currentUser(request, env, { required: true });
  await requireActiveConsent(user.id, env);
  const body = await readJson(request);
  let values;
  try {
    values = {
      week: boundedInteger(body.weekNumber, 0, 60),
      beforeMinutes: boundedInteger(body.planningMinutesBefore, 0, 10080),
      afterMinutes: boundedInteger(body.planningMinutesAfter, 0, 10080),
      stressBefore: boundedInteger(body.planningStressBefore, 0, 10),
      stressAfter: boundedInteger(body.planningStressAfter, 0, 10),
      confidence: boundedInteger(body.confidenceScore, 0, 10),
      savedMinutes: boundedInteger(body.timeSavedMinutes, -10080, 10080),
      savingsCents: boundedInteger(body.estimatedSavingsCents, -10000000, 10000000),
    };
  } catch {
    return error("One or more numeric values are outside the allowed range");
  }
  const notes = body.notes ? String(body.notes).slice(0, 4000) : null;
  const technicalError = body.technicalError ? String(body.technicalError).slice(0, 2000) : null;
  const mealCompletion = body.mealCompletion ? String(body.mealCompletion).slice(0, 40) : null;
  await env.DB.prepare(
    `INSERT INTO pilot_feedback (
      id, user_id, week_number, planning_minutes_before, planning_minutes_after,
      planning_stress_before, planning_stress_after, confidence_score,
      time_saved_minutes, estimated_savings_cents, meal_completion, notes, technical_error
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    crypto.randomUUID(), user.id, values.week, values.beforeMinutes, values.afterMinutes,
    values.stressBefore, values.stressAfter, values.confidence, values.savedMinutes,
    values.savingsCents, mealCompletion, notes, technicalError,
  ).run();
  await audit(env, "pilot.feedback_submitted", user.id, "pilot_feedback", null, { week: values.week });
  return json({ ok: true }, 201);
}

async function handleReceiptUpload(request, env) {
  const user = await currentUser(request, env, { required: true });
  const consent = await requireActiveConsent(user.id, env);
  if (!env.RECEIPTS) return error("Receipt storage is not configured", 503, "storage_not_configured");
  const form = await request.formData();
  const file = form.get("receipt");
  if (!(file instanceof File)) return error("A receipt file is required");
  if (file.size < 1 || file.size > MAX_RECEIPT_BYTES) return error("Receipt must be between 1 byte and 10 MB");
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
  if (!allowedTypes.has(file.type)) return error("Receipt must be JPEG, PNG, WebP, or PDF");
  const retailer = String(form.get("retailer") || "").trim().slice(0, 120);
  const receiptDate = String(form.get("receiptDate") || "").trim();
  if (!retailer || !/^\d{4}-\d{2}-\d{2}$/.test(receiptDate)) return error("Retailer and receipt date are required");
  const requestedCents = Number.parseInt(String(form.get("requestedReimbursementCents") || "0"), 10);
  if (!Number.isInteger(requestedCents) || requestedCents < 0 || requestedCents > 50000) return error("Requested reimbursement must be between $0 and $500");
  const receiptId = crypto.randomUUID();
  const extension = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1].replace("jpeg", "jpg");
  const objectKey = `phase-i/${user.id}/${receiptId}.${extension}`;
  await env.RECEIPTS.put(objectKey, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { userId: user.id, receiptId, familyCode: consent.family_code || "" },
  });
  await env.DB.prepare(
    `INSERT INTO pilot_receipts (
      id, user_id, family_code, retailer, receipt_date, object_key,
      content_type, size_bytes, requested_reimbursement_cents
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(receiptId, user.id, consent.family_code || null, retailer, receiptDate, objectKey, file.type, file.size, requestedCents).run();
  await audit(env, "pilot.receipt_submitted", user.id, "pilot_receipt", receiptId, { requestedCents });
  return json({ ok: true, receiptId, status: "submitted" }, 201);
}

async function handleWaitlist(request, env) {
  if (!(await checkRateLimit(env, clientKey(request, "waitlist"), 20, 3600))) return error("Too many attempts", 429, "rate_limited");
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  if (!validEmail(email)) return error("Enter a valid email address");
  await env.DB.prepare(
    `INSERT INTO waitlist (id, email, referrer, source)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET referrer = excluded.referrer`,
  ).bind(crypto.randomUUID(), email, String(body.referrer || "").slice(0, 500) || null, String(body.source || "website").slice(0, 80)).run();
  return json({ ok: true }, 201);
}

function hasAdminAccess(request, env) {
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  return Boolean(env.ADMIN_API_TOKEN) && timingSafeEqual(supplied, env.ADMIN_API_TOKEN);
}

async function handleAdminAccessRequests(request, env) {
  if (!hasAdminAccess(request, env)) return error("Unauthorized", 401, "unauthorized");

  const url = new URL(request.url);
  const requestedStatus = String(url.searchParams.get("status") || "pending").toLowerCase();
  const allowedStatuses = new Set(["pending", "approved", "rejected", "all"]);
  if (!allowedStatuses.has(requestedStatus)) {
    return error("Status must be pending, approved, rejected, or all");
  }

  const rawLimit = Number.parseInt(url.searchParams.get("limit") || "100", 10);
  const limit = Math.min(Math.max(Number.isFinite(rawLimit) ? rawLimit : 100, 1), 200);
  const query = requestedStatus === "all"
    ? env.DB.prepare(
      `SELECT
         users.id AS user_id,
         users.email,
         users.email_verified_at,
         users.status AS account_status,
         account_access.approval_status,
         account_access.full_name,
         account_access.request_reason,
         account_access.requested_at,
         account_access.decided_at,
         account_access.decision_note,
         account_access.decided_by
       FROM account_access
       JOIN users ON users.id = account_access.user_id
       ORDER BY
         CASE account_access.approval_status WHEN 'pending' THEN 0 ELSE 1 END,
         datetime(account_access.requested_at) DESC
       LIMIT ?`,
    ).bind(limit)
    : env.DB.prepare(
      `SELECT
         users.id AS user_id,
         users.email,
         users.email_verified_at,
         users.status AS account_status,
         account_access.approval_status,
         account_access.full_name,
         account_access.request_reason,
         account_access.requested_at,
         account_access.decided_at,
         account_access.decision_note,
         account_access.decided_by
       FROM account_access
       JOIN users ON users.id = account_access.user_id
       WHERE account_access.approval_status = ?
       ORDER BY datetime(account_access.requested_at) DESC
       LIMIT ?`,
    ).bind(requestedStatus, limit);

  const [rows, groupedCounts] = await Promise.all([
    query.all(),
    env.DB.prepare(
      `SELECT approval_status, COUNT(*) AS count
       FROM account_access
       GROUP BY approval_status`,
    ).all(),
  ]);
  const counts = { pending: 0, approved: 0, rejected: 0 };
  for (const item of groupedCounts.results || []) {
    if (Object.hasOwn(counts, item.approval_status)) {
      counts[item.approval_status] = Number(item.count || 0);
    }
  }

  return json({
    counts,
    requests: (rows.results || []).map((row) => ({
      userId: row.user_id,
      email: row.email,
      emailVerified: Boolean(row.email_verified_at),
      accountStatus: row.account_status,
      approvalStatus: row.approval_status,
      fullName: row.full_name || "",
      reason: row.request_reason || "",
      requestedAt: row.requested_at,
      decidedAt: row.decided_at,
      decisionNote: row.decision_note || "",
      decidedBy: row.decided_by || "",
    })),
  });
}

async function handleAdminReviewAccessRequest(request, env) {
  if (!hasAdminAccess(request, env)) return error("Unauthorized", 401, "unauthorized");

  const body = await readJson(request);
  const userId = cleanText(body.userId, 100);
  const decision = String(body.decision || "").toLowerCase();
  const decisionNote = cleanText(body.note, 500);
  if (!userId) return error("User ID is required");
  if (!["approved", "rejected"].includes(decision)) {
    return error("Decision must be approved or rejected");
  }

  const accessRequest = await env.DB.prepare(
    `SELECT
       users.id,
       users.email,
       users.email_verified_at,
       users.status AS account_status,
       account_access.approval_status,
       account_access.full_name
     FROM account_access
     JOIN users ON users.id = account_access.user_id
     WHERE users.id = ?`,
  ).bind(userId).first();
  if (!accessRequest) return error("Access request not found", 404, "not_found");
  if (accessRequest.account_status !== "active") {
    return error("This account is not active", 409, "account_inactive");
  }

  const origin = String(env.APP_ORIGIN || new URL(request.url).origin).replace(/\/$/, "");
  const statements = [
    env.DB.prepare(
      `UPDATE account_access
       SET approval_status = ?,
           decided_at = CURRENT_TIMESTAMP,
           decision_note = ?,
           decided_by = 'admin_api'
       WHERE user_id = ?`,
    ).bind(decision, decisionNote || null, userId),
  ];

  let verificationUrl = null;
  if (decision === "approved" && !accessRequest.email_verified_at) {
    const rawToken = randomToken(32);
    const tokenHash = await sha256Hex(rawToken);
    verificationUrl = `${origin}/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
    statements.push(
      env.DB.prepare(
        `UPDATE email_verification_tokens
         SET used_at = COALESCE(used_at, CURRENT_TIMESTAMP)
         WHERE user_id = ? AND used_at IS NULL`,
      ).bind(userId),
      env.DB.prepare(
        `INSERT INTO email_verification_tokens (id, user_id, token_hash, expires_at)
         VALUES (?, ?, ?, ?)`,
      ).bind(crypto.randomUUID(), userId, tokenHash, isoAfter(60 * 60 * 24)),
    );
  }
  if (decision === "rejected") {
    statements.push(env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId));
  }
  await env.DB.batch(statements);

  const signInUrl = `${origin}/login`;
  const delivery = decision === "approved"
    ? await sendTransactionalEmail(env, {
      to: accessRequest.email,
      subject: "Your 3C Mall access is approved",
      html: verificationUrl
        ? `<p>Your 3C Mall access request has been approved.</p><p><a href="${verificationUrl}">Confirm your email and finish access</a></p><p>This confirmation link expires in 24 hours.</p>`
        : `<p>Your 3C Mall access request has been approved.</p><p><a href="${signInUrl}">Sign in to 3C Mall</a></p>`,
    })
    : await sendTransactionalEmail(env, {
      to: accessRequest.email,
      subject: "Update on your 3C Mall access request",
      html: "<p>Your 3C Mall access request was reviewed and was not approved at this time.</p><p>If you believe this was a mistake, please contact 3C Mall support.</p>",
    });

  await audit(
    env,
    decision === "approved" ? "admin.access_approved" : "admin.access_rejected",
    null,
    "user",
    userId,
    {
      previousStatus: accessRequest.approval_status,
      notificationSent: delivery.sent,
    },
  );

  const response = {
    ok: true,
    request: {
      userId,
      email: accessRequest.email,
      fullName: accessRequest.full_name || "",
      approvalStatus: decision,
      emailVerified: Boolean(accessRequest.email_verified_at),
    },
    notificationSent: delivery.sent,
  };
  if (env.PILOT_SHOW_AUTH_LINKS === "true" && verificationUrl) {
    response.verificationUrl = verificationUrl;
  }
  return json(response);
}

async function handleAdminSummary(request, env) {
  if (!hasAdminAccess(request, env)) return error("Unauthorized", 401, "unauthorized");
  const [users, verified, pending, rejected, consents, events, feedback, receipts, reimbursement, waitlist] = await Promise.all([
    env.DB.prepare(
      `SELECT COUNT(*) AS count
       FROM users
       LEFT JOIN account_access ON account_access.user_id = users.id
       WHERE users.status = 'active'
         AND COALESCE(account_access.approval_status, 'approved') = 'approved'`,
    ).first(),
    env.DB.prepare(
      `SELECT COUNT(*) AS count
       FROM users
       LEFT JOIN account_access ON account_access.user_id = users.id
       WHERE users.email_verified_at IS NOT NULL
         AND users.status = 'active'
         AND COALESCE(account_access.approval_status, 'approved') = 'approved'`,
    ).first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM account_access WHERE approval_status = 'pending'").first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM account_access WHERE approval_status = 'rejected'").first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM pilot_consents WHERE withdrawn_at IS NULL").first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM pilot_events").first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM pilot_feedback").first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM pilot_receipts").first(),
    env.DB.prepare("SELECT COALESCE(SUM(approved_reimbursement_cents), 0) AS cents FROM pilot_receipts WHERE status IN ('approved', 'partially_approved', 'paid')").first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM waitlist").first(),
  ]);
  const weekly = await env.DB.prepare(
    `SELECT week_number,
      COUNT(*) AS responses,
      ROUND(AVG(planning_minutes_before), 1) AS avg_minutes_before,
      ROUND(AVG(planning_minutes_after), 1) AS avg_minutes_after,
      ROUND(AVG(planning_stress_before), 2) AS avg_stress_before,
      ROUND(AVG(planning_stress_after), 2) AS avg_stress_after,
      ROUND(AVG(confidence_score), 2) AS avg_confidence
     FROM pilot_feedback GROUP BY week_number ORDER BY week_number`,
  ).all();
  return json({
    generatedAt: new Date().toISOString(),
    totals: {
      users: Number(users?.count || 0),
      verifiedUsers: Number(verified?.count || 0),
      pendingAccessRequests: Number(pending?.count || 0),
      rejectedAccessRequests: Number(rejected?.count || 0),
      activeConsents: Number(consents?.count || 0),
      events: Number(events?.count || 0),
      feedbackResponses: Number(feedback?.count || 0),
      receipts: Number(receipts?.count || 0),
      approvedReimbursementCents: Number(reimbursement?.cents || 0),
      waitlist: Number(waitlist?.count || 0),
    },
    weekly: weekly.results || [],
  });
}

async function handleHealth(env) {
  const started = Date.now();
  const row = await env.DB.prepare("SELECT 1 AS ok").first();
  return json({
    ok: Number(row?.ok || 0) === 1,
    service: "3c-mall-pages-functions",
    database: "cloudflare-d1",
    receiptStorageConfigured: Boolean(env.RECEIPTS),
    emailConfigured: Boolean(env.RESEND_API_KEY),
    latencyMs: Date.now() - started,
    timestamp: new Date().toISOString(),
  });
}

async function route(request, env) {
  if (!env.DB) return error("D1 binding DB is not configured", 503, "database_not_configured");
  await ensureAuthSchema(env);
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && !allowedOrigin(request, env)) {
    return error("Origin is not allowed", 403, "origin_rejected");
  }
  const pathname = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
  const key = `${request.method} ${pathname}`;
  switch (key) {
    case "POST /api/auth/signup": return handleSignup(request, env);
    case "GET /api/auth/verify-email": return handleVerifyEmail(request, env);
    case "POST /api/auth/login": return handleLogin(request, env);
    case "POST /api/auth/logout": return handleLogout(request, env);
    case "GET /api/auth/session": return handleSession(request, env);
    case "POST /api/auth/request-password-reset": return handlePasswordResetRequest(request, env);
    case "POST /api/auth/reset-password": return handlePasswordReset(request, env);
    case "POST /api/auth/change-password": return handleChangePassword(request, env);
    case "GET /api/profile":
    case "PUT /api/profile": return handleProfile(request, env);
    case "GET /api/pilot/consent":
    case "POST /api/pilot/consent": return handleConsent(request, env);
    case "POST /api/pilot/events": return handlePilotEvent(request, env);
    case "POST /api/pilot/feedback": return handlePilotFeedback(request, env);
    case "POST /api/pilot/receipts": return handleReceiptUpload(request, env);
    case "POST /api/report/waitlist": return handleWaitlist(request, env);
    case "GET /api/admin/access-requests": return handleAdminAccessRequests(request, env);
    case "PATCH /api/admin/access-requests": return handleAdminReviewAccessRequest(request, env);
    case "GET /api/admin/pilot-summary": return handleAdminSummary(request, env);
    case "GET /api/health":
    case "GET /api/health/d1": return handleHealth(env);
    default: return error("API route not found", 404, "not_found");
  }
}

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-methods": "GET,POST,PUT,PATCH,OPTIONS",
        "access-control-allow-headers": "content-type,authorization",
        "access-control-max-age": "86400",
      },
    });
  }
  try {
    return await route(context.request, context.env);
  } catch (caught) {
    if (caught instanceof Response) return caught;
    if (caught?.message === "payload_too_large") return error("Request body is too large", 413, "payload_too_large");
    if (caught instanceof SyntaxError) return error("Request body must be valid JSON");
    console.error("Unhandled API error", caught);
    return error("Unexpected server error", 500, "internal_error");
  }
}
