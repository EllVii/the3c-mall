import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, "data", "3cmall.db");

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

/**
 * Initialize database and create tables
 */
export function initDatabase() {
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Create waitlist table
  db.exec(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      timestamp TEXT NOT NULL,
      userAgent TEXT,
      referrer TEXT,
      clientIp TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending'
    );

    CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
    CREATE INDEX IF NOT EXISTS idx_waitlist_timestamp ON waitlist(timestamp);
  `);

  // Create beta code attempts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS beta_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      success INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      userAgent TEXT,
      clientIp TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_beta_code ON beta_attempts(code);
    CREATE INDEX IF NOT EXISTS idx_beta_success ON beta_attempts(success);
    CREATE INDEX IF NOT EXISTS idx_beta_timestamp ON beta_attempts(timestamp);
  `);

  // Create activity log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      data TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_log(type);
  `);

  console.log("✅ Database initialized:", dbPath);
}

/**
 * Add a new waitlist entry
 */
export function addWaitlistEntry(data) {
  try {
    const stmt = db.prepare(`
      INSERT INTO waitlist (email, timestamp, userAgent, referrer, clientIp)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.email,
      data.timestamp,
      data.userAgent,
      data.referrer,
      data.clientIp
    );

    return {
      success: true,
      data: {
        id: result.lastInsertRowid,
        email: data.email,
        timestamp: data.timestamp,
      },
    };
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return {
        success: false,
        message: "Email already on waitlist",
      };
    }
    throw error;
  }
}

/**
 * Add a beta code attempt
 */
export function addBetaCodeAttempt(data) {
  try {
    const stmt = db.prepare(`
      INSERT INTO beta_attempts (code, success, timestamp, userAgent, clientIp)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.code,
      data.success ? 1 : 0,
      data.timestamp,
      data.userAgent,
      data.clientIp
    );

    return {
      success: true,
      data: {
        id: result.lastInsertRowid,
        code: data.code,
        success: data.success,
        timestamp: data.timestamp,
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get summary statistics
 */
export function getSummary() {
  const waitlistStats = db
    .prepare(
      `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN timestamp LIKE datetime('now', 'start of day') || '%' THEN 1 ELSE 0 END) as today,
      SUM(CASE WHEN timestamp >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as week
    FROM waitlist
  `
    )
    .get();

  const betaStats = db
    .prepare(
      `
    SELECT 
      SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successCount,
      SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failCount,
      COUNT(DISTINCT clientIp) as uniqueUsers
    FROM beta_attempts
  `
    )
    .get();

  const topReferrers = db
    .prepare(
      `
    SELECT referrer, COUNT(*) as count 
    FROM waitlist 
    WHERE referrer IS NOT NULL AND referrer != ''
    GROUP BY referrer 
    ORDER BY count DESC 
    LIMIT 5
  `
    )
    .all();

  const recentWaitlist = db
    .prepare(
      `
    SELECT email, timestamp, referrer 
    FROM waitlist 
    ORDER BY timestamp DESC 
    LIMIT 10
  `
    )
    .all();

  const failedAttempts = db
    .prepare(
      `
    SELECT code, COUNT(*) as count 
    FROM beta_attempts 
    WHERE success = 0 
    GROUP BY code 
    ORDER BY count DESC 
    LIMIT 5
  `
    )
    .all();

  return {
    timestamp: new Date().toISOString(),
    waitlist: {
      total: waitlistStats.total || 0,
      today: waitlistStats.today || 0,
      week: waitlistStats.week || 0,
      topReferrers: topReferrers || [],
      recent: recentWaitlist || [],
    },
    beta: {
      successfulAttempts: betaStats.successCount || 0,
      failedAttempts: betaStats.failCount || 0,
      uniqueUsers: betaStats.uniqueUsers || 0,
      topFailedCodes: failedAttempts || [],
    },
  };
}

/**
 * Get all waitlist entries (admin)
 */
export function getWaitlist() {
  return db
    .prepare(
      `
    SELECT * FROM waitlist 
    ORDER BY timestamp DESC
  `
    )
    .all();
}

/**
 * Export database instance
 */
export function getDatabase() {
  return db;
}
