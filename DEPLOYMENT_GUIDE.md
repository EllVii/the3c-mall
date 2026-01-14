# Backend Server Setup & Deployment Guide

## Overview

Your backend is complete and ready to handle:
- Waitlist signups with email confirmation
- Beta code usage tracking and validation reporting
- Admin dashboard with aggregate statistics
- Email notifications to the.velasquez.law@gmail.com

## Quick Start

### 1. Environment Setup

```bash
cd server
cp .env.example .env
```

Edit `.env` and configure your email service:

**Option A: Gmail (Recommended)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

Get your App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your platform)
3. Copy the 16-character password
4. Paste into SMTP_PASS in `.env`

**Option B: SendGrid**
```env
USE_SENDGRID=true
SENDGRID_API_KEY=SG.your-api-key
```

Get API key at https://sendgrid.com/marketing/sendgrid-free-signup

### 2. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3001`

### 3. Verify Setup

Test the health endpoint:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-10T10:30:45.123Z"}
```

## API Endpoints

### POST /api/report/waitlist
Report a new waitlist signup

**Request:**
```json
{
  "email": "user@example.com",
  "timestamp": "2024-01-10T10:30:45.123Z",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://the3cmall.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added to waitlist",
  "data": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**Test:**
```bash
curl -X POST http://localhost:3001/api/report/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### POST /api/report/beta-code
Report beta code usage attempt

**Request:**
```json
{
  "code": "BETA2026",
  "success": true,
  "timestamp": "2024-01-10T10:30:45.123Z",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Beta attempt recorded"
}
```

**Test:**
```bash
curl -X POST http://localhost:3001/api/report/beta-code \
  -H "Content-Type: application/json" \
  -d '{"code":"BETA2026","success":true}'
```

### GET /api/report/summary
Get aggregate statistics (admin only)

**Response:**
```json
{
  "success": true,
  "summary": {
    "total": {
      "waitlist": 42,
      "betaAttempts": 156,
      "successfulCodes": 89
    },
    "today": {
      "waitlist": 5,
      "attempts": 12
    },
    "topReferrers": [
      {"referrer": "organic", "count": 15},
      {"referrer": "social", "count": 8}
    ],
    "failedCodes": [
      {"code": "INVALID123", "count": 3}
    ]
  }
}
```

**Test:**
```bash
curl http://localhost:3001/api/report/summary
```

### GET /api/health
Health check endpoint

**Response:**
```json
{"status":"ok","timestamp":"2024-01-10T10:30:45.123Z"}
```

## Database

SQLite database at `./data/3cmall.db`

### Tables

**waitlist**
- id: Primary key
- email: User email (UNIQUE)
- timestamp: ISO string
- userAgent: Browser info
- referrer: Referrer URL
- clientIp: IP address
- createdAt: Datetime
- status: 'pending', 'confirmed', 'active'

**beta_attempts**
- id: Primary key
- code: Beta code used
- success: 0 or 1
- timestamp: ISO string
- userAgent: Browser info
- clientIp: IP address
- createdAt: Datetime

**activity_log**
- id: Primary key
- type: Event type (signup, beta_attempt, etc)
- data: JSON data
- createdAt: Datetime

## Deployment

### Option 1: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

Set environment variables in Railway dashboard.

### Option 2: Vercel
Create `vercel.json`:
```json
{
  "buildCommand": "npm install",
  "outputDirectory": ".",
  "installCommand": "npm install",
  "env": {
    "SMTP_USER": "@SMTP_USER",
    "SMTP_PASS": "@SMTP_PASS"
  }
}
```

### Option 3: Heroku
```bash
heroku login
heroku create your-app-name
git push heroku main
heroku config:set SMTP_USER=your-email@gmail.com
heroku config:set SMTP_PASS=your-app-password
```

### Option 4: Self-Hosted (Docker)
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3001
CMD ["node", "index.js"]
```

Build and run:
```bash
docker build -t the3c-mall-server .
docker run -p 3001:3001 --env-file .env the3c-mall-server
```

## Production Configuration

### Frontend (.env)
For production, update the frontend `.env`:

```env
# .env.production
VITE_API_BASE=https://your-backend-domain.com
VITE_REPORT_WAITLIST=true
VITE_REPORT_BETA_CODES=true
```

### CORS Configuration
Update `server/.env` for production:

```env
CORS_ORIGIN=https://the3cmall.com,https://www.the3cmall.com,https://the3cmall.app,https://www.the3cmall.app
```

## Monitoring

### Email Issues
If emails aren't sending:

1. **Check SMTP credentials**
   ```bash
   node -e "
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASS
     }
   });
   transporter.verify((err, success) => {
     console.log(err || 'Email configured correctly');
   });
   "
   ```

2. **Check Gmail app password**
   - Ensure "Less secure apps" is NOT enabled (shouldn't be needed with App Password)
   - Verify in https://myaccount.google.com/apppasswords

3. **Check logs**
   - Review server console output for error messages

### Database Issues
```bash
# Check database file
ls -lh data/3cmall.db

# Inspect with sqlite3
sqlite3 data/3cmall.db "SELECT COUNT(*) as waitlist FROM waitlist;"
```

## Security Checklist

- [ ] SMTP password uses App Password or SendGrid API key, not plain password
- [ ] CORS_ORIGIN is restricted to your domains
- [ ] Rate limiting is enabled (default: 10 req/15min)
- [ ] .env is in .gitignore (never commit secrets)
- [ ] Database path is outside public directories
- [ ] Admin endpoint requires authentication (implement as needed)
- [ ] HTTPS enabled on production (redirects HTTP to HTTPS)
- [ ] Email validation prevents injection attacks
- [ ] Input sanitization on all endpoints

## Troubleshooting

### "EADDRINUSE: address already in use :::3001"
Port 3001 is already in use:
```bash
# Find process using port 3001
lsof -i :3001

# Kill it
kill -9 <PID>
```

### Database locked error
Better-sqlite3 uses WAL mode which prevents locking. If you see locks:
```bash
# Check for corrupted WAL files
ls -la data/

# Delete WAL files (if database is corrupted)
rm data/3cmall.db-wal data/3cmall.db-shm
```

### Emails not sending
1. Check SMTP credentials in `.env`
2. Verify internet connection
3. Check Gmail security settings
4. Look for error logs in console

## Next Steps

1. **Email Templates**: Customize email design in `email.js`
2. **Admin Dashboard**: Build UI for viewing `/api/report/summary` results
3. **Scheduled Reports**: Add node-cron for daily summary emails
4. **Authentication**: Implement proper JWT/session auth for admin endpoints
5. **Analytics**: Track metrics like signup sources, code success rates

## Support

For issues:
1. Check server logs for error messages
2. Review this guide's Troubleshooting section
3. Verify all environment variables are set correctly
4. Test endpoints with curl before integrating with frontend
