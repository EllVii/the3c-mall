import { getAppBaseUrl } from "./http.js";

async function sendEmail(env, payload) {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not configured; email was not sent");
    return { sent: false, reason: "not_configured" };
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
    return { sent: false, reason: "provider_error" };
  }

  return { sent: true };
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
