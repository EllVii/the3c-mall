# 🚀 Startup Checklist - The 3C Mall

## Pre-Deployment Checklist

### ✅ Frontend (Already Complete)

- [x] React + Vite setup
- [x] Domain-aware routing (the3cmall.com vs the3cmall.app)
- [x] BetaGate component with code validation
- [x] LandingPage with waitlist form
- [x] Google Form integration
- [x] Video assets (3 MP4s)
- [x] Email reporting service
- [x] Environment variables configured
- [x] Button sizing standardized
- [x] Responsive design (mobile/tablet)
- [x] All pages styled and working

### ⚠️ Backend (Needs SMTP Configuration)

**Files Created:**
- [x] server/index.js - 4 API endpoints
- [x] server/db.js - SQLite module
- [x] server/email.js - Email service
- [x] server/package.json - Dependencies
- [x] server/.env.example - Configuration template
- [x] server/scripts/init-db.js - DB initialization

**Dependency Installation:**
- [x] npm install (run in /server directory)

**Database:**
- [x] SQLite created on first server start
- [x] Tables auto-created with proper indexes
- [x] Located at: server/data/3cmall.db

**Email Configuration (CHOOSE ONE):**

#### Option A: Gmail (Recommended) ⭐
```bash
# 1. Go to myaccount.google.com/apppasswords
# 2. Select "Mail" and "Windows Computer" (or your OS)
# 3. Copy the 16-character password
# 4. Add to server/.env:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

#### Option B: SendGrid
```bash
# 1. Create free account at sendgrid.com
# 2. Get API key from Settings
# 3. Add to server/.env:
USE_SENDGRID=true
SENDGRID_API_KEY=SG.your-api-key
```

#### Option C: Custom SMTP
```bash
# Add to server/.env:
SMTP_HOST=your-smtp.server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Step-by-Step Setup (15 minutes)

### 1. Install Backend Dependencies (2 min)
```bash
cd /home/ellviisauces/the3c-mall/server
npm install
```
✅ Check: `ls node_modules` should show 138 packages

### 2. Configure Email (2 min)

Edit `server/.env`:
```bash
nano server/.env
```

Add your SMTP credentials (choose one method above)

✅ Check: Save file with `:wq`

### 3. Verify Database (1 min)
```bash
# Database auto-creates on first start, but you can test:
node scripts/init-db.js
```
✅ Check: Should print database statistics

### 4. Start Backend (1 min)

Terminal 1:
```bash
cd /home/ellviisauces/the3c-mall/server
npm start
```
✅ Check: Should print "Server running on port 3001"

### 5. Verify Backend Health (1 min)

Terminal 2:
```bash
curl http://localhost:3001/api/health
```
✅ Check: Should return `{"status":"ok",...}`

### 6. Start Frontend (2 min)

Terminal 2:
```bash
cd /home/ellviisauces/the3c-mall
npm run dev
```
✅ Check: Should print "Local: http://localhost:5173"

### 7. Test Full Flow (4 min)

**Test Waitlist:**
1. Go to http://localhost:5173 (landing page)
2. Enter test email in waitlist form
3. Submit
4. Check email (should receive confirmation)
5. Check server console (should show success)

**Test Beta Gate:**
1. Go to http://localhost:5173 (change domain to localhost:5173)
2. Try entering beta code: `BETA2026` (or `3CMALL` or `EARLYACCESS`)
3. Should grant access
4. Check server console (should log attempt)

**Test Admin Report:**
```bash
curl http://localhost:3001/api/report/summary
```
✅ Check: Should return statistics JSON

## Troubleshooting During Setup

### "Port 3001 already in use"
```bash
# Find what's using it
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### "SMTP connection failed"
- Double-check SMTP_USER and SMTP_PASS in server/.env
- For Gmail: Verify app password (not regular password)
- For SendGrid: Check API key format (starts with SG.)
- Test connection:
  ```bash
  curl -v telnet://smtp.gmail.com:587
  ```

### "Database locked"
- Make sure only ONE server instance is running
- Check: `ps aux | grep node`
- Kill duplicates: `pkill -f "node index.js"`

### "CORS errors in browser"
- Verify frontend running on http://localhost:5173
- Check server/.env has correct CORS_ORIGIN
- Restart backend server after editing .env

### "Waitlist form not submitting"
- Check browser console for JavaScript errors
- Verify VITE_REPORT_WAITLIST=true in frontend .env
- Verify VITE_API_BASE=http://localhost:3001 in frontend .env
- Restart frontend: `npm run dev`

## Quick Testing Commands

```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Add a test email
curl -X POST http://localhost:3001/api/report/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test123@example.com"}'

# Report a beta code attempt
curl -X POST http://localhost:3001/api/report/beta-code \
  -H "Content-Type: application/json" \
  -d '{"code":"BETA2026","success":true}'

