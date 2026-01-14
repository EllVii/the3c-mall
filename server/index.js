import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import validator from "validator";
import { initDatabase, addWaitlistEntry, addBetaCodeAttempt, getSummary } from "./db.js";
import { sendWaitlistEmail, sendAdminReport } from "./email.js";

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
    const { email, timestamp, userAgent, referrer } = req.body;

    // Validate email
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Get client IP
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Add to database
    const result = addWaitlistEntry({
      email: email.toLowerCase(),
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || req.headers["user-agent"] || "",
      referrer: referrer || req.headers.referer || "",
      clientIp,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    // Send confirmation email
    const emailSent = await sendWaitlistEmail(email);

    // Send admin report
    sendAdminReport("waitlist", {
      email,
      timestamp: result.data.timestamp,
      referrer,
      clientIp,
    });

    res.json({
      success: true,
      message: "Added to waitlist",
      id: result.data.id,
      emailSent,
    });
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

    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const result = addBetaCodeAttempt({
      code: code.substring(0, 8), // Limit stored length for privacy
      success: success === true,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || req.headers["user-agent"] || "",
      clientIp,
    });

    // Track failed attempts
    if (!success) {
      sendAdminReport("beta_attempt_failed", {
        code,
        timestamp: result.data.timestamp,
      });
    }

    res.json({
      success: true,
      message: "Beta code attempt logged",
      id: result.data.id,
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

    const summary = getSummary();
    res.json(summary);
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
});
