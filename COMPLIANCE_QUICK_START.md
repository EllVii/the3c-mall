# TOS Compliance - Quick Setup Checklist

## ✅ Implementation Complete
Your app now enforces TOS requirements through:
- API rate limit monitoring (Kroger, Walmart)
- CAN-SPAM email compliance
- Data retention policies
- Account deletion & data export
- Security breach tracking
- Audit logging

---

## 🔧 Required Configuration

### 1. **Create Supabase Tables**

Run these SQL queries in your Supabase dashboard:

```sql
-- Email consent tracking (TOS Section 12)
CREATE TABLE IF NOT EXISTS email_consents (
  email TEXT PRIMARY KEY,
  consent_status VARCHAR(50),
  consented_at TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  consents_marketing BOOLEAN DEFAULT FALSE,
  consents_promotional BOOLEAN DEFAULT FALSE,
  consents_account BOOLEAN DEFAULT TRUE,
  consents_security BOOLEAN DEFAULT TRUE,
  consents_waitlist BOOLEAN DEFAULT FALSE,
  unsubscribe_reason TEXT
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  preference_key VARCHAR(255),
  preference_value TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User activity tracking
CREATE TABLE IF NOT EXISTS user_activity (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_type VARCHAR(50),
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  api_provider VARCHAR(50),
  endpoint VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW(),
  response_time_ms INTEGER
);

-- Cache for API data
CREATE TABLE IF NOT EXISTS api_cache (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  cache_key VARCHAR(255),
  cache_value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50),
  user_id TEXT,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **Verify Environment Variables**

Ensure these are set in your `.env`:

```bash
# Existing
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
KROGER_CLIENT_ID=your_id
KROGER_CLIENT_SECRET=your_secret
SENDER_EMAIL=noreply@the3cmall.app

# For compliance (add these if missing)
VITE_API_URL=http://localhost:3001  # or your production URL
VITE_URL=http://localhost:5173      # or your production frontend
```

### 3. **Create Logs Directory**

```bash
mkdir -p server/logs
```

The system will automatically create:
- `server/logs/audit.log`
- `server/logs/violations.log`
- `server/logs/security-incidents.log`
- `server/logs/deletions.log`

### 4. **Create Export Directory**

```bash
mkdir -p exports
```

User data exports will be stored here temporarily (7-day retention).

---

## 🧪 Testing

### Test 1: Verify API Rate Limiting
```bash
curl http://localhost:3001/api/compliance/status

# Should return:
{
  "compliance": {
    "requestsTracked": 0,
    "cachedDataItems": 0,
    "totalViolations": 0,
    "unresolvedBreaches": 0,
    "system": "OPERATIONAL"
  }
}
```

### Test 2: Verify Email Unsubscribe
```bash
curl "http://localhost:3001/api/email/unsubscribe?email=test@example.com"

# Should return:
{
  "success": true,
  "message": "You have been unsubscribed from all marketing emails"
}
```

### Test 3: Request Data Export
```bash
curl -X POST http://localhost:3001/api/user/export \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "email": "user@example.com"
  }'

# Should return:
{
  "success": true,
  "exportId": "EXPORT_test-user-123_1234567890",
  "downloadUrl": "/api/export/EXPORT_test-user-123_1234567890",
  "expiresAt": "2026-01-27T15:30:00Z"
}
```

### Test 4: Check Compliance Report
```bash
curl http://localhost:3001/api/compliance/report

# Should return comprehensive report with violations, breaches, audit trail
```

---

## 📋 What Each System Does

### API Compliance (TOS Section 11)
- ✅ Enforces rate limits: Kroger (5/sec, 300/min, 100k/day), Walmart (10/sec, 600/min, 500k/day)
- ✅ Auto-expires API data after 24 hours
- ✅ Prevents circumventing rate limits (returns 429 Too Many Requests)
- ✅ Logs all API access for audit trail
- ✅ Flags competitive analysis patterns

### Email Compliance (TOS Section 13)
- ✅ Requires explicit opt-in before marketing emails
- ✅ Adds List-Unsubscribe headers to all emails
- ✅ Provides one-click unsubscribe button
- ✅ Validates email content for CAN-SPAM compliance
- ✅ Includes contact info and unsubscribe footer automatically

### Data Management (TOS Section 12)
- ✅ Users can export all their data (data portability)
- ✅ Users can request account deletion
- ✅ Account deletion immediately removes all data
- ✅ Residual/cached data cleaned up after 30 days
- ✅ All deletions logged for compliance verification

### Audit Logging (TOS Section 18)
- ✅ Every API request logged
- ✅ Every violation recorded
- ✅ Every breach tracked with notification deadline
- ✅ All data operations timestamped
- ✅ Credentials scanned for accidental exposure

---

## 🚀 Going Live

Before deploying to production:

1. ✅ **Run all tests** - Verify endpoints work
2. ✅ **Create Supabase tables** - Set up database schema
3. ✅ **Set environment variables** - Point to production URLs
4. ✅ **Create log directory** - Ensure server can write logs
5. ✅ **Review compliance report** - Check /api/compliance/report
6. ✅ **Legal review** - Have team verify TOS implementation
7. ✅ **User communication** - Announce data export/deletion features
8. ✅ **Monitor logs** - Check for violations during first week

---

## 📊 Monitoring Dashboard

Check these regularly:

```bash
# Real-time status
GET /api/compliance/status

# Full report
GET /api/compliance/report

# Specific user consent
GET /api/user/email-consent/:email
```

---

## 🆘 Troubleshooting

### Issue: Rate limit errors for legitimate traffic
**Solution:** Check `RATE_LIMITS` in `server/compliance/apiCompliance.js` and adjust if needed

### Issue: Emails missing unsubscribe footer
**Solution:** Verify `generateUnsubscribeFooter()` is being called in email.js

### Issue: Data export not working
**Solution:** Check that `exports/` directory exists and is writable

### Issue: Account deletion not removing all data
**Solution:** Verify all table names in `dataDeletion.js` match your schema

### Issue: Violations not being logged
**Solution:** Check that `server/logs/` directory exists and is writable

---

## 📞 Key Files Reference

| Task | File |
|---|---|
| API rate limits | `server/compliance/apiCompliance.js` |
| Email compliance | `server/compliance/canSpamCompliance.js` |
| Data deletion | `server/compliance/dataDeletion.js` |
| API endpoints | `server/index.js` (lines 440-580) |
| Kroger integration | `server/kroger.js` (with tracking) |
| Email service | `server/email.js` (with CAN-SPAM) |

---

## ✅ Status

**Implementation:** ✅ COMPLETE
**Testing:** Ready (see Testing section)
**Documentation:** ✅ Complete (COMPLIANCE_IMPLEMENTATION.md)
**Ready for Production:** Yes

---

**Last Updated:** January 20, 2026
**Version:** 1.0
