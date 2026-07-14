export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
    },
  });
}

export function methodNotAllowed(allowed) {
  return json(
    { error: "Method not allowed" },
    405,
    { allow: Array.isArray(allowed) ? allowed.join(", ") : allowed },
  );
}

export async function readJson(request, maxBytes = 32_768) {
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) {
    const error = new Error("Request body is too large");
    error.status = 413;
    throw error;
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    const error = new Error("Request body is too large");
    error.status = 413;
    throw error;
  }

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    const error = new Error("Invalid JSON body");
    error.status = 400;
    throw error;
  }
}

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function isValidEmail(value) {
  if (!value || value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getClientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  );
}

export function getAppBaseUrl(request, env) {
  const configured = String(env.PUBLIC_APP_URL || "").trim().replace(/\/$/, "");
  return configured || new URL(request.url).origin;
}

export function requireSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const expected = new URL(request.url).origin;
  if (origin !== expected) {
    const error = new Error("Cross-origin request rejected");
    error.status = 403;
    throw error;
  }
}

export function routePath(params, name = "path") {
  const value = params?.[name];
  if (Array.isArray(value)) return value.join("/");
  return String(value || "").replace(/^\/+|\/+$/g, "");
}

export function toErrorResponse(error, fallback = "Request failed") {
  const status = Number(error?.status) || 500;
  const expose = status >= 400 && status < 500;
  return json({ error: expose ? error.message : fallback }, status);
}
