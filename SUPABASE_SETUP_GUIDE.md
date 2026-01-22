# Supabase Setup Guide for 3C Mall

## Architecture Note
Your backend is deployed on **Render** (production-safe). Only the **frontend runs locally**. All API calls go through Render to reach Supabase.

## What We Just Wired

✅ **Frontend Auth System:**
- Supabase client initialized (`src/lib/supabaseClient.js`)
- Auth context with `useAuth()` hook (`src/context/AuthContext.jsx`)
- Login/Sign-up page fully functional (`src/pages/Login.jsx`)
- Protected app routes (redirect to login if not authenticated)
- Session persistence

✅ **What's Ready in Backend:**
- Supabase service role client (`server/supabase.js`)
- Waitlist endpoint already writes to Supabase
- Email sending configured (Resend, SendGrid, SMTP)
- Rate limiting and compliance monitoring

---

## What You Need to Do (4 Steps)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `3c-mall` (or similar)
   - **Database Password**: Strong password (save this!)
   - **Region**: Pick closest to users (e.g., us-east-1)
4. Wait for project creation (~2 minutes)

### Step 2: Get Your API Keys

Once project loads:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`
   - **Service Role Key** (Tab: "Service role") → `SUPABASE_SERVICE_ROLE_KEY` (backend only)

### Step 3: Create `.env` Files

**Frontend (`.env` in root):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_API_BASE=http://localhost:3001
VITE_REPORT_WAITLIST=true
VITE_ALPHA_CHIP=1
```

**Backend (`server/.env`) — Deployed on Render:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
RESEND_API_KEY=re_...
SENDER_EMAIL=noreply@the3cmall.app
REPORT_EMAIL=your-email@example.com
ADMIN_EMAIL=your-email@example.com
ADMIN_TOKEN=dev-token-replace-in-prod
PORT=3001
CORS_ORIGIN=http://localhost:5173,https://the3cmall.com,https://the3cmall.app
```

**Note:** Backend is already deployed on Render (production-safe). These env vars are configured there.

### Step 4: Run Setup SQL

In Supabase dashboard:

1. Go to **SQL Editor**
2. Create new query
3. Paste contents of [SUPABASE_SETUP.sql](SUPABASE_SETUP.sql)
4. Click **Run**

This creates all needed tables:
- `auth.users` (built-in Supabase)
- `email_consents` (CAN-SPAM tracking)
- `user_preferences` (User settings)
- `user_activity` (Audit logging)
- `waitlist` (Already being used!)

---

## Test the Auth Flow Locally

### Frontend Only
```bash
npm run dev
# Should start on http://localhost:5173
# Backend is on Render (production)
```

### Test Flow:

1. **Sign Up**: Go to `/login` → "Create Account"
   - Email: `test@example.com`
   - Password: `TestPassword123`
   - Confirm: `TestPassword123`
   - Click "Create Account"
   - You should see: "✅ Account created! Check your email for confirmation."

2. **Check Email**: 
   - Go to Supabase dashboard → **Authentication** → **Users**
   - You should see your new user (status: "Unconfirmed" until email verified)
   - Supabase will show a confirmation link

3. **Log In**: Go back to `/login` → "Log In"
   - Email: `test@example.com`
   - Password: `TestPassword123`
   - Click "Log In"
   - Should redirect to `/app` automatically

4. **Access Protected Route**:
   - You should see the Dashboard
   - Navigate around `/app/*` freely
   - If you log out (in Settings), you'll be redirected to `/login`

---

## What's Happening Behind the Scenes

### Frontend Auth Flow:
1. User enters email + password on `/login`
2. `useAuth()` calls `supabase.auth.signInWithPassword()`
3. Supabase returns session with `user` object
4. AuthContext stores `user` state
5. ProtectedRoute checks `isAuthenticated` — redirects if false
6. On navigation to `/app`, session is validated automatically

### Backend Auth Flow (Next Phase):
Backend will use `SUPABASE_SERVICE_ROLE_KEY` to:
- Create user profiles
- Store user preferences
- Track activity
- Manage subscriptions

---

## Common Issues & Fixes

### "Supabase env vars missing"
**Problem:** Console shows warning about missing env vars  
**Fix:** Make sure `.env` file exists with correct keys

### "Invalid login credentials"
**Problem:** Login fails with "Invalid login credentials"  
**Fix:** 
- Make sure email exists in Supabase Users table
- Double-check password is correct
- Verify user email is confirmed (Supabase dashboard → Auth → Users)

### "CORS error"
**Problem:** Network error when signing up  
**Fix:** 
- Check CORS_ORIGIN in `server/.env` includes `http://localhost:5173`
- Restart backend server

### "Redirect to /login keeps happening"
**Problem:** Can't stay logged in  
**Fix:** 
- Check browser localStorage (open DevTools → Application → Storage)
- Look for `sb-*` entries (Supabase session)
- Clear localStorage and try again: `localStorage.clear()`

---

## Next: Wire User Data

Once auth works, you can:

1. **Create user profiles** on sign-up (name, household, goals)
2. **Store meal plans** in `user_preferences`
3. **Track grocery savings** in activity log
4. **Sync profile** across pages

This unlocks:
- Real meal plan persistence (not just localStorage)
- Household multi-user support (Family plan)
- Progress tracking across sessions
- Premium/subscription features

---

## Files Modified

- ✅ `src/lib/supabaseClient.js` (NEW)
- ✅ `src/context/AuthContext.jsx` (NEW)
- ✅ `src/pages/Login.jsx` (UPDATED)
- ✅ `src/App.jsx` (UPDATED)
- ✅ `npm install @supabase/supabase-js` (NEW PACKAGE)

## Files Ready but Not Yet Wired

- 🔄 `server/index.js` — Can now use `supabase` for user data
- 🔄 `src/pages/DashboardPage.jsx` — Can now show `user.email`
- 🔄 `src/context/AuthContext.jsx` — Can add profile loading
