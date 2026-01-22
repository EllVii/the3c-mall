import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import validator from "validator";
import { sendWaitlistEmail, sendAdminReport, handleUnsubscribe } from "./email.js";
import { getMSTISOTimestamp } from "./timezone.js";
import { supabase } from "./supabase.js";
import { getKrogerService, KrogerService } from "./kroger.js";
import { getComplianceMonitor } from "./compliance/apiCompliance.js";
import { getCANSPAMCompliance } from "./compliance/canSpamCompliance.js";
import { getDataDeletionService } from "./compliance/dataDeletion.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const compliance = getComplianceMonitor();
const canspam = getCANSPAMCompliance();
const dataDeletion = getDataDeletionService();

// Middleware
app.use(cors({
  origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "10"),
  message: "Too many requests, please try again later.",
});

// More permissive limiter for store lookups (map UX)
const storeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many store lookups, please slow down.",
});

// Routes

/**
 * GET /api/health/supabase
 * Test endpoint to verify Supabase connection
 * Returns diagnostic info about connection status
 */
app.get("/api/health/supabase", async (req, res) => {
  try {
    // Check if env vars are loaded
    const hasUrl = !!process.env.SUPABASE_URL;
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasUrl || !hasKey) {
      return res.status(400).json({
        status: "error",
        message: "Supabase env vars not configured",
        env: {
          SUPABASE_URL: hasUrl,
          SUPABASE_SERVICE_ROLE_KEY: hasKey,
        },
      });
    }

    // Try to query a simple table
    const { data, error } = await supabase
      .from("email_consents")
      .select("count", { count: "exact", head: true })
      .limit(1);

    if (error) {
      return res.status(500).json({
        status: "error",
        message: "Supabase query failed",
        error: error.message,
        env: {
          SUPABASE_URL: process.env.SUPABASE_URL?.substring(0, 40) + "...",
        },
      });
    }

    res.json({
      status: "success",
      message: "✅ Supabase connection verified",
      supabase: {
        url: process.env.SUPABASE_URL?.substring(0, 40) + "...",
        connected: true,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: err.message,
    });
  }
});

/**
 * POST /api/report/waitlist
 * Add a new waitlist entry and send confirmation email
 */
