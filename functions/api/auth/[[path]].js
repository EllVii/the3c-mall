import {
  getClientIp,
  getAppBaseUrl,
  isValidEmail,
  json,
  methodNotAllowed,
  normalizeEmail,
  readJson,
  requireSameOrigin,
  routePath,
  toErrorResponse,
} from "../../_shared/http.js";
import { hashPassword, randomToken, sha256, validatePassword, verifyPassword } from "../../_shared/crypto.js";
import {
  clearSessionCookie,
  createSession,
  deleteSession,
  enforceRateLimit,
  getSession,
  publicUser,
  requireSession,
  sessionCookie,
} from "../../_shared/auth.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../../_shared/email.js";

function ensureDatabase(env) {
  if (!env.DB) {
    const error = new Error("D1 binding DB is not configured");
    error.status = 500;
    throw error;
  }
}

function authErrorResponse(error) {
  const response = toErrorResponse(error, "Authentication request failed");
  if (error?.retryAfter) response.headers.set("retry-after", String(error.retryAfter));
  return response;
}

async function issueVerificationToken(env, userId) {
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  await env.DB.batch([
    env.DB.prepare("DELETE FROM email_verification_tokens WHERE user_id = ? AND used_at IS NULL").bind(userId),
    env.DB.prepare(
      `INSERT INTO email_verification_tokens
        (id, user_id, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), userId, tokenHash, expiresAt),
  ]);

  return { token, expiresAt };
}

async function handleSession(request, env) {
  if (request.method !== "GET") return methodNotAllowed("GET");
  const session = await getSession(request, env);
  return json({ user: session?.user || null });
}

async function handleSignup(request, env) {
  if (request.method !== "POST") return methodNotAllowed("POST");
  requireSameOrigin(request);

  const ip = getClientIp(request) || "unknown";
  await enforceRateLimit(env, `auth:signup:${ip}`, 8, 60 * 60);

  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = body.password;
  const metadata = body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
    ? body.metadata
    : {};

  if (!isValidEmail(email)) {
    const error = new Error("Enter a valid email address");
    error.status = 400;
    throw error;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    const error = new Error(passwordError);
    error.status = 400;
    throw error;
  }

  const metadataJson = JSON.stringify(metadata);
  if (metadataJson.length > 4096) {
    const error = new Error("Account metadata is too large");
    error.status = 400;
    throw error;
  }

  const existing = await env.DB.prepare(
    "SELECT id, email, email_verified_at, status, metadata_json, created_at FROM users WHERE email = ? LIMIT 1",
  )
    .bind(email)
    .first();

  if (existing?.email_verified_at && existing.status !== "deleted") {
    const error = new Error("An account already exists for this email address");
    error.status = 409;
    throw error;
  }

  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);
  const userId = existing?.id || crypto.randomUUID();

  if (existing) {
    await env.DB.prepare(
      `UPDATE users
       SET password_hash = ?, metadata_json = ?, status = 'active', updated_at = ?
       WHERE id = ?`,
    )
      .bind(passwordHash, metadataJson, now, userId)
      .run();
  } else {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO users
          (id, email, password_hash, metadata_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).bind(userId, email, passwordHash, metadataJson, now, now),
      env.DB.prepare(
        `INSERT INTO profiles (user_id, profile_json, created_at, updated_at)
         VALUES (?, ?, ?, ?)`,
      ).bind(userId, metadataJson, now, now),
    ]);
  }

  const verification = await issueVerificationToken(env, userId);
  const emailResult = await sendVerificationEmail(request, env, email, verification.token);

  const userRow = await env.DB.prepare(
    "SELECT id, email, email_verified_at, metadata_json, created_at FROM users WHERE id = ?",
  )
    .bind(userId)
    .first();

  return json(
    {
      user: publicUser(userRow),
      emailSent: emailResult.sent,
      message: emailResult.sent
        ? "Account created. Check your email to verify your account."
        : "Account created, but the verification email could not be sent. Use resend verification after email is configured.",
    },
    201,
  );
}

async function handleSignin(request, env) {
  if (request.method !== "POST") return methodNotAllowed("POST");
  requireSameOrigin(request);

  const ip = getClientIp(request) || "unknown";
  await enforceRateLimit(env, `auth:signin:${ip}`, 10, 15 * 60);

  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");

  const userRow = isValidEmail(email)
    ? await env.DB.prepare(
        `SELECT id, email, password_hash, email_verified_at, status, metadata_json, created_at
         FROM users WHERE email = ? LIMIT 1`,
      )
        .bind(email)
        .first()
    : null;

  const passwordMatches = userRow
    ? await verifyPassword(password, userRow.password_hash)
    : false;

  if (!userRow || !passwordMatches || userRow.status !== "active") {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  if (!userRow.email_verified_at) {
    const error = new Error("Please verify your email before logging in");
    error.status = 403;
    throw error;
  }

  const session = await createSession(env, request, userRow.id);
  return json(
    { user: publicUser(userRow) },
    200,
    { "set-cookie": sessionCookie(request, session.token) },
  );
}

async function handleSignout(request, env) {
  if (request.method !== "POST") return methodNotAllowed("POST");
  requireSameOrigin(request);
  await deleteSession(request, env);
  return json(
    { success: true },
    200,
    { "set-cookie": clearSessionCookie(request) },
  );
}

async function handleVerifyEmail(request, env) {
  if (request.method !== "GET") return methodNotAllowed("GET");

  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const appBaseUrl = getAppBaseUrl(request, env);
  const invalidRedirect = `${appBaseUrl}/login?verification=invalid`;

  if (!token) return Response.redirect(invalidRedirect, 302);

  const tokenHash = await sha256(token);
  const now = new Date().toISOString();
  const row = await env.DB.prepare(
    `SELECT t.id AS token_id, t.user_id, t.expires_at, t.used_at, u.status
     FROM email_verification_tokens t
     JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = ?
     LIMIT 1`,
  )
    .bind(tokenHash)
    .first();

  if (!row || row.used_at || row.expires_at <= now || row.status !== "active") {
    return Response.redirect(invalidRedirect, 302);
  }

  await env.DB.batch([
    env.DB.prepare(
      "UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?",
    ).bind(now, now, row.user_id),
    env.DB.prepare(
      "UPDATE email_verification_tokens SET used_at = ? WHERE id = ?",
    ).bind(now, row.token_id),
    env.DB.prepare(
      "DELETE FROM email_verification_tokens WHERE user_id = ? AND id <> ?",
    ).bind(row.user_id, row.token_id),
  ]);

  return Response.redirect(`${appBaseUrl}/login?verified=1`, 302);
}

async function handleResendVerification(request, env) {
  if (request.method !== "POST") return methodNotAllowed("POST");
  requireSameOrigin(request);

  const ip = getClientIp(request) || "unknown";
  await enforceRateLimit(env, `auth:resend:${ip}`, 5, 60 * 60);

  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const generic = {
    success: true,
    message: "If an unverified account exists, a new verification email has been sent.",
  };

  if (!isValidEmail(email)) return json(generic);

  const user = await env.DB.prepare(
    "SELECT id, email_verified_at, status FROM users WHERE email = ? LIMIT 1",
  )
    .bind(email)
    .first();

  if (!user || user.email_verified_at || user.status !== "active") return json(generic);

  const verification = await issueVerificationToken(env, user.id);
  await sendVerificationEmail(request, env, email, verification.token);
  return json(generic);
}

async function handleRequestPasswordReset(request, env) {
  if (request.method !== "POST") return methodNotAllowed("POST");
  requireSameOrigin(request);

  const ip = getClientIp(request) || "unknown";
  await enforceRateLimit(env, `auth:password-reset-request:${ip}`, 5, 60 * 60);

  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const generic = {
    success: true,
    message: "If an account exists for that email, password reset instructions have been sent.",
  };

  if (!isValidEmail(email)) return json(generic);

  const user = await env.DB.prepare(
    "SELECT id, status FROM users WHERE email = ? LIMIT 1",
  )
    .bind(email)
    .first();

  if (!user || user.status !== "active") return json(generic);

  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await env.DB.batch([
    env.DB.prepare("DELETE FROM password_reset_tokens WHERE user_id = ? AND used_at IS NULL").bind(user.id),
    env.DB.prepare(
      `INSERT INTO password_reset_tokens
        (id, user_id, token_hash, expires_at)
       VALUES (?, ?, ?, ?)`,
    ).bind(crypto.randomUUID(), user.id, tokenHash, expiresAt),
  ]);

  await sendPasswordResetEmail(request, env, email, token);
  return json(generic);
}

async function handleResetPassword(request, env) {
  if (request.method !== "POST") return methodNotAllowed("POST");
  requireSameOrigin(request);

  const ip = getClientIp(request) || "unknown";
  await enforceRateLimit(env, `auth:password-reset:${ip}`, 8, 60 * 60);

  const body = await readJson(request);
  const token = String(body.token || "");
  const newPassword = body.newPassword;
  const passwordError = validatePassword(newPassword);

  if (!token || passwordError) {
    const error = new Error(passwordError || "Reset token is required");
    error.status = 400;
    throw error;
  }

  const tokenHash = await sha256(token);
  const now = new Date().toISOString();
  const row = await env.DB.prepare(
    `SELECT t.id AS token_id, t.user_id, t.expires_at, t.used_at, u.status
     FROM password_reset_tokens t
     JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = ?
     LIMIT 1`,
  )
    .bind(tokenHash)
    .first();

  if (!row || row.used_at || row.expires_at <= now || row.status !== "active") {
    const error = new Error("This password reset link is invalid or has expired");
    error.status = 400;
    throw error;
  }

  const passwordHash = await hashPassword(newPassword);
  await env.DB.batch([
    env.DB.prepare(
      "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
    ).bind(passwordHash, now, row.user_id),
    env.DB.prepare(
      "UPDATE password_reset_tokens SET used_at = ? WHERE id = ?",
    ).bind(now, row.token_id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(row.user_id),
  ]);

  return json({ success: true, message: "Password updated. You can now log in." });
}

async function handleUpdatePassword(request, env) {
  if (request.method !== "POST") return methodNotAllowed("POST");
  requireSameOrigin(request);
  const session = await requireSession(request, env);

  const body = await readJson(request);
  const newPassword = body.newPassword;
  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    const error = new Error(passwordError);
    error.status = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const passwordHash = await hashPassword(newPassword);
  await env.DB.batch([
    env.DB.prepare(
      "UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?",
    ).bind(passwordHash, now, session.user.id),
    env.DB.prepare(
      "DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?",
    ).bind(session.user.id, session.tokenHash),
  ]);

  return json({ success: true });
}

export async function onRequest(context) {
  const { request, env, params } = context;

  try {
    ensureDatabase(env);
    const path = routePath(params);

    switch (path) {
      case "session":
        return handleSession(request, env);
      case "signup":
        return handleSignup(request, env);
      case "signin":
        return handleSignin(request, env);
      case "signout":
        return handleSignout(request, env);
      case "verify-email":
        return handleVerifyEmail(request, env);
      case "resend-verification":
        return handleResendVerification(request, env);
      case "request-password-reset":
        return handleRequestPasswordReset(request, env);
      case "reset-password":
        return handleResetPassword(request, env);
      case "update-password":
        return handleUpdatePassword(request, env);
      default:
        return json({ error: "Auth route not found" }, 404);
    }
  } catch (error) {
    console.error("Auth route failed", error);
    return authErrorResponse(error);
  }
}
