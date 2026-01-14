import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { formatMSTTimestamp } from "./timezone.js";

dotenv.config();

let transporter;

/**
 * Initialize email transporter based on configuration
 */
function initTransporter() {
  if (process.env.USE_RESEND === "true" && process.env.RESEND_API_KEY) {
    // Resend configuration
    transporter = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
    });
  } else if (process.env.USE_SENDGRID === "true" && process.env.SENDGRID_API_KEY) {
    // SendGrid configuration
    transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    // Gmail or other SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

/**
 * Send confirmation email to waitlist signup
 */
export async function sendWaitlistEmail(recipientEmail) {
  try {
    if (!transporter) {
      transporter = initTransporter();
    }

    const waitlistFormUrl =
      process.env.WAITLIST_FORM_URL || process.env.VITE_WAITLIST_FORM_URL;
    const waitlistFormSection = waitlistFormUrl
      ? `
            <div style="margin: 30px 0; text-align: center;">
              <a href="${waitlistFormUrl}" style="display: inline-block; background: #1e90ff; color: #fff; padding: 12px 18px; border-radius: 6px; text-decoration: none; font-size: 14px;">
                Complete the waitlist form
              </a>
            </div>
          `
      : "";

    const mailOptions = {
      from: `3C Mall <${process.env.SENDER_EMAIL || process.env.SMTP_USER || "noreply@the3cmall.app"}>`,
      to: recipientEmail,
      subject: "Welcome to 3C Mall Beta Waitlist 🚀",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%); padding: 40px; border-radius: 12px; text-align: center; color: white;">
            <h1 style="margin: 0 0 10px; font-size: 28px;">Welcome to 3C Mall! 🎉</h1>
            <p style="margin: 0; color: #a9b0c7; font-size: 14px;">You're on the beta waitlist</p>
          </div>

          <div style="padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
              Thanks for signing up! We're excited to have you interested in 3C Mall.
            </p>

            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 30px;">
              We're currently in <strong>closed beta</strong> and testing with a limited group of users. 
              We'll send you an email with a beta code when a spot opens up for you.
            </p>

            ${waitlistFormSection}

            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="margin: 0 0 15px; color: #333;">What you can expect:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px;">
                <li style="margin-bottom: 8px;">💰 Save up to 40% on groceries with smart multi-store routing</li>
                <li style="margin-bottom: 8px;">🥗 Personalized meal planning that adapts to your budget and preferences</li>
                <li style="margin-bottom: 8px;">👥 Connect with a community of health-conscious users and coaches</li>
                <li>📊 Track your savings and metabolic progress over time</li>
              </ul>
            </div>

            <p style="color: #999; font-size: 13px; margin: 30px 0 0; line-height: 1.6;">
              <strong>Questions?</strong> Reply to this email or visit <a href="https://the3cmall.com" style="color: #1e90ff; text-decoration: none;">the3cmall.com</a>
            </p>
          </div>

          <div style="text-align: center; padding: 20px 0; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2026 3C Mall. Concierge • Cost • Community</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Waitlist confirmation sent to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending waitlist email:", error);
    return false;
  }
}

/**
 * Send admin report notification
 */
export async function sendAdminReport(type, data) {
  try {
    if (!transporter) {
      transporter = initTransporter();
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.REPORT_EMAIL;

    let subject = "3C Mall Report";
    let htmlContent = "";

    if (type === "waitlist") {
      subject = `New Waitlist Signup - ${data.email}`;
      htmlContent = `
        <h2>New Waitlist Entry</h2>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Time:</strong> ${formatMSTTimestamp(data.timestamp)}</p>
        <p><strong>Referrer:</strong> ${data.referrer || "Direct"}</p>
        <p><strong>IP:</strong> ${data.clientIp}</p>
      `;
    } else if (type === "beta_attempt_failed") {
      subject = `Failed Beta Code Attempt`;
      htmlContent = `
        <h2>Failed Beta Code Attempt</h2>
        <p><strong>Code Attempted:</strong> ${data.code}</p>
        <p><strong>Time:</strong> ${formatMSTTimestamp(data.timestamp)}</p>
      `;
    }

    const mailOptions = {
      from: `3C Mall Reports <${process.env.SENDER_EMAIL || "noreply@the3cmall.app"}>`,
      to: adminEmail,
      subject,
      html: `
        <div style="font-family: monospace; padding: 20px; background: #f5f5f5;">
          ${htmlContent}
        </div>
      `,
    };

    // Send asynchronously without waiting
    transporter.sendMail(mailOptions).catch((err) => {
      console.error("Error sending admin report:", err);
    });
  } catch (error) {
    console.error("Error in sendAdminReport:", error);
  }
}

/**
 * Send daily summary report
 */
export async function sendDailySummary(summary) {
  try {
    if (!transporter) {
      transporter = initTransporter();
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.REPORT_EMAIL;

    const htmlContent = `
      <h2>Daily 3C Mall Report - ${new Date().toLocaleDateString()}</h2>
      
      <h3>Waitlist Stats</h3>
      <ul>
        <li>Total: ${summary.waitlist.total}</li>
        <li>Today: ${summary.waitlist.today}</li>
        <li>This Week: ${summary.waitlist.week}</li>
      </ul>

      <h3>Beta Activity</h3>
      <ul>
        <li>Successful Attempts: ${summary.beta.successfulAttempts}</li>
        <li>Failed Attempts: ${summary.beta.failedAttempts}</li>
        <li>Unique Users: ${summary.beta.uniqueUsers}</li>
      </ul>

      <h3>Top Referrers</h3>
      <ul>
        ${summary.waitlist.topReferrers.map((r) => `<li>${r.referrer}: ${r.count}</li>`).join("")}
      </ul>

      <h3>Recent Signups</h3>
      <ul>
        ${summary.waitlist.recent.map((r) => `<li>${r.email} (${new Date(r.timestamp).toLocaleString()})</li>`).join("")}
      </ul>
    `;

    const mailOptions = {
      from: `3C Mall Reports <${process.env.SENDER_EMAIL || process.env.SMTP_USER || "noreply@the3cmall.app"}>`,
      to: adminEmail,
      subject: `3C Mall Daily Summary - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("📊 Daily summary report sent to", adminEmail);
  } catch (error) {
    console.error("Error sending daily summary:", error);
  }
}
