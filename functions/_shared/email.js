import { getAppBaseUrl } from "./http.js";

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

async function sendWithCloudflare(env, payload) {
  const accountId = String(env.CLOUDFLARE_ACCOUNT_ID || "").trim();
  const apiToken = String(env.CLOUDFLARE_EMAIL_API_TOKEN || "").trim();

  if (!accountId || !apiToken) {
    return { sent: false, reason: "not_configured", provider: "cloudflare" };
  }

  const from = parseNamedAddress(env.AUTH_FROM_EMAIL || "3C Mall <support@the3cmall.com>");
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
      console.error("Cloudflare Email Sending failed", response.status, result);
      return { sent: false, reason: "provider_error", provider: "cloudflare" };
    }

    const permanentBounces = result?.result?.permanent_bounces || [];
    if (permanentBounces.length > 0) {
      console.error("Cloudflare Email Sending permanently bounced", permanentBounces);
      return { sent: false, reason: "permanent_bounce", provider: "cloudflare" };
    }

    return { sent: true, provider: "cloudflare", result: result?.result || null };
  } catch (error) {
    console.error("Cloudflare Email Sending request failed", error);
    return { sent: false, reason: "provider_error", provider: "cloudflare" };
  }
}

async function sendWithResend(env, payload) {
  if (!env.RESEND_API_KEY) {
    return { sent: false, reason: "not_configured", provider: "resend" };
  }

  const from = env.AUTH_FROM_EMAIL || "3C Mall <support@the3cmall.com>";
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
  const hasCloudflareToken = Boolean(String(env.CLOUDFLARE_EMAIL_API_TOKEN || "").trim());
  const hasCloudflareAccount = Boolean(String(env.CLOUDFLARE_ACCOUNT_ID || "").trim());

  if (hasCloudflareToken && hasCloudflareAccount) {
    return sendWithCloudflare(env, payload);
  }

  if (hasCloudflareToken || hasCloudflareAccount) {
    console.warn(
      "Cloudflare Email Sending is only partially configured; both CLOUDFLARE_EMAIL_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required",
    );
  }

  if (env.RESEND_API_KEY) {
    return sendWithResend(env, payload);
  }

  console.warn("No outbound email provider is configured; email was not sent");
  return { sent: false, reason: "not_configured", provider: null };
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
