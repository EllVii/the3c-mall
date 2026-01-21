/**
 * API Compliance Monitoring Service
 * Ensures adherence to Kroger API and Walmart O/I API Terms of Service
 * 
 * Implements:
 * - Rate limit enforcement (TOS Section 11)
 * - API usage tracking and reporting
 * - Data retention policy compliance
 * - Competitive analysis prevention
 * - Security safeguard verification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const RATE_LIMITS = {
  KROGER: {
    requestsPerSecond: 5,
    requestsPerMinute: 300,
    requestsPerDay: 100000,
  },
  WALMART: {
    requestsPerSecond: 10,
    requestsPerMinute: 600,
    requestsPerDay: 500000,
  },
};

const DATA_RETENTION_LIMITS = {
  // How long API-returned data can be cached/stored
  KROGER_DATA: 24 * 60 * 60 * 1000, // 24 hours
  WALMART_DATA: 24 * 60 * 60 * 1000, // 24 hours
  PERSONAL_INFO: 30 * 24 * 60 * 60 * 1000, // 30 days max
};

/**
 * API Compliance Monitor - tracks and enforces API usage limits
 */
export class APICompliance {
  constructor() {
    this.requestCounters = new Map(); // Track requests per provider
    this.dataCache = new Map(); // Track cached data timestamps
    this.auditLog = [];
    this.violations = [];
    this.breaches = [];
    this.initializeTracking();
  }

  initializeTracking() {
    // Reset hourly counters every hour
    setInterval(() => this.resetHourlyCounters(), 60 * 60 * 1000);
    
    // Reset daily counters every day at midnight
    setInterval(() => this.resetDailyCounters(), 24 * 60 * 60 * 1000);

    // Verify data retention policies every hour
    setInterval(() => this.enforceDataRetention(), 60 * 60 * 1000);
  }

  /**
   * Log and track API request
   * Returns rate limit exceeded error if limit breached
   */
  trackAPIRequest(provider, endpoint, userId = null) {
    const key = `${provider}_${new Date().toISOString().slice(0, 13)}`; // hourly key
    const dayKey = `${provider}_daily_${new Date().toISOString().slice(0, 10)}`; // daily key

    // Get current counts
    const hourlyCount = (this.requestCounters.get(key) || 0) + 1;
    const dailyCount = (this.requestCounters.get(dayKey) || 0) + 1;

    const limits = RATE_LIMITS[provider.toUpperCase()];
    if (!limits) {
      this.logViolation('UNKNOWN_PROVIDER', provider, endpoint, userId);
      return { allowed: false, reason: 'Unknown API provider' };
    }

    // Check rate limits
    if (hourlyCount > limits.requestsPerMinute * 60) {
      this.logViolation('RATE_LIMIT_MINUTE', provider, endpoint, userId, {
        hourly: hourlyCount,
        limit: limits.requestsPerMinute * 60,
      });
      return { allowed: false, reason: 'Rate limit exceeded (hourly)' };
    }

    if (dailyCount > limits.requestsPerDay) {
      this.logViolation('RATE_LIMIT_DAILY', provider, endpoint, userId, {
        daily: dailyCount,
        limit: limits.requestsPerDay,
      });
      return { allowed: false, reason: 'Rate limit exceeded (daily)' };
    }

    // Update counters
    this.requestCounters.set(key, hourlyCount);
    this.requestCounters.set(dayKey, dailyCount);

    // Log audit trail
    this.logAudit('API_REQUEST', provider, {
      endpoint,
      userId,
      hourlyCount,
      dailyCount,
      timestamp: new Date().toISOString(),
    });

    return { allowed: true };
  }

  /**
   * Track cached data to enforce retention limits
   * TOS Section 11: Data retention limits must be respected
   */
  trackCachedData(provider, dataId, dataSize, userId = null) {
    const cacheKey = `${provider}_${dataId}`;
    this.dataCache.set(cacheKey, {
      provider,
      dataId,
      dataSize,
      userId,
      cachedAt: Date.now(),
      expiresAt: Date.now() + DATA_RETENTION_LIMITS[`${provider.toUpperCase()}_DATA`],
    });

    this.logAudit('DATA_CACHED', provider, {
      dataId,
      expiresAt: new Date(Date.now() + DATA_RETENTION_LIMITS[`${provider.toUpperCase()}_DATA`]).toISOString(),
      userId,
    });
  }

