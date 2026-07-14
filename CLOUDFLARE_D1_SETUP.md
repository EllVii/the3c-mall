# 3C Mall: Cloudflare D1 and Email Sending Setup

This repository uses Cloudflare Pages Functions, a D1 binding named `DB`, and Cloudflare Email Sending for authentication, sessions, transactional email, reporting, and profile preference sync.

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

Apply it from the repository root with Wrangler so D1 records the migration history:

```bash
npx wrangler d1 migrations apply 3c-mall-db --remote
```

For a local D1 database:

```bash
npx wrangler d1 migrations apply 3c-mall-db --local
```

## 4. Configure Cloudflare Email Sending

In Cloudflare Dashboard:

1. Go to **Compute → Email Service → Email Sending**.
2. Onboard `the3cmall.com` for outbound email.
3. Create an API token with **Account → Email Sending → Edit** permission.
4. Copy the token when Cloudflare displays it; it is only shown once.

The sender domain in `AUTH_FROM_EMAIL` must be onboarded for Email Sending.

## 5. Add Pages environment variables

Add these under the Pages project's **Settings → Variables and Secrets** for both Preview and Production unless noted otherwise.

| Variable | Type | Recommended value |
|---|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Plain text | The Cloudflare account ID that owns `the3cmall.com` |
| `CLOUDFLARE_EMAIL_API_TOKEN` | Secret | Token with Email Sending: Edit permission |
| `AUTH_FROM_EMAIL` | Plain text | `3C Mall <support@the3cmall.com>` |
| `ADMIN_TOKEN` | Secret | A long random admin token |
| `PUBLIC_APP_URL` | Plain text | Production only: `https://the3cmall.app` |

Leave `PUBLIC_APP_URL` unset in Preview so verification and reset links use the active preview deployment URL.

`RESEND_API_KEY` may remain temporarily as a fallback while Cloudflare Email Sending is being tested. When both Cloudflare email variables are present, the app uses Cloudflare rather than Resend. Remove `RESEND_API_KEY` only after signup verification, resend verification, and password reset emails all work through Cloudflare.

Authentication data, Cloudflare API tokens, D1 credentials, and admin secrets are never sent to the browser.

## 6. Deploy and verify D1

After Cloudflare builds the branch, open the preview deployment and append:

```text
/health/d1
```

The API can also be checked directly at:

```text
/api/health/d1
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

## 7. Verify transactional email and authentication

Test the preview deployment in this order:

1. Create a new account with an email address you can access and a password of at least eight characters.
2. Confirm the response says the verification email was sent.
3. Confirm the email appears in Cloudflare Email Sending logs and in the recipient inbox.
4. Open the verification link.
5. Sign in and refresh the page to confirm the session persists.
6. Sign out.
7. Use resend verification with a different unverified test account.
8. Request a password reset, set a new password, and sign in with it.

Keep the pull request in draft until the full flow passes.

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

Do not attempt to copy plaintext passwords or incompatible password hashes. Import user email addresses and profile metadata, then require each existing user to set a new password through the D1 password-reset flow.

## Rollback

The work is isolated on the branch:

```text
agent/migrate-supabase-to-d1
```

Do not merge the branch until the D1 binding, migration, Cloudflare Email Sending variables, and complete preview authentication flow have been verified.
