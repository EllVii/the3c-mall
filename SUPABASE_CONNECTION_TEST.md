# Supabase Connection Test Guide

## Quick Test

Once everything is set up, you can verify Supabase is connected:

### Option 1: Frontend Test Page
```
http://localhost:5173/health/supabase
```
Shows:
- ✅ Connection status
- API endpoint being used
- Diagnostic info
- Full JSON response

### Option 2: Direct API Call
```bash
curl https://your-render-app.onrender.com/api/health/supabase
```

Expected success response:
```json
{
  "status": "success",
  "message": "✅ Supabase connection verified",
  "supabase": {
    "url": "https://xxxxx.supabase.co...",
    "connected": true,
    "timestamp": "2026-01-21T..."
  }
}
```

Expected error response (missing env vars):
```json
{
  "status": "error",
  "message": "Supabase env vars not configured",
  "env": {
    "SUPABASE_URL": false,
    "SUPABASE_SERVICE_ROLE_KEY": false
  }
}
```

### Option 3: Use Frontend Test Function
In any React component:
```jsx
import { testSupabaseConnection } from "../utils/supabaseTest";

function MyComponent() {
  async function checkConnection() {
    const result = await testSupabaseConnection();
    console.log("Supabase test:", result);
    // {
    //   status: "success",
    //   message: "✅ Supabase connection verified",
    //   supabase: { url, connected, timestamp }
    // }
  }

  return <button onClick={checkConnection}>Test Supabase</button>;
}
```

## What Gets Tested

1. **Env vars loaded** — Checks if `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
2. **Database connection** — Attempts to query the `email_consents` table
3. **Query execution** — Verifies SELECT permissions work
4. **Timestamp** — Returns when test ran (confirms real-time response)

## Troubleshooting

### ❌ "Supabase env vars not configured"
**Meaning:** Env vars not set on Render  
**Fix:**
1. Go to Render dashboard → 3cmall-backend service
2. Environment tab
3. Add:
   - `SUPABASE_URL` = Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Your service role key
4. Redeploy

### ❌ "Supabase query failed"
**Meaning:** Connection made but query failed  
**Fix:**
1. Verify Supabase project exists
2. Verify SQL tables were created (run SUPABASE_SETUP.sql)
3. Check Supabase dashboard for errors

### ❌ "Failed to reach backend"
**Meaning:** Frontend can't reach Render backend  
**Fix:**
1. Verify `VITE_API_BASE` in frontend `.env` is correct
2. Check Render app URL is working
3. Verify CORS is configured (should be `*` for dev)

## What This Endpoint Does NOT Test

- ❌ Email sending (use POST /api/report/waitlist for that)
- ❌ Stripe integration
- ❌ Kroger API
- ❌ Frontend authentication

It **only verifies Supabase database connection**, which is the foundation for everything else.

## Files Added

- `src/pages/SupabaseHealthCheck.jsx` — Visual test page
- `src/utils/supabaseTest.js` — Test function
- `server/index.js` — `GET /api/health/supabase` endpoint
- Route: `/health/supabase` — Public test page

## Next Steps

Once test passes:
1. ✅ Supabase is connected
2. ✅ Backend can reach database
3. ✅ Ready to test sign-up/login
4. ✅ Ready to store user data

---

**Test URL:** `http://localhost:5173/health/supabase` (local)  
**Test URL (Render):** `https://your-render-app.onrender.com/api/health/supabase` (API only)
