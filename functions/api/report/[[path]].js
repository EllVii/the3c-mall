import {
  getClientIp,
  isValidEmail,
  json,
  methodNotAllowed,
  normalizeEmail,
  readJson,
  requireSameOrigin,
  routePath,
  toErrorResponse,
} from "../../_shared/http.js";
import { enforceRateLimit } from "../../_shared/auth.js";
import { sendWaitlistEmail } from "../../_shared/email.js";

function ensureDatabase(env) {
  if (!env.DB) {
    const error = new Error("D1 binding DB is not configured");
    error.status = 500;
    throw error;
  }
}

function requireAdmin(request, env) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!env.ADMIN_TOKEN || !token || token !== env.ADMIN_TOKEN) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
}

function phoenixDayStartIso(now = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(now).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T07:00:00.000Z`;
}

async function handleWaitlist(request, env) {
  if (request.method !== "POST") return methodNotAllowed("POST");
  requireSameOrigin(request);

  const ip = getClientIp(request) || "unknown";
  await enforceRateLimit(env, `report:waitlist:${ip}`, 10, 15 * 60);

  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  if (!isValidEmail(email)) {
    const error = new Error("Enter a valid email address");
    error.status = 400;
    throw error;
  }

  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get("user-agent");
  const referrer = request.headers.get("referer");

  await env.DB.prepare(
    `INSERT INTO waitlist
      (id, email, timestamp, user_agent, referrer, client_ip)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET
       timestamp = excluded.timestamp,
       user_agent = excluded.user_agent,
       referrer = excluded.referrer,
       client_ip = excluded.client_ip`,
  )
    .bind(crypto.randomUUID(), email, timestamp, userAgent, referrer, getClientIp(request))
    .run();

  const emailResult = await sendWaitlistEmail(env, email);
  return json({
    success: true,
    message: "Added to waitlist",
    emailSent: emailResult.sent,
  });
}

async function handleBetaCode(request, env) {
  if (request.method !== "POST") return methodNotAllowed("POST");
  requireSameOrigin(request);

  const ip = getClientIp(request) || "unknown";
  await enforceRateLimit(env, `report:beta-code:${ip}`, 30, 15 * 60);

  const body = await readJson(request);
  const code = String(body.code || "").trim().slice(0, 8);
  if (!code) {
    const error = new Error("Code is required");
    error.status = 400;
    throw error;
  }

  const timestamp = body.timestamp && !Number.isNaN(Date.parse(body.timestamp))
    ? new Date(body.timestamp).toISOString()
    : new Date().toISOString();
  const id = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO beta_attempts
      (id, code, success, timestamp, user_agent, client_ip)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      code,
      body.success === true ? 1 : 0,
      timestamp,
      String(body.userAgent || request.headers.get("user-agent") || "").slice(0, 1024) || null,
      getClientIp(request),
    )
    .run();

  return json({ success: true, message: "Beta code attempt logged", id });
}

async function handleSummary(request, env) {
  if (request.method !== "GET") return methodNotAllowed("GET");
  requireAdmin(request, env);

  const now = new Date();
  const startOfDay = phoenixDayStartIso(now);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalRow,
    todayRow,
    weekRow,
    topReferrersResult,
    recentResult,
    successRow,
    failRow,
    failedCodesResult,
    uniqueUsersRow,
  ] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS count FROM waitlist").first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM waitlist WHERE timestamp >= ?").bind(startOfDay).first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM waitlist WHERE timestamp >= ?").bind(weekStart).first(),
    env.DB.prepare(
      `SELECT referrer, COUNT(*) AS count
       FROM waitlist
       WHERE referrer IS NOT NULL AND referrer <> ''
       GROUP BY referrer
       ORDER BY count DESC
       LIMIT 5`,
    ).all(),
    env.DB.prepare(
      `SELECT email, timestamp, referrer
       FROM waitlist
       ORDER BY timestamp DESC
       LIMIT 10`,
    ).all(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM beta_attempts WHERE success = 1").first(),
    env.DB.prepare("SELECT COUNT(*) AS count FROM beta_attempts WHERE success = 0").first(),
    env.DB.prepare(
      `SELECT code, COUNT(*) AS count
       FROM beta_attempts
       WHERE success = 0
       GROUP BY code
       ORDER BY count DESC
       LIMIT 5`,
    ).all(),
    env.DB.prepare(
      "SELECT COUNT(DISTINCT client_ip) AS count FROM beta_attempts WHERE client_ip IS NOT NULL",
    ).first(),
  ]);

  return json({
    timestamp: now.toISOString(),
    timezone: "America/Phoenix",
    waitlist: {
      total: Number(totalRow?.count || 0),
      today: Number(todayRow?.count || 0),
      week: Number(weekRow?.count || 0),
      topReferrers: topReferrersResult.results || [],
      recent: recentResult.results || [],
    },
    beta: {
      successfulAttempts: Number(successRow?.count || 0),
      failedAttempts: Number(failRow?.count || 0),
      uniqueUsers: Number(uniqueUsersRow?.count || 0),
      topFailedCodes: failedCodesResult.results || [],
    },
  });
}

export async function onRequest(context) {
  const { request, env, params } = context;

  try {
    ensureDatabase(env);
    const path = routePath(params);

    switch (path) {
      case "waitlist":
        return handleWaitlist(request, env);
      case "beta-code":
        return handleBetaCode(request, env);
      case "summary":
        return handleSummary(request, env);
      default:
        return json({ error: "Report route not found" }, 404);
    }
  } catch (error) {
    console.error("Report route failed", error);
    const response = toErrorResponse(error, "Report request failed");
    if (error?.retryAfter) response.headers.set("retry-after", String(error.retryAfter));
    return response;
  }
}
