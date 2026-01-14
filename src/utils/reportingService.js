// src/utils/reportingService.js
/**
 * Reporting Service
 * Handles sending waitlist signups and beta activity reports to admin email
 * 
 * TODO: Implement backend endpoint to handle these requests
 * You'll need to:
 * 1. Create an API route (e.g., /api/report)
 * 2. Use a service like SendGrid, Mailgun, or AWS SES to send emails
 * 3. Store reports in a database for historical tracking
 */

const REPORT_EMAIL = import.meta.env.VITE_REPORT_EMAIL;
const API_BASE = import.meta.env.VITE_API_BASE || "";

/**
 * Report a new waitlist signup
 * @param {string} email - The email address joining the waitlist
 * @returns {Promise}
 */
export async function reportWaitlistSignup(email) {
  if (!REPORT_EMAIL || import.meta.env.VITE_REPORT_WAITLIST !== "true") {
    console.log("Waitlist reporting disabled");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/report/waitlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      }),
    });

    if (!response.ok) {
      console.error("Failed to report waitlist signup:", response.status);
    }
  } catch (error) {
    console.error("Error reporting waitlist signup:", error);
  }
}

/**
 * Report a beta code usage
 * @param {string} code - The beta code that was used
 * @param {boolean} success - Whether the code was valid
 * @returns {Promise}
 */
export async function reportBetaCodeUsage(code, success) {
  if (!REPORT_EMAIL || import.meta.env.VITE_REPORT_BETA_CODES !== "true") {
    console.log("Beta code reporting disabled");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/report/beta-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code.substring(0, 5) + "***", // Mask for privacy
        success,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }),
    });

    if (!response.ok) {
      console.error("Failed to report beta code usage:", response.status);
    }
  } catch (error) {
    console.error("Error reporting beta code usage:", error);
  }
}

/**
 * Get summary report of all signups/activity
 * Admin-only endpoint - requires authentication
 * @returns {Promise}
 */
export async function getReportSummary() {
  try {
    const response = await fetch(`${API_BASE}/api/report/summary`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("admin_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch report summary");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching report summary:", error);
    return null;
  }
}
