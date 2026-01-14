# Email Reporting & Waitlist Integration

## Configuration

All settings are managed via `.env` file:

```dotenv
# Email to receive reports
VITE_REPORT_EMAIL=the.velasquez.law@gmail.com

# Enable/disable reporting features
VITE_REPORT_WAITLIST=true
VITE_REPORT_BETA_CODES=true

# Google Form for detailed signup
VITE_WAITLIST_FORM_URL=https://docs.google.com/forms/d/e/1FAIpQLScU0QgVxHyX3cDwvHYGWfjW-8akOb6dii3fAHSHpPBUJ96S4Q/viewform?usp=header
```

## Frontend Implementation

### Waitlist Signup (LandingPage)
- Email input form with Google Form fallback
- Stores email in localStorage
- Calls `reportWaitlistSignup()` when enabled
- Shows success message with option to fill detailed form

### Beta Gate
- Validates beta codes from environment variable
- Can report failed attempts if `VITE_REPORT_BETA_CODES=true`

## Backend Implementation (Required)

### API Endpoints to Create

#### 1. POST `/api/report/waitlist`
Receives new waitlist signups

**Request:**
```json
{
  "email": "user@example.com",
  "timestamp": "2026-01-13T12:00:00Z",
  "userAgent": "...",
  "referrer": "https://the3cmall.com"
}
```

**Server Actions:**
1. Validate email format
2. Check for duplicates (optional)
3. Store in database
4. Send email to `VITE_REPORT_EMAIL` with:
   - Email address
   - Timestamp
   - User location (from IP)
   - Referrer source
5. Return 200 status

#### 2. POST `/api/report/beta-code`
Receives beta code usage attempts

**Request:**
```json
{
  "code": "BETA2***",
  "success": true,
  "timestamp": "2026-01-13T12:00:00Z",
  "userAgent": "..."
}
```

**Server Actions:**
1. Log attempt to database
2. Send daily/weekly summary email to admin
3. Flag suspicious activity (multiple failed attempts)

#### 3. GET `/api/report/summary` (Admin Only)
Returns aggregate statistics

**Response:**
```json
{
  "waitlist": {
    "total": 150,
    "today": 12,
    "week": 45,
    "topReferrers": [...]
  },
  "betaCodes": {
    "validAttempts": 25,
    "invalidAttempts": 3,
    "uniqueUsers": 20
  }
}
```

## Email Template Suggestions

### Waitlist Notification
```
Subject: New Waitlist Signup - 3C Mall Beta

Name: [from form if available]
Email: user@example.com
Timestamp: 2026-01-13 12:00 PM
Referrer: https://the3cmall.com
Location: [from IP geolocation]
Device: [from User-Agent]

---
Daily Summary:
- Total signups: X
- New today: Y
- Form submissions: Z
```

### Beta Code Usage Summary
```
Subject: Daily Beta Activity Report

Failed Attempts: 
- code: INVAL***
- count: 2

Successful Logins: 15
New Beta Users: 3

Top Activities:
- Grocery Lab: 8 sessions
- Meal Planner: 5 sessions
- Dashboard: 12 sessions
```

## Implementation Steps

1. **Choose Email Service**
   - SendGrid (recommended)
   - Mailgun
   - AWS SES
   - Your own SMTP

2. **Set Up Database**
   - Store waitlist entries
   - Track beta code usage
   - Log activity for reports

3. **Create Backend Routes**
   - Implement `/api/report/*` endpoints
   - Add email sending logic
   - Add data validation

4. **Update .env**
   - Add backend base URL: `VITE_API_BASE=https://api.the3cmall.com`
   - Add email service credentials (stored in server .env, NOT client)

5. **Testing**
   - Test waitlist form submission
   - Verify emails are sent
   - Check report summaries

## Security Considerations

✅ **Good Practices:**
- Email addresses validated on server
- Rate limiting on API endpoints
- No sensitive data in localStorage
- Beta codes masked in reports
- Admin endpoints require authentication

❌ **To Avoid:**
- Storing credentials in frontend
- Exposing email service API keys
- Unvalidated user input
- Logging full beta codes

## Example Node.js/Express Implementation

See `/docs/backend-example.js` for a complete working example
(To be created after initial setup)
