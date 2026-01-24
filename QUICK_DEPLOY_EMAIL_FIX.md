# 🚀 Quick Deploy Card - Email Verification Fix

## ⚡ 2-Minute Setup

### Step 1: Supabase (2 min)
```
1. Go to: app.supabase.com → Your Project
2. Click: Authentication → URL Configuration
3. Add these to Redirect URLs:
   
   http://localhost:5173/app
   http://localhost:5173/auth/reset-password
   https://the3cmall.com/app
   https://the3cmall.com/auth/reset-password

4. Set Site URL to: https://the3cmall.com
5. Save
```

### Step 2: Production Environment (1 min)
**Where you deploy your frontend (pick one):**

**Render:**
```
Dashboard → Environment → Add Variable
  VITE_SITE_URL = https://the3cmall.com
  (or your-app.onrender.com)
→ Save → Redeploy
```

**Vercel:**
```
Settings → Environment Variables → Add
  VITE_SITE_URL = https://the3cmall.com
→ Redeploy
```

**Netlify:**
```
Site settings → Environment variables → Add
  VITE_SITE_URL = https://the3cmall.com
→ Trigger deploy
```

### Step 3: Test (1 min)
```
1. Go to: https://the3cmall.com/login
2. Create account
3. Check email
4. Verify link is: https://the3cmall.com/app?token=...
   (NOT localhost)
5. Click link → Should work! ✅
```

---

## 📋 Checklist

- [ ] Added redirect URLs to Supabase
- [ ] Set VITE_SITE_URL in production env
- [ ] Redeployed production app
- [ ] Tested sign up flow
- [ ] Verified email link is correct
- [ ] Clicked email link successfully

---

## 🆘 Troubleshooting

**Email link still shows localhost:**
→ Check VITE_SITE_URL is set in production
→ Rebuild/redeploy app

**"Invalid redirect URL" error:**
→ Add URL to Supabase redirect list
→ Make sure it matches exactly (https://, no trailing slash)

**Environment variable not working:**
→ Make sure it starts with VITE_
→ Rebuild required for Vite env vars
→ Check spelling: VITE_SITE_URL

---

## 📱 Support Docs

- Full Guide: [EMAIL_REDIRECT_SETUP.md](EMAIL_REDIRECT_SETUP.md)
- Checklist: [EMAIL_VERIFICATION_CHECKLIST.md](EMAIL_VERIFICATION_CHECKLIST.md)
- Flow Diagram: [EMAIL_FLOW_DIAGRAM.md](EMAIL_FLOW_DIAGRAM.md)

---

**That's it!** Email verification now works in production. 🎉