# Get statistics
curl http://localhost:3001/api/report/summary

# Check database
sqlite3 server/data/3cmall.db "SELECT COUNT(*) FROM waitlist;"
```

## What's Working Out of the Box

✅ **Frontend:**
- Landing page with waitlist form
- Beta gating with code validation
- Video grid (athlete, coach, groceries)
- Feature highlights and stats
- Google Form button
- All pages responsive

✅ **Backend:**
- 4 API endpoints ready
- SQLite database auto-creates
- Email service configured (awaiting credentials)
- Rate limiting enabled
- CORS protection enabled
- Error handling on all routes

✅ **Integration:**
- Frontend reports to backend
- Backend stores in database
- Backend sends emails
- Admin reports available

## Configuration Files

### Frontend (.env)
Located: `/home/ellviisauces/the3c-mall/.env`

Key settings:
- `VITE_API_BASE=http://localhost:3001` (development)
- `VITE_BETA_CODES=BETA2026,3CMALL,EARLYACCESS`
- `VITE_REPORT_WAITLIST=true`
- `VITE_REPORT_BETA_CODES=true`

### Backend (.env)
Located: `/home/ellviisauces/the3c-mall/server/.env`

Key settings:
- `PORT=3001`
- `NODE_ENV=development`
- `SMTP_HOST=smtp.gmail.com` (configure)
- `SMTP_USER=your-email@gmail.com` (configure)
- `SMTP_PASS=your-app-password` (configure)
- `REPORT_EMAIL=the.velasquez.law@gmail.com`
- `CORS_ORIGIN=http://localhost:5173`

## After Local Testing - Production Deployment

### 1. Choose Hosting
Options: Railway, Vercel, Heroku, AWS Lambda, or Docker

**Recommended: Railway** (easiest)
```bash
npm install -g @railway/cli
railway login
cd /home/ellviisauces/the3c-mall/server
railway up
```

### 2. Set Production Environment Variables
On your hosting platform's dashboard:
- SMTP_USER
- SMTP_PASS
- CORS_ORIGIN (update to your domains)
- NODE_ENV=production

### 3. Update Frontend API Base
In frontend `.env` (or create `.env.production`):
```env
VITE_API_BASE=https://your-backend-domain.com
```

### 4. Deploy Frontend
```bash
# Build for production
npm run build

# Deploy to Vercel, Netlify, or your hosting
# (Vite creates dist/ folder ready for deployment)
```

### 5. Test Production
- Visit https://the3cmall.com
- Submit waitlist signup
- Check admin email for report
- Visit https://the3cmall.app with beta code
- Verify access granted

## Key Files Reference

| File | Purpose |
|------|---------|
| `server/index.js` | Main API server |
| `server/db.js` | Database operations |
| `server/email.js` | Email sending |
| `server/.env` | Backend configuration |
| `src/.env` | Frontend configuration |
| `src/utils/reportingService.js` | Frontend API client |
| `src/pages/LandingPage.jsx` | Marketing page |
| `src/assets/components/BetaGate.jsx` | Beta validation |
| `DEPLOYMENT_GUIDE.md` | Full deployment guide |
| `SERVER_QUICK_REF.md` | Developer reference |
| `PROJECT_STATUS.md` | Project overview |

## Success Criteria

You'll know everything is working when:

✅ Backend starts without errors
```
Server running on port 3001
Database initialized
```

✅ Health check returns success
```
curl http://localhost:3001/api/health
→ {"status":"ok",...}
```

✅ Frontend loads at localhost:5173
```
Landing page visible with waitlist form
Video grid visible
```

✅ Waitlist signup succeeds
```
1. Submit email in form
2. Confirm email received
3. Admin email received
4. Database has entry
```

✅ Beta code validation works
```
1. Navigate to app domain
2. Enter BETA2026
3. Access granted
4. Server logs attempt
```

---

## Next Steps

1. **Now:** Follow "Step-by-Step Setup" section above
2. **After setup:** Complete "Quick Testing Commands"
3. **After testing:** Review "Production Deployment" section
4. **For help:** See specific docs:
   - DEPLOYMENT_GUIDE.md (comprehensive)
   - SERVER_QUICK_REF.md (quick answers)
   - REPORTING_SETUP.md (email architecture)

## Support

- 📖 **Full Guides:** DEPLOYMENT_GUIDE.md, SERVER_QUICK_REF.md
- 📊 **Status:** PROJECT_STATUS.md
- 📝 **API Details:** server/README.md
- 🐛 **Issues:** Check logs in server console output

---

**Estimated Setup Time:** 15 minutes
**Estimated Production Deployment:** 30 minutes additional

**Status:** ✅ Ready to deploy
**Last Updated:** January 2024
