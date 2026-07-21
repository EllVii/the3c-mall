const DEFAULT_SENDER = {
  email: "support@the3cmall.com",
  name: "3C Mall",
};

const ALLOWED_SENDERS = new Set([
  "support@the3cmall.com",
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
  const email = normalizeEmail(value);
  return Boolean(email) && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

function parseSender(value) {
  if (value && typeof value === "object") {
    const email = normalizeEmail(value.email || value.address);
    const name = cleanText(value.name || DEFAULT_SENDER.name, 120);
    return { email, name: name || DEFAULT_SENDER.name };
  }

  const text = String(value || "").trim();
  const named = text.match(/^\s*([^<>]*?)\s*<\s*([^<>\s]+@[^<>\s]+)\s*>\s*$/);
  if (named) {
    return {
      email: normalizeEmail(named[2]),
      name: cleanText(named[1].replace(/^"|"$/g, ""), 120) || DEFAULT_SENDER.name,
    };
  }

  return {
    email: normalizeEmail(text || DEFAULT_SENDER.email),
    name: DEFAULT_SENDER.name,
  };
}

function cleanRecipients(value) {
  const input = Array.isArray(value) ? value : [value];
  const seen = new Set();
  const recipients = [];

  for (const item of input) {
    const email = normalizeEmail(
      item && typeof item === "object" ? item.email || item.address : item,
    );
    if (!isValidEmail(email) || seen.has(email)) continue;
    seen.add(email);
    recipients.push(email);
    if (recipients.length >= 10) break;
  }

  return recipients;
}

async function readJson(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 128_000) {
    const error = new Error("Email request is too large");
    error.status = 413;
    throw error;
  }

  try {
    return await request.json();
  } catch {
    const error = new Error("Invalid JSON body");
    error.status = 400;
    throw error;
  }
}

function providerError(error) {
  const code = cleanText(error?.code, 80);
  const message = cleanText(error?.message || error, 500) || "Cloudflare Email Service rejected the message";
  return code ? `${code}: ${message}` : message;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      const configured = Boolean(env.EMAIL && typeof env.EMAIL.send === "function");
      return json({
        status: configured ? "success" : "warning",
        configured,
        provider: "cloudflare_email_binding",
        sender: DEFAULT_SENDER.email,
      }, configured ? 200 : 503);
    }

    if (url.pathname !== "/send") {
      return json({ sent: false, error: "Not found" }, 404);
    }

    if (request.method !== "POST") {
      return json({ sent: false, error: "Method not allowed" }, 405);
    }

    if (!env.EMAIL || typeof env.EMAIL.send !== "function") {
      return json({
        sent: false,
        configured: false,
        provider: "cloudflare_email_binding",
        error: "The 3C Mall authentication-email Worker does not have an EMAIL binding.",
      }, 503);
    }

    try {
      const payload = await readJson(request);
      const from = parseSender(payload.from || DEFAULT_SENDER);
      const to = cleanRecipients(payload.to);
      const subject = cleanText(payload.subject, 180);
      const text = cleanText(payload.text, 50_000);
      const html = cleanText(payload.html, 100_000);

      if (!ALLOWED_SENDERS.has(from.email)) {
        return json({
          sent: false,
          configured: true,
          provider: "cloudflare_email_binding",
          error: "The requested sender address is not approved.",
        }, 400);
      }

      if (!to.length) {
        return json({ sent: false, error: "A valid recipient email is required." }, 400);
      }

      if (!subject) {
        return json({ sent: false, error: "An email subject is required." }, 400);
      }

      if (!text && !html) {
        return json({ sent: false, error: "Email content is required." }, 400);
      }

      const message = {
        from,
        to,
        subject,
        text: text || "Open this email in an HTML-capable email client.",
      };
      if (html) message.html = html;

      const result = await env.EMAIL.send(message);
      return json({
        sent: true,
        configured: true,
        provider: "cloudflare_email_binding",
        messageId: result?.messageId ? String(result.messageId) : "",
      });
    } catch (error) {
      console.error("3C Mall authentication email failed", error);
      return json({
        sent: false,
        configured: true,
        provider: "cloudflare_email_binding",
        error: providerError(error),
      }, Number(error?.status) || 502);
    }
  },
};
