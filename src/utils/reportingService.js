// src/utils/reportingService.js
/**
 * Reporting Service
 * Handles sending waitlist signups and beta activity reports to backend
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

/**
 * Report a new waitlist signup
 * @param {string} email - The email address joining the waitlist
 * @returns {Promise}
 */
export async function reportWaitlistSignup(email) {
  const shouldReport = import.meta.env.VITE_REPORT_WAITLIST === "true";
  
  if (!shouldReport) {
    console.log("⛔ Waitlist reporting disabled");
    return;
  }

  try {
    console.log("📤 Sending waitlist signup to:", `${API_BASE}/api/report/waitlist`);
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

    console.log("📡 Response status:", response.status, response.statusText);

    if (!response.ok) {
      console.error("❌ Failed to report waitlist signup:", response.status);
      throw new Error("Failed to report signup");
    }

    const data = await response.json();
    console.log("✅ Waitlist signup reported:", data);
    return data;
  } catch (error) {
    console.error("❌ Error reporting waitlist signup:", error);
    // Don't throw - let signup succeed even if reporting fails
  }
}

/**
 * Report a beta code usage
 * @param {string} code - The beta code that was used
 * @param {boolean} success - Whether the code was valid
 * @returns {Promise}
 */
export async function reportBetaCodeUsage(code, success) {
  const shouldReport = import.meta.env.VITE_REPORT_BETA_CODES === "true";
  
  if (!shouldReport) {
    console.log("⛔ Beta code reporting disabled");
    return;
  }

  try {
    console.log("📤 Sending beta code attempt to:", `${API_BASE}/api/report/beta-code`, { code: code.substring(0, 2) + "*****", success });
    const response = await fetch(`${API_BASE}/api/report/beta-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        success,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }),
    });

    console.log("📡 Response status:", response.status, response.statusText);

    if (!response.ok) {
      console.error("❌ Failed to report beta code usage:", response.status);
      throw new Error("Failed to report beta attempt");
    }

    const data = await response.json();
    console.log("✅ Beta code attempt reported:", data);
    return data;
  } catch (error) {
    console.error("❌ Error reporting beta code usage:", error);
    // Don't throw - let auth succeed even if reporting fails
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
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("admin_token") || ""}`,
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

/**
 * Health check - verify backend is reachable
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    return response.ok;
  } catch (error) {
    console.warn("Backend health check failed:", error);
    return false;
  }
}
