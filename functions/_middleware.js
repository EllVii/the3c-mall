export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (env.DB && url.pathname.startsWith("/api/")) {
    // Normalize expiration enforcement through SQLite's datetime parser. This
    // prevents formatting differences between JavaScript ISO timestamps and
    // D1 CURRENT_TIMESTAMP from extending same-day token validity.
    try {
      await env.DB.batch([
        env.DB.prepare("DELETE FROM sessions WHERE datetime(expires_at) <= datetime('now')"),
        env.DB.prepare("DELETE FROM email_verification_tokens WHERE used_at IS NOT NULL OR datetime(expires_at) <= datetime('now', '-7 days')"),
        env.DB.prepare("DELETE FROM password_reset_tokens WHERE used_at IS NOT NULL OR datetime(expires_at) <= datetime('now', '-7 days')"),
      ]);
    } catch (cleanupError) {
      console.error("D1 cleanup failed", cleanupError);
    }
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  headers.set("cross-origin-opener-policy", "same-origin");

  if (url.protocol === "https:") {
    headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
