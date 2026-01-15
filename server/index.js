import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import validator from "validator";
import { initDatabase } from "./db.js";
import { sendWaitlistEmail, sendAdminReport } from "./email.js";
import { getMSTISOTimestamp } from "./timezone.js";
import { supabase } from "./supabase.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// Initialize database
initDatabase();

// Routes

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
 * TODO: Add proper authentication
 */
app.get("/api/report/summary", (req, res) => {
  try {
    // TODO: Implement admin token verification
    // const token = req.headers.authorization?.split(" ")[1];
    // if (!verifyAdminToken(token)) {
    //   return res.status(401).json({ error: "Unauthorized" });
    // }

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 3C Mall Backend running on http://localhost:${PORT}`);
  console.log(`📧 Email reports to: ${process.env.REPORT_EMAIL}`);
  console.log(`🛡️ CORS enabled for: ${process.env.CORS_ORIGIN}`);
  console.log("Supabase URL loaded:", !!process.env.SUPABASE_URL);
  console.log("Service role key loaded:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

});