app.post("/api/report/waitlist", limiter, async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const timestamp = new Date().toISOString();
    const userAgent = req.headers["user-agent"] || null;
    const referrer = req.headers.referer || null;
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      null;

    const { error } = await supabase.from("waitlist").insert([
      {
        email: email.toLowerCase(),
        timestamp,
        user_agent: userAgent,
        referrer,
        client_ip: clientIp,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to add to waitlist" });
    }

    // Send confirmation email
    const emailSent = await sendWaitlistEmail(email);

    // Send admin report
    sendAdminReport("waitlist", {
      email,
      timestamp,
      referrer,
      clientIp,
    });

    res.json({ success: true, message: "Added to waitlist", emailSent });
  } catch (error) {
    console.error("Waitlist error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/report/beta-code
 * Track beta code usage attempts
 */
app.post("/api/report/beta-code", limiter, async (req, res) => {
  try {
    const { code, success, timestamp, userAgent } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code required" });
    }

    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      null;
    const normalizedTimestamp = timestamp || getMSTISOTimestamp();

    const { data, error } = await supabase.from("beta_attempts").insert([
      {
        code: code.substring(0, 8),
        success: success === true,
        timestamp: normalizedTimestamp,
        user_agent: userAgent || req.headers["user-agent"] || null,
        client_ip: clientIp,
      },
    ]).select();

    if (error) {
      console.error("Supabase beta insert error:", error);
      return res.status(500).json({ error: "Failed to log beta code attempt" });
    }

    // Track failed attempts
    if (!success) {
      sendAdminReport("beta_attempt_failed", {
        code,
        timestamp: normalizedTimestamp,
      });
    }

    res.json({
      success: true,
      message: "Beta code attempt logged",
      id: data?.[0]?.id,
    });
  } catch (error) {
    console.error("Beta code error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/report/summary
 * Get aggregate statistics (admin only)
 * Requires ADMIN_TOKEN in Authorization header
 */
app.get("/api/report/summary", (req, res) => {
  try {
    // Implement admin token verification
    const adminToken = process.env.ADMIN_TOKEN;
    const authHeader = req.headers.authorization;
    
    if (!adminToken || !authHeader) {
      return res.status(401).json({ error: "Unauthorized - missing credentials" });
    }
    
    const token = authHeader.split(" ")[1];
    if (token !== adminToken) {
      return res.status(403).json({ error: "Forbidden - invalid token" });
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    (async () => {
      const [
        { count: totalCount, error: totalError },
        { count: todayCount, error: todayError },
        { count: weekCount, error: weekError },
        { data: topReferrers, error: topReferrersError },
        { data: recentWaitlist, error: recentWaitlistError },
        { count: successCount, error: successCountError },
        { count: failCount, error: failCountError },
        { data: failedCodes, error: failedCodesError },
        { data: betaIps, error: betaIpsError },
      ] = await Promise.all([
        supabase
          .from("waitlist")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("waitlist")
          .select("id", { count: "exact", head: true })
          .gte("timestamp", startOfDay.toISOString()),
        supabase
          .from("waitlist")
          .select("id", { count: "exact", head: true })
          .gte("timestamp", weekStart.toISOString()),
        supabase
          .from("waitlist")
          .select("referrer, count:referrer")
          .not("referrer", "is", null)
          .neq("referrer", "")
          .order("count", { ascending: false })
          .limit(5),
        supabase
          .from("waitlist")
          .select("email, timestamp, referrer")
          .order("timestamp", { ascending: false })
          .limit(10),
        supabase
          .from("beta_attempts")
          .select("id", { count: "exact", head: true })
          .eq("success", true),
        supabase
          .from("beta_attempts")
          .select("id", { count: "exact", head: true })
          .eq("success", false),
        supabase
          .from("beta_attempts")
          .select("code, count:code")
          .eq("success", false)
          .order("count", { ascending: false })
          .limit(5),
        supabase.from("beta_attempts").select("client_ip"),
      ]);

      const errors = [
        totalError,
        todayError,
        weekError,
        topReferrersError,
        recentWaitlistError,
        successCountError,
        failCountError,
        failedCodesError,
        betaIpsError,
      ].filter(Boolean);

      if (errors.length) {
        errors.forEach((err) => console.error("Supabase summary error:", err));
        return res.status(500).json({ error: "Failed to load summary" });
      }

      const uniqueUsers = new Set(
        (betaIps || [])
          .map((row) => row.client_ip)
          .filter((ip) => ip)
      ).size;

      const summary = {
        timestamp: new Date().toISOString(),
        waitlist: {
          total: totalCount || 0,
          today: todayCount || 0,
          week: weekCount || 0,
          topReferrers: topReferrers || [],
          recent: recentWaitlist || [],
        },
        beta: {
          successfulAttempts: successCount || 0,
          failedAttempts: failCount || 0,
          uniqueUsers,
          topFailedCodes: failedCodes || [],
        },
      };

      return res.json(summary);
    })().catch((error) => {
      console.error("Summary error:", error);
      res.status(500).json({ error: "Internal server error" });
    });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/kroger/search
 * Search for products in Kroger catalog
 * Query params: term, brand, productId, locationId, fulfillment, limit, start
 */
app.get("/api/kroger/search", async (req, res) => {
  try {
    const kroger = getKrogerService();
    
    if (!kroger.enabled) {
      return res.status(503).json({ 
        error: "Kroger API not configured",
        message: "Real product data coming soon. Set KROGER_CLIENT_ID and KROGER_CLIENT_SECRET to enable."
      });
    }

    const { term, brand, productId, locationId, fulfillment, limit, start } = req.query;
    
    const results = await kroger.searchProducts({
      term,
      brand,
      productId,
      locationId,
      fulfillment,
      limit: limit ? parseInt(limit) : 10,
      start: start ? parseInt(start) : 1
    });

    // Transform products to app format
    const groceryItems = results.data.map(product => KrogerService.toGroceryItem(product));

    res.json({
      success: true,
      products: groceryItems,
      rawData: results.data, // Include raw data for debugging
      meta: results.meta
    });
  } catch (error) {
    console.error("❌ Kroger search error:", error.message);
    res.status(500).json({ 
      error: "Product search failed",
      message: error.message 
    });
  }
});

/**
 * GET /api/stores/nearby
 * Find nearby Kroger family stores by lat/lng
 * Query params: lat, lng, radius (miles), limit
 */
app.get("/api/stores/nearby", storeLimiter, async (req, res) => {
  try {
    const kroger = getKrogerService();

    if (!kroger.enabled) {
      return res.status(503).json({
        error: "Kroger API not configured",
        message: "Set KROGER_CLIENT_ID and KROGER_CLIENT_SECRET to enable store lookup.",
      });
    }

    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius || "10");
    const limit = parseInt(req.query.limit || "15", 10);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const results = await kroger.searchLocations({ lat, lng, radius, limit });
    const stores = (results?.data || [])
      .map(KrogerService.toStoreLocation)
      .filter((s) => s.lat && s.lng);

    res.json({
      success: true,
      stores,
      meta: results?.meta || null,
    });
  } catch (error) {
    console.error("❌ Nearby stores error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Store lookup failed",
      message: error.message,
    });
  }
});

/**
 * GET /api/kroger/product/:id
 * Get detailed product information
 * Query params: locationId (optional)
 */
app.get("/api/kroger/product/:id", async (req, res) => {
  try {
    const kroger = getKrogerService();
    
    if (!kroger.enabled) {
      return res.status(503).json({ 
        error: "Kroger API not configured"
      });
    }

    const { id } = req.params;
    const { locationId } = req.query;
    
    const result = await kroger.getProductDetails(id, locationId);
    
    // Transform to app format
    const groceryItem = KrogerService.toGroceryItem(result.data);

    res.json({
      success: true,
      product: groceryItem,
      rawData: result.data
    });
  } catch (error) {
    console.error("❌ Kroger product details error:", error.message);
    res.status(error.response?.status || 500).json({ 
      error: "Product lookup failed",
      message: error.message 
    });
  }
});

/**
 * GET /api/debug/kroger-config
 * REMOVED FOR SECURITY - Debug endpoints should not be exposed in production
 * 
 * If you need debug info, create an admin-only endpoint instead
 */
// This endpoint has been removed. Use /api/health for basic health checks only.

/**
 * GET /api/health
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// ============================================
// COMPLIANCE ENDPOINTS - TOS Implementation
// ============================================

/**
 * GET /api/email/unsubscribe
 * Handle email unsubscribe requests (TOS Section 13: CAN-SPAM)
 */
app.get("/api/email/unsubscribe", async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const result = await handleUnsubscribe(email);
    
    if (result.processed) {
      return res.status(200).json({
        success: true,
        message: "You have been unsubscribed from all marketing emails",
      });
    } else {
      return res.status(500).json({
        error: "Failed to process unsubscribe request",
      });
    }
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/compliance/status
 * Get current compliance monitoring status (TOS Section 18)
 */
app.get("/api/compliance/status", (req, res) => {
  try {
    const complianceStatus = compliance.getStatus();
    const canspamStatus = canspam.getStatus();

    res.status(200).json({
      compliance: complianceStatus,
      canspam: canspamStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Compliance status error:", error);
    res.status(500).json({ error: "Failed to retrieve compliance status" });
  }
});

/**
 * GET /api/compliance/report
 * Generate comprehensive compliance report (TOS Section 18)
 */
app.get("/api/compliance/report", (req, res) => {
  try {
    const report = compliance.getComplianceReport();
    res.status(200).json(report);
  } catch (error) {
    console.error("Compliance report error:", error);
    res.status(500).json({ error: "Failed to generate compliance report" });
  }
});

/**
 * GET /api/export/:exportId
 * Download user data export (TOS Section 11: Data Portability)
 */
app.get("/api/export/:exportId", (req, res) => {
  try {
    const { exportId } = req.params;
    const exportData = dataDeletion.getDataExport(exportId);

    if (!exportData.success) {
      return res.status(404).json({ error: exportData.error });
    }

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="3cmall-data-${exportId}.json"`);
    res.status(200).json(exportData.data);
  } catch (error) {
    console.error("Data export error:", error);
    res.status(500).json({ error: "Failed to retrieve data export" });
  }
});

/**
 * POST /api/user/export
 * Request user data export (TOS Section 11: Data Portability)
 */
app.post("/api/user/export", limiter, async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid user ID or email" });
    }

    const exportResult = await dataDeletion.requestDataExport(userId, email);

    if (exportResult.success) {
      return res.status(200).json({
        success: true,
        exportId: exportResult.exportId,
        downloadUrl: exportResult.downloadUrl,
        expiresAt: exportResult.expiresAt,
        message: exportResult.message,
      });
    } else {
      return res.status(500).json({
        error: "Failed to generate data export",
      });
    }
  } catch (error) {
    console.error("Data export request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/user/delete-account
 * Request account deletion (TOS Section 12)
 */
app.post("/api/user/delete-account", limiter, async (req, res) => {
  try {
    const { userId, email, reason } = req.body;

    if (!userId || !email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid user ID or email" });
    }

    const deletionResult = await dataDeletion.requestAccountDeletion(userId, email, reason);

    if (deletionResult.success) {
      return res.status(200).json({
        success: true,
        message: deletionResult.message,
        deletionId: deletionResult.deletionId,
      });
    } else {
      return res.status(500).json({
        error: "Failed to process account deletion request",
      });
    }
  } catch (error) {
    console.error("Account deletion request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/user/delete-account/confirm/:deletionId
 * Confirm and execute account deletion (TOS Section 12)
 */
app.post("/api/user/delete-account/confirm/:deletionId", async (req, res) => {
  try {
    const { deletionId } = req.params;

    const deletionResult = await dataDeletion.confirmAccountDeletion(deletionId);

    if (deletionResult.success) {
      return res.status(200).json({
        success: true,
        message: deletionResult.message,
        completedAt: deletionResult.completedAt,
      });
    } else {
      return res.status(500).json({
        error: deletionResult.error || "Failed to confirm account deletion",
      });
    }
  } catch (error) {
    console.error("Account deletion confirmation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/user/email-consent/:email
 * Get email consent status (TOS Section 12)
 */
app.get("/api/user/email-consent/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    const consentSummary = await canspam.getConsentSummary(email);

    if (!consentSummary) {
      return res.status(500).json({ error: "Failed to retrieve consent information" });
    }

    res.status(200).json(consentSummary);
  } catch (error) {
    console.error("Email consent error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 3C Mall Backend running on http://localhost:${PORT}`);
  console.log(`📧 Email reports to: ${process.env.REPORT_EMAIL}`);
  console.log(`🛡️ CORS enabled for: ${process.env.CORS_ORIGIN}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log("Supabase URL loaded:", !!process.env.SUPABASE_URL);
  console.log("Service role key loaded:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log("🛒 Kroger API configured:", !!(process.env.KROGER_CLIENT_ID && process.env.KROGER_CLIENT_SECRET));
  
  // Debug: Show first 4 characters of Kroger Client ID (safe to log)
  if (process.env.KROGER_CLIENT_ID) {
    console.log(`   Kroger Client ID starts with: ${process.env.KROGER_CLIENT_ID.substring(0, 4)}****`);
  }
});
