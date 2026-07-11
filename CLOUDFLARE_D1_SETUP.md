# 3C Mall: Cloudflare D1 Setup

This repository now uses Cloudflare Pages Functions and a D1 binding named `DB` for authentication, sessions, reporting, and profile preference sync.

## 1. Create the database

In Cloudflare Dashboard:

1. Open **Workers & Pages**.
2. Open **D1 SQL Database**.
3. Create a database named **`3c-mall-db`**.

## 2. Bind D1 to the Pages project

Open the Cloudflare Pages project that deploys `EllVii/the3c-mall`.

1. Go to **Settings → Bindings**.
2. Add a **D1 database binding**.
3. Set the variable name to **`DB`**.
4. Select **`3c-mall-db`**.
5. Add the same binding to both **Production** and **Preview** environments.

The variable must be named `DB`; the Pages Functions read the database from `context.env.DB`.

## 3. Apply the migration

The initial schema is in:

```text
migrations/0001_initial.sql
```

Apply it through the D1 console in Cloudflare Dashboard, or from the repository root with Wrangler:

```bash
npx wrangler d1 migrations apply 3c-mall-db --remote
```

For a local D1 database:

```bash
npx wrangler d1 migrations apply 3c-mall-db --local
```

## 4. Add Pages environment variables

Add these under the Pages project's **Settings → Variables and Secrets**.

| Variable | Type | Recommended value |
|---|---|---|
| `PUBLIC_APP_URL` | Plain text | `https://the3cmall.app` |
| `RESEND_API_KEY` | Secret | Existing Resend API key |
| `AUTH_FROM_EMAIL` | Plain text | `3C Mall <support@the3cmall.com>` |
| `ADMIN_TOKEN` | Secret | A long random admin token |

`RESEND_API_KEY` is required for verification and password-reset emails. Authentication data and D1 credentials are never sent to the browser.

## 5. Deploy and verify

After Cloudflare builds the branch, open:

```text
https://the3cmall.app/health/d1
```

The API can also be checked directly:

```text
https://the3cmall.app/api/health/d1
```

A healthy response includes:

```json
{
  "status": "success",
  "d1": {
    "binding": "DB",
    "connected": true
  }
}
```

## Routes moved to Cloudflare Pages Functions

- `GET /api/auth/session`
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/signout`
- `GET /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/reset-password`
- `POST /api/auth/update-password`
- `POST /api/report/waitlist`
- `POST /api/report/beta-code`
- `GET /api/report/summary`
- `GET|PUT|DELETE /api/profile/preferences/:key`

Kroger product and store routes remain on the existing backend until their Worker migration is completed.

## Existing Supabase accounts

Do not attempt to copy plaintext passwords. The safest migration is to import user email addresses and profile metadata, then require each existing user to set a new password through the D1 password-reset flow.

## Rollback

The work is isolated on the branch:

```text
agent/migrate-supabase-to-d1
```

Do not merge the branch until the D1 binding, migration, and environment variables have been added to the Cloudflare Pages project.
