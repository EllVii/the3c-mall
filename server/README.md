# 3C Mall Backend

Node.js/Express backend for email reporting, waitlist management, and beta access tracking.

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your settings:

```bash
cp .env.example .env
```

Edit `.env`:

```dotenv
PORT=3001
NODE_ENV=development

# Email: Use Gmail with App Password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Or SendGrid
USE_SENDGRID=true
SENDGRID_API_KEY=SG.xxx

REPORT_EMAIL=the.velasquez.law@gmail.com
ADMIN_EMAIL=the.velasquez.law@gmail.com

CORS_ORIGIN=http://localhost:5173,https://the3cmall.com,https://the3cmall.app

DB_PATH=./data/3cmall.db
```

### 3. Initialize Database

```bash
npm run db:init
```

This creates the SQLite database with tables for waitlist entries and beta code attempts.

### 4. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:3001`

## Email Setup

### Option A: Gmail (Recommended for testing)

1. Enable 2FA on your Google account
2. Create an [App Password](https://myaccount.google.com/apppasswords)
3. Add to `.env`:
   ```
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your-app-password
   ```

### Option B: SendGrid (Production)

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Add to `.env`:
   ```
   USE_SENDGRID=true
   SENDGRID_API_KEY=SG.xxx
   ```

### Option C: Other SMTP (Mailgun, AWS SES, etc.)

Update `.env` with your SMTP host and credentials.

## API Endpoints

### POST `/api/report/waitlist`

Add email to waitlist.

**Request:**
```json
{
  "email": "user@example.com",
  "timestamp": "2026-01-13T12:00:00Z",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://google.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added to waitlist",
  "id": 1,
  "emailSent": true
}
```

### POST `/api/report/beta-code`

Track beta code usage.

**Request:**
```json
{
  "code": "BETA2026",
  "success": true,
  "timestamp": "2026-01-13T12:00:00Z",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Beta code attempt logged",
  "id": 2
}
```

### GET `/api/report/summary`

Get statistics and recent activity.

**Response:**
```json
{
  "timestamp": "2026-01-13T12:30:00Z",
  "waitlist": {
    "total": 150,
    "today": 5,
    "week": 25,
    "topReferrers": [...],
    "recent": [...]
  },
  "beta": {
    "successfulAttempts": 20,
    "failedAttempts": 3,
    "uniqueUsers": 18,
    "topFailedCodes": [...]
  }
}
```

### GET `/api/health`

Health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-13T12:30:00Z"
}
```

## Database Schema

### waitlist
```sql
id (INTEGER PRIMARY KEY)
email (TEXT UNIQUE)
timestamp (TEXT)
userAgent (TEXT)
referrer (TEXT)
clientIp (TEXT)
createdAt (DATETIME)
status (TEXT) -- 'pending', 'approved', 'rejected'
```

### beta_attempts
```sql
id (INTEGER PRIMARY KEY)
code (TEXT)
success (INTEGER) -- 0 or 1
timestamp (TEXT)
userAgent (TEXT)
clientIp (TEXT)
createdAt (DATETIME)
```

### activity_log
```sql
id (INTEGER PRIMARY KEY)
type (TEXT)
data (TEXT)
createdAt (DATETIME)
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Update frontend `.env` with production API URL.

### Railway, Render, Heroku

1. Push to GitHub
2. Connect repository to platform
3. Set environment variables
4. Deploy

## Security Checklist

- ✅ Rate limiting on POST endpoints (10 requests per 15 min)
- ✅ Email validation
- ✅ CORS properly configured
- ✅ Sensitive data not logged
- ✅ Database with indexes
- ✅ Error handling without exposing details

## TODO

- [ ] Admin authentication for `/api/report/summary`
- [ ] Scheduled daily/weekly reports
- [ ] Email unsubscribe handling
- [ ] Duplicate detection improvements
- [ ] IP geolocation for better insights
- [ ] Frontend admin dashboard
