# 🔧 Error Fix Guide

## Error 1: Manifest Syntax Error (Line 1, Column 1)

### What's Happening
```
Manifest: Line: 1, column: 1, Syntax error
```

### Root Cause
❌ **The manifest.json file IS syntactically valid** (verified with Python JSON parser)

This error appears when:
- The manifest file is served with wrong MIME type
- Browser extension or PWA tooling misconfigures the reference
- Build tool (Vite) isn't properly linking the manifest

### Solution
1. **Verify the manifest link in [index.html](index.html)**:
   ```html
   <link rel="manifest" href="/manifest.json">
   ```
   Should be in the `<head>` tag

2. **Verify [public/manifest.json](public/manifest.json) has valid JSON**:
   ```bash
   cat public/manifest.json | python3 -m json.tool
   ```

3. **If using Vite, ensure manifest is in public/**:
   - ✅ File location: `public/manifest.json`
   - ✅ Referenced as: `/manifest.json` (not `./public/manifest.json`)

4. **Clear browser cache and rebuild**:
   ```bash
   npm run build
   ```

---

## Error 2: 500 Internal Server Error on POST /api/report/beta-code

### What's Happening
```
POST https://threecmall-backend.onrender.com/api/report/beta-code 500 (Internal Server Error)
```

### Root Cause ✅ FOUND
**Missing Supabase tables** - The backend tries to insert into `beta_attempts` table in Supabase, but this table doesn't exist.

The [SUPABASE_SETUP.sql](SUPABASE_SETUP.sql) file was missing these tables:
- `waitlist` - Email signup tracking
- `beta_attempts` - Beta code usage attempts

### How It Fails
1. Frontend calls: `POST /api/report/beta-code` with code data
2. Backend receives request ✓
3. Backend code tries: `supabase.from("beta_attempts").insert([...])`
4. Supabase returns error: Table doesn't exist
5. Express catch block returns: 500 error ✗

### Solution

#### Step 1: Update Supabase Schema
The [SUPABASE_SETUP.sql](SUPABASE_SETUP.sql) file has been updated with:
```sql
-- Waitlist & Beta Code Tracking (Reporting)
CREATE TABLE IF NOT EXISTS waitlist (...)
CREATE TABLE IF NOT EXISTS beta_attempts (...)
```

#### Step 2: Run the SQL in Supabase
1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Copy entire contents of [SUPABASE_SETUP.sql](SUPABASE_SETUP.sql)
5. Paste into the SQL editor
6. Click **Run**

#### Step 3: Verify Tables Created
```sql
-- Run this in Supabase SQL Editor to verify
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should see:
- ✅ `waitlist`
- ✅ `beta_attempts`
- ✅ `email_consents` (and others)

#### Step 4: Verify Environment Variables
Your `.env` file must have:
```env
# Required for Supabase connection
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note**: This should be in `/server/.env` for local dev. In production, set these in Render → Service → Environment (Render injects them at runtime; do not commit them to the repo).

#### Step 5: Restart Backend
```bash
cd server
npm run dev
```

Test the endpoint:
```bash
curl -X POST http://localhost:3001/api/report/beta-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BETA2026",
    "success": true,
    "userAgent": "test"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Beta code attempt logged",
  "id": "123abc..."
}
```

---

## Backend Error Logs

When debugging, check server logs for detailed error:
```
Supabase beta insert error: { code: '42P01', message: 'relation "beta_attempts" does not exist' }
```

This confirms the table is missing.

---

## Summary of Changes Made

| File | Change | Status |
|------|--------|--------|
| [SUPABASE_SETUP.sql](SUPABASE_SETUP.sql) | Added `waitlist` & `beta_attempts` tables | ✅ Done |
| Your Supabase Database | Need to run SQL script | ⏳ Your action |
| [index.html](index.html) | Verify manifest link | ✅ Should be fine |

---

## Objections (and Responses)

1. **"But the manifest.json validates, so why the syntax error?"**  
   This error usually means the browser received HTML (like a 404 page) or the wrong MIME type, not invalid JSON. Verify the manifest is served at `/manifest.json` with `application/manifest+json` or `application/json`.

2. **"We already updated SUPABASE_SETUP.sql — why is the API still 500?"**  
   Updating the file isn't enough; the SQL must be run in Supabase to create the tables. Until that happens, inserts to `beta_attempts` will still fail.

3. **"Isn't the table created by migrations or code?"**  
   Not in this setup. The backend expects the tables to exist; there’s no migration running at startup to create them.

4. **"Do we really need the service role key?"**  
   Yes for server-side inserts without RLS issues. The server should use the service role key (never expose it to the client).

5. **"Why does the error happen only in production?"**  
   Production uses the hosted Supabase project where the missing tables live. Local dev might point to a different database or skip the failing endpoint.

6. **"Can we ignore the manifest error?"**  
   You can ignore it if you don’t use PWA features, but it’s usually a simple fix and prevents noisy console errors.

---

## Testing Checklist

- [ ] Supabase tables created (run SQL in Supabase editor)
- [ ] `.env` has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Backend restarted after env changes
- [ ] Can POST to `/api/report/beta-code` and get 200 response
- [ ] Can see new rows in `beta_attempts` table in Supabase
- [ ] Manifest error gone or ignored by browser

---

## Local Diagnostics (One Command)

Run the local checker to validate manifest wiring and Supabase env setup:

```bash
bash scripts/diagnose.sh
```

---

## Need More Help?

Run these diagnostics:

```bash
# Check environment variables are set
grep SUPABASE /server/.env

# Verify Supabase connection
curl -H "Authorization: Bearer your-token" \
  https://your-project.supabase.co/rest/v1/beta_attempts?limit=1

# Check backend logs
npm run dev --prefix server
```
