# 3C Mall: Cloudflare D1 and authentication email setup

This repository uses Cloudflare Pages Functions, a D1 binding named `DB`, and a dedicated Cloudflare Worker with a native Email Service binding for authentication, sessions, transactional email, reporting, and profile preference sync.

The authentication-email architecture is:

```text
3C Mall Pages Function
        |
        | AUTH_EMAIL service binding
        v
3c-mall-auth-email Worker
        |
        | EMAIL send binding
        v
Cloudflare Email Service
```

The Pages application does not need to expose an email API token to send verification and password-reset messages.

## 1. Create the database

In Cloudflare Dashboard:

1. Open **Workers & Pages**.
2. Open **D1 SQL Database**.
3. Create a database named **`3c-mall-db`**.

## 2. Bind D1 to the Pages project

Open the Cloudflare Pages project that deploys `EllVii/the3c-mall`.

1. Go to **Settings -> Bindings**.
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
npx wrangler d1 migrations apply 3c-mall-db --remote --config ./wrangler.migrations.jsonc
```

For a local D1 database, use `--local` instead of `--remote`.

## 4. Onboard the sender address

In Cloudflare Dashboard:

1. Go to **Compute -> Email Service -> Email Sending**.
2. Onboard `the3cmall.com` for outbound email.
3. Confirm that `support@the3cmall.com` is available as an approved sender.

The authentication-email Worker permits only:

```text
support@the3cmall.com
```

## 5. Deploy the authentication-email Worker

The Worker source and configuration are located at:

```text
workers/auth-email/src/index.js
workers/auth-email/wrangler.toml
```

Deploy it from the repository root:

```bash
npx wrangler@latest deploy --config workers/auth-email/wrangler.toml
```

The deployed Worker name is:

```text
3c-mall-auth-email
```

Its Wrangler configuration includes:

```toml
workers_dev = false

[[send_email]]
name = "EMAIL"
allowed_sender_addresses = [ "support@the3cmall.com" ]
```

`workers_dev = false` keeps the email Worker off a public `workers.dev` route. Pages reaches it through a private service binding.

## 6. Add the Pages service binding

Open:

**Workers & Pages -> the3c-mall -> Settings -> Bindings**

For both **Preview** and **Production**:

1. Add a **Service binding**.
2. Set the variable name to **`AUTH_EMAIL`**.
3. Select the service **`3c-mall-auth-email`**.
4. Save the binding.
5. Create a new Pages deployment so the deployment receives the binding.

The Pages Functions use `env.AUTH_EMAIL.fetch(...)` to call the private Worker.

## 7. Add Pages environment variables

Add these under the Pages project's **Settings -> Variables and Secrets**.

| Variable | Type | Recommended value |
|---|---|---|
| `AUTH_FROM_EMAIL` | Plain text | `3C Mall <support@the3cmall.com>` |
| `ADMIN_TOKEN` | Secret | A long random admin token |
| `PUBLIC_APP_URL` | Plain text | Production only: `https://the3cmall.app` |

Leave `PUBLIC_APP_URL` unset in Preview so verification and reset links use the active preview deployment URL.

### Temporary REST fallback

The existing REST variables may remain temporarily during cutover:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_EMAIL_API_TOKEN
```

The provider order is:

1. `AUTH_EMAIL` native service binding
2. Cloudflare Email Sending REST API
3. Resend, when `RESEND_API_KEY` remains configured

Once the native service-binding path passes signup verification, resend verification, and password-reset testing, remove the REST and Resend credentials.

## 8. Verify D1 and email health

After Cloudflare builds the branch, open the preview deployment and test:

```text
/api/health/d1
/api/health/email
```

A healthy D1 response includes:

```json
{
  "status": "success",
  "d1": {
    "connected": true,
    "schemaReady": true,
    "missingTables": []
  }
}
```

A healthy email response includes:

```json
{
  "status": "success",
  "email": {
    "configured": true,
    "provider": "cloudflare_email_binding",
    "serviceBinding": true
  }
}
```

When `/api/health/email` reports `serviceBinding: false`, the Pages deployment does not yet have the `AUTH_EMAIL` binding and is using a fallback provider or no provider.

## 9. Verify transactional email and authentication

Test the preview deployment in this order:

1. Open `/api/health/d1` and confirm `schemaReady: true`.
2. Open `/api/health/email` and confirm `provider: cloudflare_email_binding`.
3. Create a new account with an email address you can access and a password of at least eight characters.
4. Confirm the response says the verification email was sent.
5. Confirm the message appears in Cloudflare Email Sending logs and in the recipient inbox.
6. Open the verification link.
7. Sign in and refresh the page to confirm the session persists.
8. Sign out.
9. Use resend verification with a different unverified test account.
10. Request a password reset, set a new password, and sign in with it.

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
- `GET /api/health/d1`
- `GET /api/health/email`

Kroger product and store routes remain on the existing backend until their Worker migration is completed.

## Existing Supabase accounts

Do not attempt to copy plaintext passwords or incompatible password hashes. Import user email addresses and profile metadata, then require each existing user to set a new password through the D1 password-reset flow.

## Rollback

The work is isolated on the branch:

```text
agent/migrate-supabase-to-d1
```

Do not merge the branch until the D1 binding, migration, native email Worker, Pages service binding, and complete preview authentication flow have been verified.
