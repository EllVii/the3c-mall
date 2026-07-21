import { getAppBaseUrl } from "./http.js";

const DEFAULT_FROM = "3C Mall <support@the3cmall.com>";
const AUTH_EMAIL_INTERNAL_ORIGIN = "https://3c-mall-auth-email.internal";

function parseNamedAddress(value) {
  const text = String(value || "").trim();
  const match = text.match(/^\s*([^<>]*?)\s*<\s*([^<>\s]+@[^<>\s]+)\s*>\s*$/);

  if (!match) return text || "support@the3cmall.com";

  const name = match[1].trim().replace(/^"|"$/g, "");
  const address = match[2].trim();
  return name ? { address, name } : address;
}

async function readProviderResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text.slice(0, 500) };
  }
}

function hasAuthEmailService(env) {
  return Boolean(env.AUTH_EMAIL && typeof env.AUTH_EMAIL.fetch === "function");
}

async function sendWithAuthEmailService(env, payload) {
  if (!hasAuthEmailService(env)) {
    return { sent: false, reason: "not_configured", provider: "cloudflare_email_binding" };
  }

  const from = parseNamedAddress(env.AUTH_FROM_EMAIL || DEFAULT_FROM);

  try {
    const response = await env.AUTH_EMAIL.fetch(`${AUTH_EMAIL_INTERNAL_ORIGIN}/send`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ from, ...payload }),
    });
    const result = await readProviderResponse(response);

    if (!response.ok || !result?.sent) {
      console.error("3C Mall auth email Worker failed", response.status, result);
      return {
        sent: false,
        reason: result?.configured === false ? "not_configured" : "provider_error",
        provider: "cloudflare_email_binding",
      };
    }

    return {
      sent: true,
      provider: "cloudflare_email_binding",
      result: {
        messageId: result?.messageId || "",
      },
    };
  } catch (error) {
    console.error("3C Mall auth email Worker request failed", error);
    return { sent: false, reason: "provider_error", provider: "cloudflare_email_binding" };
  }
}

async function sendWithCloudflareRest(env, payload) {
  const accountId = String(env.CLOUDFLARE_ACCOUNT_ID || "").trim();
  const apiToken = String(env.CLOUDFLARE_EMAIL_API_TOKEN || "").trim();

  if (!accountId || !apiToken) {
    return { sent: false, reason: "not_configured", provider: "cloudflare_rest" };
  }

  const from = parseNamedAddress(env.AUTH_FROM_EMAIL || DEFAULT_FROM);
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/email/sending/send`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from, ...payload }),
    });

    const result = await readProviderResponse(response);
    if (!response.ok || result?.success === false) {
      console.error("Cloudflare Email Sending REST request failed", response.status, result);
      return { sent: false, reason: "provider_error", provider: "cloudflare_rest" };
    }

    const permanentBounces = result?.result?.permanent_bounces || [];
    if (permanentBounces.length > 0) {
      console.error("Cloudflare Email Sending permanently bounced", permanentBounces);
      return { sent: false, reason: "permanent_bounce", provider: "cloudflare_rest" };
    }

    return { sent: true, provider: "cloudflare_rest", result: result?.result || null };
  } catch (error) {
    console.error("Cloudflare Email Sending REST request failed", error);
    return { sent: false, reason: "provider_error", provider: "cloudflare_rest" };
  }
}

async function sendWithResend(env, payload) {
  if (!env.RESEND_API_KEY) {
    return { sent: false, reason: "not_configured", provider: "resend" };
  }

  const from = env.AUTH_FROM_EMAIL || DEFAULT_FROM;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ from, ...payload }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Resend email failed", response.status, detail);
    return { sent: false, reason: "provider_error", provider: "resend" };
  }

  return { sent: true, provider: "resend" };
}

async function sendEmail(env, payload) {
  if (hasAuthEmailService(env)) {
    return sendWithAuthEmailService(env, payload);
  }

  const hasCloudflareToken = Boolean(String(env.CLOUDFLARE_EMAIL_API_TOKEN || "").trim());
  const hasCloudflareAccount = Boolean(String(env.CLOUDFLARE_ACCOUNT_ID || "").trim());

  if (hasCloudflareToken && hasCloudflareAccount) {
    return sendWithCloudflareRest(env, payload);
  }

  if (hasCloudflareToken || hasCloudflareAccount) {
    console.warn(
      "Cloudflare Email Sending REST is only partially configured; both CLOUDFLARE_EMAIL_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required",
    );
  }

  if (env.RESEND_API_KEY) {
    return sendWithResend(env, payload);
  }

  console.warn("No outbound email provider is configured; email was not sent");
  return { sent: false, reason: "not_configured", provider: null };
}

export async function getEmailHealth(env) {
  if (hasAuthEmailService(env)) {
    try {
      const response = await env.AUTH_EMAIL.fetch(`${AUTH_EMAIL_INTERNAL_ORIGIN}/health`, {
        method: "GET",
      });
      const result = await readProviderResponse(response);
      return {
        configured: Boolean(response.ok && result?.configured),
        provider: "cloudflare_email_binding",
        serviceBinding: true,
      };
    } catch (error) {
      console.error("3C Mall auth email health check failed", error);
      return {
        configured: false,
        provider: "cloudflare_email_binding",
        serviceBinding: true,
      };
    }
  }

  const hasCloudflareToken = Boolean(String(env.CLOUDFLARE_EMAIL_API_TOKEN || "").trim());
  const hasCloudflareAccount = Boolean(String(env.CLOUDFLARE_ACCOUNT_ID || "").trim());
  if (hasCloudflareToken && hasCloudflareAccount) {
    return { configured: true, provider: "cloudflare_rest", serviceBinding: false };
  }
  if (env.RESEND_API_KEY) {
    return { configured: true, provider: "resend", serviceBinding: false };
  }
  return { configured: false, provider: null, serviceBinding: false };
}

export async function sendVerificationEmail(request, env, email, token) {
  const baseUrl = getAppBaseUrl(request, env);
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  return sendEmail(env, {
    to: [email],
    subject: "Verify your 3C Mall account",
    text: `Verify your 3C Mall account by opening this link: ${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>Welcome to 3C Mall.</p><p><a href="${verifyUrl}">Verify your email address</a></p><p>This link expires in 24 hours.</p>`,
  });
}

export async function sendPasswordResetEmail(request, env, email, token) {
  const baseUrl = getAppBaseUrl(request, env);
  const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

  return sendEmail(env, {
    to: [email],
    subject: "Reset your 3C Mall password",
    text: `Reset your 3C Mall password by opening this link: ${resetUrl}\n\nThis link expires in one hour.`,
    html: `<p>A password reset was requested for your 3C Mall account.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this message.</p>`,
  });
}

export async function sendWaitlistEmail(env, email) {
  return sendEmail(env, {
    to: [email],
    subject: "You are on the 3C Mall list",
    text: "Thank you for joining the 3C Mall list. We will keep you informed about important updates.",
    html: "<p>Thank you for joining the 3C Mall list.</p><p>We will keep you informed about important updates.</p>",
  });
}
