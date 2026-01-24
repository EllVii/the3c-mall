# Email Verification & Redirect Setup

## Problem Fixed
Email verification links were pointing to `localhost:3000` instead of your production domain.

## Solution
We now use the `VITE_SITE_URL` environment variable for email redirects, with a fallback to the current origin.

---

## Setup Instructions

### 1. Configure Environment Variables

#### For Local Development
In your `.env` file:
```env
VITE_SITE_URL=http://localhost:5173
```

#### For Production (Render, Vercel, Netlify, etc.)
Set environment variable in your hosting platform:
```env
VITE_SITE_URL=https://the3cmall.com
```
*(Replace with your actual production domain)*

---

### 2. Configure Supabase Redirect URLs

**Critical:** You must add your production domain to Supabase's allowed redirect URLs.

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add these to **Redirect URLs**:
   ```
   http://localhost:5173/app
   http://localhost:5173/auth/reset-password
   https://the3cmall.com/app
   https://the3cmall.com/auth/reset-password
   https://www.the3cmall.com/app
   https://www.the3cmall.com/auth/reset-password
   ```
   *(Include both with and without `www` if applicable)*

5. Set **Site URL** to: `https://the3cmall.com`

6. Click **Save**

---

### 3. Deployment Platform Configuration

#### Render
In your Render dashboard:
1. Go to your frontend service
2. Navigate to **Environment** tab
3. Add environment variable:
   - **Key**: `VITE_SITE_URL`
   - **Value**: `https://the3cmall.com` (or your Render URL like `https://the3cmall.onrender.com`)

#### Vercel
In `vercel.json` or via Vercel dashboard:
```json
{
  "env": {
    "VITE_SITE_URL": "https://the3cmall.com"
  }
}
```

#### Netlify
In `netlify.toml`:
```toml
[build.environment]
  VITE_SITE_URL = "https://the3cmall.com"
```

Or add in Netlify dashboard under **Site settings** → **Environment variables**

---

### 4. Update Your .env Files

Create environment-specific files:

**.env.development** (for local dev):
```env
VITE_SITE_URL=http://localhost:5173
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE=http://localhost:3001
```

**.env.production** (for production builds):
```env
VITE_SITE_URL=https://the3cmall.com
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE=https://threecmall-backend.onrender.com
```

---

## How It Works

### Sign Up Flow
1. User creates account at `https://the3cmall.com/login`
2. Supabase sends verification email
3. Email contains link: `https://the3cmall.com/app?token=...`
4. User clicks link → redirected to your production app
5. Token is verified → user is logged in

### Password Reset Flow
1. User requests password reset
2. Supabase sends reset email
3. Email contains link: `https://the3cmall.com/auth/reset-password?token=...`
4. User clicks link → redirected to reset password page
5. User sets new password → logged in

---

## Testing

### Test Email Verification in Production

1. Deploy your app with `VITE_SITE_URL` set to production domain
2. Create a new account
3. Check email - link should point to `https://the3cmall.com/app`
4. Click link - should redirect to your production app

### Test Password Reset

1. Go to login page
2. Click "Forgot Password"
3. Enter email
4. Check email - link should point to `https://the3cmall.com/auth/reset-password`
5. Click link - should open password reset page on production

---

## Troubleshooting

### Issue: Email links still point to localhost
**Solution**: 
- Check that `VITE_SITE_URL` is set in your production environment
- Rebuild and redeploy your app after setting the variable
- Clear browser cache

### Issue: "Invalid redirect URL" error
**Solution**:
- Ensure the redirect URL is added to Supabase **Authentication** → **URL Configuration**
- Include both `/app` and `/auth/reset-password` paths
- Include both `www` and non-`www` versions if applicable

### Issue: Email verification works locally but not in production
**Solution**:
- Verify `VITE_SITE_URL` is set correctly in production environment
- Check Supabase logs for any redirect errors
- Ensure production domain matches exactly (including https://)

### Issue: "Email link is invalid or has expired"
**Solution**:
- Email confirmation links expire after 1 hour (Supabase default)
- User needs to request a new verification email
- Check if email was already verified

---

## Security Notes

1. **Always use HTTPS in production**: `https://the3cmall.com`, not `http://`
2. **Only add trusted domains** to Supabase redirect URLs
3. **Don't commit production URLs** to version control if they contain sensitive info
4. **Use environment variables** for all environment-specific URLs

---

## Quick Reference

| Environment | VITE_SITE_URL | Where to Set |
|-------------|---------------|--------------|
| Local Dev | `http://localhost:5173` | `.env` or `.env.development` |
| Production | `https://the3cmall.com` | Hosting platform (Render/Vercel/Netlify) |

| Purpose | Redirect Path | Must Add to Supabase |
|---------|---------------|---------------------|
| Email Verification | `/app` | ✅ Yes |
| Password Reset | `/auth/reset-password` | ✅ Yes |

---

## Next Steps

1. ✅ Set `VITE_SITE_URL` in production environment
2. ✅ Add redirect URLs to Supabase dashboard
3. ✅ Redeploy your app
4. ✅ Test sign up flow
5. ✅ Test password reset flow

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs/guides/auth/redirect-urls
- Your Supabase Dashboard: https://app.supabase.com