  /**
   * Enforce data retention policies
   * Automatically delete data that exceeds retention limits
   */
  enforceDataRetention() {
    const now = Date.now();
    let expiredCount = 0;

    for (const [cacheKey, cacheData] of this.dataCache.entries()) {
      if (now > cacheData.expiresAt) {
        this.dataCache.delete(cacheKey);
        expiredCount++;

        this.logAudit('DATA_EXPIRED_DELETED', cacheData.provider, {
          dataId: cacheData.dataId,
          cachedDuration: now - cacheData.cachedAt,
          userId: cacheData.userId,
        });
      }
    }

    if (expiredCount > 0) {
      console.log(`✅ Compliance: Purged ${expiredCount} expired cached data entries`);
    }
  }

  /**
   * Log compliance violations (TOS Section 11)
   */
  logViolation(violationType, provider, endpoint, userId, details = {}) {
    const violation = {
      type: violationType,
      provider,
      endpoint,
      userId,
      timestamp: new Date().toISOString(),
      details,
    };

    this.violations.push(violation);
    this.logAudit('COMPLIANCE_VIOLATION', provider, violation);
    this.writeToFile('violations.log', violation);

    console.warn(`⚠️ Compliance Violation: ${violationType} on ${provider} by ${userId || 'anonymous'}`);
  }

  /**
   * Log security breach or unauthorized access
   * TOS Section 11: Breach Notification - 24-48 hour window
   */
  logSecurityBreach(incidentType, description, affectedUsers = [], severity = 'medium') {
    const breach = {
      id: `BREACH_${Date.now()}`,
      type: incidentType,
      description,
      affectedUsers,
      affectedUserCount: affectedUsers.length,
      severity, // low, medium, high, critical
      discoveredAt: new Date().toISOString(),
      notificationDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING_NOTIFICATION',
      resolved: false,
    };

    this.breaches.push(breach);
    this.logAudit('SECURITY_BREACH', 'SYSTEM', breach);
    this.writeToFile('security-incidents.log', breach);

    // Alert admins immediately
    console.error(`🚨 SECURITY BREACH DETECTED: ${incidentType}`);
    console.error(`   Description: ${description}`);
    console.error(`   Affected Users: ${affectedUsers.length}`);
    console.error(`   Notification Deadline: ${breach.notificationDeadline}`);
    console.error(`   Breach ID: ${breach.id}`);

    return breach;
  }

  /**
   * Mark breach as notified to users
   */
  markBreachNotified(breachId, notificationMethod = 'email') {
    const breach = this.breaches.find(b => b.id === breachId);
    if (breach) {
      breach.status = 'NOTIFIED';
      breach.notificationMethod = notificationMethod;
      breach.notifiedAt = new Date().toISOString();

      this.logAudit('BREACH_NOTIFIED', 'SYSTEM', {
        breachId,
        notificationMethod,
        affectedUserCount: breach.affectedUserCount,
      });

      this.writeToFile('security-incidents.log', {
        event: 'BREACH_NOTIFIED',
        ...breach,
      });
    }
  }

  /**
   * Audit logging - Track all sensitive operations
   * TOS Section 18: Monitoring requirement
   */
  logAudit(eventType, provider, details) {
    const auditEntry = {
      eventType,
      provider,
      timestamp: new Date().toISOString(),
      details,
    };

    this.auditLog.push(auditEntry);

    // Keep in-memory log limited to last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000);
    }

