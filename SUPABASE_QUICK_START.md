# Supabase Setup — Quick Start (11 Minutes)

**Architecture Note:** Your backend is deployed on Render (production-safe). Frontend locally connects via `VITE_API_BASE` to Render.

## 1. Create Project (2 min)
```
→ supabase.com
→ "Start your project"
→ Sign in / Create account
→ "New project"
  - Name: 3c-mall
  - Password: [strong password]
  - Region: [closest to users]
→ Wait for "Your project is ready"
```

## 2. Get API Keys (1 min)
```
In Supabase dashboard:
→ Settings (bottom left)
→ API
→ Copy these three:

VITE_SUPABASE_URL = "Project URL"
VITE_SUPABASE_ANON_KEY = "anon" row, "key" column
SUPABASE_SERVICE_ROLE_KEY = Switch tab to "Service role" → copy key
```

## 3. Create `.env` Files (2 min)

**File: `.env` (in root)**
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_API_BASE=https://your-render-app.onrender.com
VITE_SITE_URL=http://localhost:5173
VITE_REPORT_WAITLIST=true
```

**Note:** 
- `VITE_API_BASE` points to your Render backend URL (production-safe)
- `VITE_SITE_URL` is used for email verification redirects

**File: `server/.env`**
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
RESEND_API_KEY=re_...
SENDER_EMAIL=noreply@the3cmall.app
REPORT_EMAIL=your-email@example.com
ADMIN_EMAIL=your-email@example.com
ADMIN_TOKEN=dev-token-12345
PORT=3001
CORS_ORIGIN=http://localhost:5173,https://the3cmall.com,https://the3cmall.app
```

**Note:** Backend is on Render (production). Frontend env uses Render URL for API calls.

## 4. Configure Redirect URLs (2 min)

**Important:** Configure where email verification links should redirect.

In Supabase dashboard:
```
→ Authentication (left menu)
→ URL Configuration
→ Site URL: http://localhost:5173
→ Redirect URLs: Add these lines
   http://localhost:5173/app
   http://localhost:5173/auth/reset-password
→ Click "Save"
```

**For Production:** Add your production URLs too:
```
→ Redirect URLs: Add these additional lines
   https://the3cmall.com/app
   https://the3cmall.com/auth/reset-password
→ Update Site URL to: https://the3cmall.com
```

## 5. Run SQL Setup (1 min)

In Supabase dashboard:
```
→ SQL Editor (left menu)
→ New query
→ Copy all text from SUPABASE_SETUP.sql (in repo root)
→ Paste into query
→ Click "Run"
→ Should see: "Success" messages
```

## 6. Start Servers (2 min)

**Terminal 1: Frontend Only** (backend is on Render)
```bash
npm run dev
# Shows: "VITE v5.x.x ready in xxx ms"
```

## 7. Test It (3 min)

1. Open http://localhost:5173/login
2. Click "Create Account"
3. Enter:
   - Email: test@example.com
   - Password: Test123456
   - Confirm: Test123456
4. Click "Create Account"
5. See: "✅ Account created! Check your email..."
6. Click "Log In" tab
7. Enter email + password again
8. Click "Log In"
9. **Should redirect to `/app` dashboard ✅**

## 🎉 Done!

You now have:
- ✅ Real user accounts
- ✅ Email verification
- ✅ Password reset
- ✅ Persistent sessions
- ✅ Protected routes

## ❌ Not Working?

Check these:
1. `.env` file exists in root (not just `server/`)
2. `.env` values match exactly (copy/paste from dashboard)
3. `VITE_API_BASE` points to your Render backend URL
4. Frontend is running on port 5173
5. Render backend is running (check render.com dashboard)
6. Check browser console (F12) for errors
7. Check network tab to see if API calls reach Render

## 📖 Full Guide

See `SUPABASE_SETUP_GUIDE.md` for detailed troubleshooting.

## Next Phase

Once auth works locally:
1. Add user profile creation (name, goals, household)
2. Store meal plans in database (not localStorage)
3. Track grocery savings
4. Build multi-user households
5. Add payment/subscription

---

**Total setup time: ~11 minutes**  
**Your biggest blocker just got removed.** 🚀
