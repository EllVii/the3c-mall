# Phase I Cloudflare Setup and Validation

## 1. Create resources

Create the production D1 database and receipt bucket from the Cloudflare dashboard or Wrangler.

```bash
npx wrangler@latest d1 create the3c-mall-production
npx wrangler@latest r2 bucket create the3c-mall-phase-i-receipts
```

Copy `wrangler.example.jsonc` to `wrangler.jsonc` and replace the D1 database ID. For an existing Pages project, the bindings may instead be configured under **Workers & Pages → the 3C Mall project → Settings → Bindings**.

Required binding names:

- D1: `DB`
- R2: `RECEIPTS`

## 2. Apply the migration

Test locally first:

```bash
npx wrangler@latest d1 migrations apply the3c-mall-production --local
```

Apply to production only after review:

```bash
npx wrangler@latest d1 migrations apply the3c-mall-production --remote
```

## 3. Configure variables and secrets

Variables:

- `APP_ORIGIN=https://the3cmall.app`
- `FROM_EMAIL=3C Mall <no-reply@the3cmall.app>`
- `PILOT_SHOW_AUTH_LINKS=false`

Secrets:

- `ADMIN_API_TOKEN`
- `RESEND_API_KEY` when Resend is the approved email provider
- authorized retailer or data-provider credentials as agreements are completed

Never commit secret values.

## 4. Email-domain requirements

Verify the sending domain with the selected email provider before participant onboarding. Test verification and password-reset links on the production domain. Keep `PILOT_SHOW_AUTH_LINKS=false` in production so authentication links are not returned in API responses.

## 5. Functional test matrix

| ID | Test | Expected result | Evidence |
|---|---|---|---|
| AUTH-01 | Create account with valid email/password | Generic success; verification generated | Screenshot and API log |
| AUTH-02 | Duplicate signup | No account enumeration | API response |
| AUTH-03 | Login before verification | Rejected | API response |
| AUTH-04 | Verify valid token | Email marked verified; redirect to login | D1 query and screenshot |
| AUTH-05 | Login after verification | Secure session cookie; app access | Browser storage/cookie screenshot with value redacted |
| AUTH-06 | Wrong password and rate limit | Generic error; threshold enforced | Test log |
| AUTH-07 | Logout | Session removed and cookie cleared | D1 query |
| AUTH-08 | Password reset | Generic response; one-time link; sessions revoked after reset | Test log |
| AUTH-09 | Cross-user profile request | User can access only own profile keys | Automated test |
| PILOT-01 | Consent acceptance | Version, timestamp, family code stored | D1 query |
| PILOT-02 | Event without consent | Rejected | API response |
| PILOT-03 | Weekly feedback with valid bounds | Stored and summarized | D1 query and admin summary |
| PILOT-04 | Invalid score outside 0–10 | Rejected | API response |
| RECEIPT-01 | Allowed image/PDF under 10 MB | Private R2 object and D1 metadata created | R2/D1 record |
| RECEIPT-02 | Disallowed type or oversize | Rejected before storage | API response |
| ADMIN-01 | Missing/incorrect admin token | Rejected | API response |
| ADMIN-02 | Valid admin token | Aggregate-only pilot summary returned | Redacted response |
| DATA-01 | Profile save and reload | D1 value restored | Browser and D1 evidence |
| DATA-02 | Delete/export procedure | Requested data identified and handled under policy | Procedure log |
| RECOVERY-01 | D1 backup/time-travel procedure reviewed | Recovery steps documented and tested where available | Recovery report |
| ACCESS-01 | Keyboard and screen-reader review | Critical paths usable | Accessibility checklist |
| MOBILE-01 | Android/mobile viewport | Core workflow and pilot forms usable | Device screenshots |

## 6. Security checks before pilot

- Confirm same-origin request enforcement.
- Confirm cookies are `Secure`, `HttpOnly`, and `SameSite=Lax`.
- Confirm session and recovery tokens are stored only as hashes.
- Confirm PBKDF2 work factor is operationally acceptable.
- Confirm all D1 statements use bound parameters.
- Confirm admin token is a strong random secret and not stored in localStorage.
- Confirm receipt objects are private and cannot be listed publicly.
- Confirm logs do not contain passwords, raw session tokens, reset tokens, EBT information, full payment data, or unredacted receipt content.
- Confirm production source maps, error details, and environment variables do not expose secrets.
- Confirm Cloudflare account protections, least-privilege access, and multifactor authentication.
- Confirm dependency, configuration, and header review.
- Conduct an independent security/privacy review before participant data collection.

## 7. Pilot data export

The protected endpoint below returns aggregate counts and weekly averages:

```text
GET /api/admin/pilot-summary
Authorization: Bearer <ADMIN_API_TOKEN>
```

Individual-level exports should be created only through an authenticated administrative procedure with documented purpose, access, storage location, and deletion schedule. Do not add a public individual-level export endpoint merely for convenience.

## 8. Rollback and incident response

Before deployment:

1. Record the current production commit.
2. Export or verify D1 recovery capability.
3. Apply migrations before routing participant traffic.
4. Run the health endpoint.
5. Run the authentication and consent smoke tests.
6. Keep a documented rollback commit and Cloudflare deployment rollback procedure.

If an incident may involve participant data:

1. contain access;
2. preserve relevant logs;
3. disable affected endpoints or credentials;
4. assess scope and sensitivity;
5. document decisions;
6. follow applicable notification duties and consent commitments;
7. correct and validate; and
8. include the incident and response in the Phase I technical report where required.

## 9. Phase I evidence folder

Retain:

- deployment IDs and commit hashes;
- redacted configuration screenshots;
- migration output;
- functional-test results;
- accessibility results;
- security-review findings and corrections;
- incident logs;
- D1/R2 recovery evidence;
- performance measurements;
- data dictionary and retention schedule; and
- final technical-validation matrix.
