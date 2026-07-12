import { apiRequest } from "../lib/apiClient.js";

export async function reportWaitlistSignup(email) {
  const shouldReport = import.meta.env.VITE_REPORT_WAITLIST !== "false";
  if (!shouldReport) return null;

  try {
    return await apiRequest("/api/report/waitlist", {
      method: "POST",
      body: {
        email,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        source: "website",
      },
    });
  } catch (error) {
    console.error("Waitlist reporting failed", error);
    return null;
  }
}

export async function reportBetaCodeUsage(_code, _success) {
  // Beta codes are no longer the production authentication boundary. This
  // compatibility function remains so legacy UI code does not break.
  return null;
}

export async function getReportSummary() {
  const adminToken = sessionStorage.getItem("admin_token") || "";
  if (!adminToken) return null;

  try {
    return await apiRequest("/api/admin/pilot-summary", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  } catch (error) {
    console.error("Pilot summary request failed", error);
    return null;
  }
}

export async function checkBackendHealth() {
  try {
    const result = await apiRequest("/api/health/d1");
    return Boolean(result?.ok);
  } catch (error) {
    console.warn("D1 health check failed", error);
    return false;
  }
}
