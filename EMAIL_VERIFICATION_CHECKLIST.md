# Email Verification Production Checklist

## ✅ What Was Fixed
- Email verification links now use environment-based URLs instead of hardcoded localhost
- Password reset links now use environment-based URLs
- Added `VITE_SITE_URL` configuration for production

---

## 🚀 Deployment Steps

### Step 1: Configure Supabase (5 minutes)
Go to: https://app.supabase.com

1. Select your project
2. Navigate to **Authentication** → **URL Configuration**
3. **Site URL**: Set to `https://the3cmall.com` (your production domain)
4. **Redirect URLs**: Add all these:
   ```
   http://localhost:5173/app
   http://localhost:5173/auth/reset-password
   https://the3cmall.com/app
   https://the3cmall.com/auth/reset-password
   https://www.the3cmall.com/app
   https://www.the3cmall.com/auth/reset-password
   ```
5. Click **Save**

---

### Step 2: Set Production Environment Variables

Choose your hosting platform:

#### Option A: Render
1. Go to your Render dashboard
2. Select your **frontend** service (or create one if needed)
3. Go to **Environment** tab
4. Add these variables:
   ```
   VITE_SITE_URL = https://your-app.onrender.com
   VITE_API_BASE = https://threecmall-backend.onrender.com
   VITE_SUPABASE_URL = https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJI...
   ```
5. Click **Save**
6. Trigger a redeploy

#### Option B: Vercel
1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:
   ```
   VITE_SITE_URL = https://the3cmall.com
   VITE_API_BASE = https://threecmall-backend.onrender.com
   VITE_SUPABASE_URL = https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJI...
   ```
4. Redeploy from **Deployments** tab

#### Option C: Netlify
1. Go to your Netlify site
2. Navigate to **Site settings** → **Environment variables**
3. Add these variables:
   ```
   VITE_SITE_URL = https://the3cmall.com
   VITE_API_BASE = https://threecmall-backend.onrender.com
   VITE_SUPABASE_URL = https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJI...
   ```
4. Trigger a redeploy

---

### Step 3: Verify Local Development Still Works

```bash
# In your .env file, make sure you have:
VITE_SITE_URL=http://localhost:5173
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE=http://localhost:3001
```

Test locally:
```bash
npm run dev
```

1. Go to http://localhost:5173/login
2. Create a test account
3. Check email - link should point to `http://localhost:5173/app`

---

### Step 4: Test Production Email Verification

After deployment:

1. **Test Sign Up**:
   - Go to `https://the3cmall.com/login`
   - Create a new account with a real email
   - Check your email inbox
   - **Verify**: Email link should be `https://the3cmall.com/app?token=...`
   - Click the link
   - **Expected**: Redirected to production app, logged in

2. **Test Password Reset**:
   - Go to `https://the3cmall.com/login`
   - Click "Forgot Password"
   - Enter email
   - Check your email inbox
   - **Verify**: Email link should be `https://the3cmall.com/auth/reset-password?token=...`
   - Click the link
   - **Expected**: Redirected to password reset page on production

---

## 🔍 Troubleshooting

### Email Links Still Point to Localhost

**Cause**: `VITE_SITE_URL` not set in production environment

**Fix**:
1. Check your hosting platform's environment variables
2. Ensure `VITE_SITE_URL=https://the3cmall.com` is set
3. Rebuild and redeploy the app

### "Invalid Redirect URL" Error

**Cause**: URL not in Supabase's allowed redirect list

**Fix**:
1. Go to Supabase Dashboard
2. Authentication → URL Configuration
3. Add the redirect URL to the list
4. Make sure it matches exactly (including https://)

### Environment Variable Not Loading

**Cause**: Vite requires `VITE_` prefix for client-side variables

**Fix**:
- Ensure variable name starts with `VITE_` (e.g., `VITE_SITE_URL`)
- Rebuild the app after adding/changing env vars
- For build-time variables, redeploy is required

---

## 📋 Final Checklist

Before marking this as complete:

- [ ] Supabase redirect URLs configured
- [ ] `VITE_SITE_URL` set in production environment
- [ ] Production app redeployed with new env variable
- [ ] Test email verification link points to production domain
- [ ] Test password reset link points to production domain
- [ ] Test that email verification actually works (click link, get logged in)
- [ ] Test local development still works with localhost URLs
- [ ] Backend CORS allows your production domain

---

## 🎯 Quick Test Commands

### Check if environment variables are loaded (in browser console):
```javascript
// On production site
console.log('Site URL:', import.meta.env.VITE_SITE_URL);
console.log('API Base:', import.meta.env.VITE_API_BASE);
```

### Check backend CORS (in terminal):
```bash
curl -I https://threecmall-backend.onrender.com/api/health
# Should see: Access-Control-Allow-Origin: *
```

---

## 📚 Reference

- [EMAIL_REDIRECT_SETUP.md](./EMAIL_REDIRECT_SETUP.md) - Detailed setup guide
- [Supabase Redirect URLs Docs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Last Updated**: January 23, 2026
**Status**: ✅ Code Fixed, Awaiting Production Deployment
