# Backend Server - Quick Reference

## Directory Structure
```
server/
├── index.js              # Main Express app with API endpoints
├── db.js                 # SQLite database module
├── email.js              # Email service with Nodemailer
├── package.json          # Dependencies
├── .env                  # Configuration (local)
├── .env.example          # Configuration template
├── README.md             # Full documentation
└── scripts/
    └── init-db.js        # Database initialization script
```

## Starting the Server

**Development:**
```bash
cd server
npm run dev
```

**Production:**
```bash
cd server
npm start
```

**Test Health:**
```bash
curl http://localhost:3001/api/health
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/report/waitlist` | Add email to waitlist |
| POST | `/api/report/beta-code` | Log beta code usage |
| GET | `/api/report/summary` | Get statistics (admin) |
| GET | `/api/health` | Server health check |

## Environment Variables Required

```env
# Email Service (choose one)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Or use SendGrid
USE_SENDGRID=false
SENDGRID_API_KEY=SG.xxx

# Reporting
REPORT_EMAIL=the.velasquez.law@gmail.com
ADMIN_EMAIL=the.velasquez.law@gmail.com

# Server Config
PORT=3001
NODE_ENV=development
```

## Frontend Configuration

In `/src/.env`:
```env
VITE_API_BASE=http://localhost:3001
VITE_REPORT_WAITLIST=true
VITE_REPORT_BETA_CODES=true
```

## Database Schema

**3 Tables:**
- `waitlist` - Email signups with metadata
- `beta_attempts` - Beta code usage log
- `activity_log` - General activity audit trail

**All automatically created** on first server start.

## Testing Endpoints

### Waitlist Signup
```bash
curl -X POST http://localhost:3001/api/report/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
    "userAgent": "Test Client"
  }'
```

### Beta Code Attempt
```bash
curl -X POST http://localhost:3001/api/report/beta-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BETA2026",
    "success": true,
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
  }'
```

### Get Summary
```bash
curl http://localhost:3001/api/report/summary
```

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port 3001 already in use | `lsof -i :3001` then `kill -9 <PID>` |
| Emails not sending | Check SMTP_USER/SMTP_PASS, verify Gmail app password |
| CORS errors | Check CORS_ORIGIN includes your frontend domain |
| Database locked | Verify no other process has database open |

## Email Setup (Gmail)

1. Go to myaccount.google.com/apppasswords
2. Select Mail + your device
3. Copy 16-character password
4. Set `SMTP_PASS=` to this password in `.env`

## File Locations

| Purpose | Location |
|---------|----------|
| Database | `server/data/3cmall.db` |
| Environment | `server/.env` |
| Logs | Server console stdout |
| Configuration Template | `server/.env.example` |

## Next Steps After Setup

1. ✅ Install dependencies: `npm install`
2. ✅ Configure SMTP: Edit `server/.env`
3. ✅ Start server: `npm start`
4. ✅ Test endpoint: `curl http://localhost:3001/api/health`
5. ✅ Deploy: Railway, Vercel, Heroku, or Docker
6. ⚠️ Update frontend `VITE_API_BASE` for production
7. ⚠️ Implement admin authentication for `/api/report/summary`
8. ⚠️ Set up scheduled daily report emails

## Support Files

- Full setup guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Server code: [server/README.md](./server/README.md)
- API documentation: [REPORTING_SETUP.md](./REPORTING_SETUP.md)

## Architecture Overview

```
Frontend (React)
├─ LandingPage.jsx (waitlist form) 
├─ BetaGate.jsx (beta code validation)
└─ reportingService.js (API calls)
        ↓
        ↓ HTTP/POST, JSON
        ↓
Backend (Node.js/Express)
├─ index.js (routes & middleware)
├─ email.js (Nodemailer service)
├─ db.js (SQLite queries)
└─ data/3cmall.db (SQLite DB)
        ↓
        ↓ SMTP (Gmail/SendGrid)
        ↓
Admin Email: the.velasquez.law@gmail.com
```

---
**Last Updated:** January 2024
**Status:** ✅ Complete and ready for deployment