    // Write to file for persistence
    this.writeToFile('audit.log', auditEntry);
  }

  /**
   * Check for suspicious competitive analysis patterns
   * TOS Section 11: Prohibits competitive analysis targeting API provider customers
   */
  detectCompetitiveAnalysis(userId, accessPattern) {
    const suspiciousIndicators = [];

    // Pattern 1: Accessing large volumes of pricing/inventory data
    if (accessPattern.dailyRequests > 1000) {
      suspiciousIndicators.push('HIGH_VOLUME_DATA_REQUESTS');
    }

    // Pattern 2: Accessing customer lists
    if (accessPattern.accessingCustomerData) {
      suspiciousIndicators.push('CUSTOMER_DATA_ACCESS');
    }

    // Pattern 3: Exporting large datasets
    if (accessPattern.dataExportSize > 100 * 1024 * 1024) {
      suspiciousIndicators.push('LARGE_DATA_EXPORT');
    }

    if (suspiciousIndicators.length > 0) {
      this.logViolation('SUSPECTED_COMPETITIVE_ANALYSIS', 'SYSTEM', 'cross-provider', userId, {
        indicators: suspiciousIndicators,
        accessPattern,
      });

      return {
        suspicious: true,
        indicators: suspiciousIndicators,
      };
    }

    return { suspicious: false };
  }

  /**
   * Verify no sensitive data in logs or caches
   * TOS Section 19: Credential security
   */
  scanForExposedCredentials(content, provider) {
    const secretPatterns = {
      KROGER: /kroger.*?(client_id|client_secret|token|key)[\s:=]+"?([a-zA-Z0-9_\-\.]+)"?/gi,
      WALMART: /walmart.*?(api_key|access_key|secret|token)[\s:=]+"?([a-zA-Z0-9_\-\.]+)"?/gi,
      GENERAL: /(?:password|secret|token|key|api_key|authorization)[\s:=]+"?([a-zA-Z0-9_\-\.]+)"?/gi,
    };

    const patterns = [secretPatterns[provider], secretPatterns.GENERAL].filter(Boolean);
    const found = [];

    for (const pattern of patterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        found.push({
          pattern: match[1],
          exposure: match[0].substring(0, 50) + '...',
        });
      }
    }

    if (found.length > 0) {
      this.logViolation('CREDENTIAL_EXPOSURE', provider, 'logs/cache', null, {
        exposures: found,
        severity: 'CRITICAL',
      });

      console.error(`🚨 CRITICAL: Credentials found in ${provider} data:`);
      console.error('   Please rotate credentials immediately');

      return { exposed: true, findings: found };
    }

    return { exposed: false };
  }

  /**
   * Generate compliance report
   */
  getComplianceReport(startDate = null, endDate = null) {
    const report = {
      generatedAt: new Date().toISOString(),
      period: {
        start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: endDate || new Date().toISOString(),
      },
      statistics: {
        totalRequests: Array.from(this.requestCounters.values()).reduce((a, b) => a + b, 0),
        cachedDataItems: this.dataCache.size,
        violations: this.violations.length,
        securityBreaches: this.breaches.length,
        unresolvedBreaches: this.breaches.filter(b => !b.resolved).length,
      },
      violations: this.violations.slice(-100), // Last 100
      breaches: this.breaches,
      recentAuditLog: this.auditLog.slice(-50), // Last 50 entries
    };

    return report;
  }

  /**
   * Write log entry to persistent storage
   */
  writeToFile(filename, data) {
    try {
      const logPath = path.join(LOG_DIR, filename);
      const logEntry = `${new Date().toISOString()} - ${JSON.stringify(data)}\n`;
      fs.appendFileSync(logPath, logEntry);
    } catch (error) {
      console.error(`Failed to write to ${filename}:`, error.message);
    }
  }

  /**
   * Reset hourly counters
   */
  resetHourlyCounters() {
    for (const key of this.requestCounters.keys()) {
      if (!key.includes('daily')) {
        this.requestCounters.delete(key);
      }
    }
  }

  /**
   * Reset daily counters
   */
  resetDailyCounters() {
    for (const key of this.requestCounters.keys()) {
      if (key.includes('daily')) {
        this.requestCounters.delete(key);
      }
    }
  }

  /**
   * Get current status of all tracked metrics
   */
  getStatus() {
    return {
      timestamp: new Date().toISOString(),
      requestsTracked: this.requestCounters.size,
      cachedDataItems: this.dataCache.size,
      totalViolations: this.violations.length,
      totalBreaches: this.breaches.length,
      unresolvedBreaches: this.breaches.filter(b => !b.resolved).length,
      system: 'OPERATIONAL',
    };
  }
}

// Singleton instance
let complianceInstance = null;

/**
 * Get or create compliance monitor
 */
export function getComplianceMonitor() {
  if (!complianceInstance) {
    complianceInstance = new APICompliance();
  }
  return complianceInstance;
}

export default getComplianceMonitor();
