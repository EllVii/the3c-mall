const MAX_JSON_BYTES = 64 * 1024;
const RATE_LIMIT = 20;
const RATE_WINDOW_SECONDS = 60 * 60;

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

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
  const configuredOrigin = String(env.APP_ORIGIN || requestOrigin).replace(/\/$/, "");
  return origin === requestOrigin || origin === configuredOrigin;
}

function clientKey(request) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  return `waitlist:${ip}`;
}

async function ensureSchema(env) {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS waitlist (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      referrer TEXT,
      source TEXT NOT NULL DEFAULT 'website',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS rate_limits (
      rate_key TEXT PRIMARY KEY,
      window_start INTEGER NOT NULL,
      request_count INTEGER NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at)"),
  ]);
}

async function checkRateLimit(env, key) {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % RATE_WINDOW_SECONDS);

  await env.DB.prepare(
    `INSERT INTO rate_limits (rate_key, window_start, request_count, updated_at)
     VALUES (?, ?, 1, CURRENT_TIMESTAMP)
     ON CONFLICT(rate_key) DO UPDATE SET
       request_count = CASE
         WHEN rate_limits.window_start = excluded.window_start
         THEN rate_limits.request_count + 1
         ELSE 1
       END,
       window_start = excluded.window_start,
       updated_at = CURRENT_TIMESTAMP`,
  ).bind(key, windowStart).run();

  const row = await env.DB.prepare(
    "SELECT window_start, request_count FROM rate_limits WHERE rate_key = ?",
  ).bind(key).first();

  return (
    Number(row?.window_start) === windowStart &&
    Number(row?.request_count || 0) <= RATE_LIMIT
  );
}

function notificationRecipients(env) {
  return String(env.WAITLIST_NOTIFY_EMAILS || env.WAITLIST_NOTIFY_EMAIL || "")
    .split(",")
    .map(normalizeEmail)
    .filter(validEmail)
    .slice(0, 10);
}

async function sendEmail(env, { to, subject, html, replyTo, idempotencyKey }) {
  const recipients = (Array.isArray(to) ? to : [to])
    .map(normalizeEmail)
    .filter(validEmail);

  if (!env.RESEND_API_KEY || recipients.length === 0) {
    return { sent: false, reason: "email_not_configured" };
  }

  const payload = {
    from: env.FROM_EMAIL || "3C Mall <no-reply@the3cmall.app>",
    to: recipients,
    subject,
    html,
  };

  const normalizedReplyTo = normalizeEmail(replyTo);
  if (validEmail(normalizedReplyTo)) payload.reply_to = normalizedReplyTo;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error("Waitlist email delivery failed", response.status, await response.text());
    return { sent: false, reason: "delivery_failed" };
  }

  return { sent: true };
}

async function routeWaitlistEmail(env, signup) {
  const recipients = notificationRecipients(env);
  const replyInbox = normalizeEmail(env.WAITLIST_REPLY_TO || recipients[0] || "");
  const safeEmail = escapeHtml(signup.email);
  const safeSource = escapeHtml(signup.source);
  const safeReferrer = escapeHtml(signup.referrer || "Direct visit / unavailable");
  const safeTimestamp = escapeHtml(signup.timestamp);

  const deliveries = [];

  if (recipients.length > 0) {
    deliveries.push(
      sendEmail(env, {
        to: recipients,
        replyTo: signup.email,
        idempotencyKey: `waitlist-admin-${signup.id}`,
        subject: "[3C Mall] New beta waitlist signup",
        html: `
          <h2>New 3C Mall beta waitlist signup</h2>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Source:</strong> ${safeSource}</p>
          <p><strong>Referrer:</strong> ${safeReferrer}</p>
          <p><strong>Submitted:</strong> ${safeTimestamp}</p>
          <p>The email address has also been saved to the 3C Mall D1 waitlist.</p>
        `,
      }),
    );
  }

  if (String(env.WAITLIST_CONFIRMATION_ENABLED || "true").toLowerCase() !== "false") {
    deliveries.push(
      sendEmail(env, {
        to: signup.email,
        replyTo: replyInbox,
        idempotencyKey: `waitlist-confirmation-${signup.id}`,
        subject: "You’re on the 3C Mall beta waitlist",
        html: `
          <h2>Thank you for joining the 3C Mall beta waitlist.</h2>
          <p>We saved your request for early access.</p>
          <p>Beta testing invitations are released in limited groups. We may also contact you with product updates or requests for practical household feedback.</p>
          <p>No payment is required to remain on the waitlist.</p>
        `,
      }),
    );
  }

  if (deliveries.length === 0) return;
  await Promise.allSettled(deliveries);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return error("D1 binding DB is not configured", 503, "database_not_configured");
  }

  if (!allowedOrigin(request, env)) {
    return error("Origin is not allowed", 403, "origin_rejected");
  }

  try {
    await ensureSchema(env);

    if (!(await checkRateLimit(env, clientKey(request)))) {
      return error("Too many attempts", 429, "rate_limited");
    }

    const body = await readJson(request);
    const email = normalizeEmail(body.email);
    if (!validEmail(email)) return error("Enter a valid email address");

    const signup = {
      id: crypto.randomUUID(),
      email,
      referrer: String(body.referrer || "").trim().slice(0, 500),
      source: String(body.source || "website").trim().slice(0, 80) || "website",
      timestamp: new Date().toISOString(),
    };

    const insert = await env.DB.prepare(
      `INSERT INTO waitlist (id, email, referrer, source)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(email) DO NOTHING`,
    ).bind(
      signup.id,
      signup.email,
      signup.referrer || null,
      signup.source,
    ).run();

    const isNewSignup = Number(insert.meta?.changes || 0) > 0;

    if (!isNewSignup) {
      await env.DB.prepare(
        `UPDATE waitlist
         SET referrer = COALESCE(?, referrer), source = ?
         WHERE email = ?`,
      ).bind(signup.referrer || null, signup.source, signup.email).run();
    } else {
      context.waitUntil(routeWaitlistEmail(env, signup));
    }

    return json({ ok: true }, 201);
  } catch (caught) {
    if (caught?.message === "payload_too_large") {
      return error("Request body is too large", 413, "payload_too_large");
    }
    if (caught instanceof SyntaxError) {
      return error("Request body must be valid JSON");
    }

    console.error("Waitlist route error", caught);
    return error("Unexpected server error", 500, "internal_error");
  }
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-methods": "POST,OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
    },
  });
}
