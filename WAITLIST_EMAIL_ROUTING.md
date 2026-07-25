# 3C Mall Waitlist Email Routing

The public waitlist form posts to `/api/report/waitlist`.

## Routing flow

1. The submitted email address is normalized and validated.
2. The signup is saved in the Cloudflare D1 `waitlist` table.
3. A notification is sent to the internal inbox or inboxes configured in `WAITLIST_NOTIFY_EMAILS`.
4. A confirmation is sent to the person who joined the waitlist unless `WAITLIST_CONFIRMATION_ENABLED` is set to `false`.
5. Internal notification replies are directed to the applicant. Applicant confirmation replies are directed to `WAITLIST_REPLY_TO`.
6. Duplicate waitlist entries update the source/referrer record but do not create repeated email notifications.

Email delivery failure does not remove a successfully saved D1 waitlist record. D1 remains the source of truth.

## Cloudflare Pages variables and secrets

Configure these under the 3C Mall Pages project settings for both Production and Preview where appropriate.

| Name | Type | Example | Purpose |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | Secret | `re_...` | Authorizes transactional email delivery through Resend. |
| `FROM_EMAIL` | Variable | `3C Mall <no-reply@the3cmall.app>` | Verified sender shown on outbound messages. |
| `WAITLIST_NOTIFY_EMAILS` | Variable | `beta@the3cmall.com,hello@ellviisautomations.com` | Comma-separated internal destinations for new-signup alerts. |
| `WAITLIST_REPLY_TO` | Variable | `beta@the3cmall.com` | Inbox that receives replies to applicant confirmation emails. |
| `WAITLIST_CONFIRMATION_ENABLED` | Variable | `true` | Set to `false` only when applicant confirmations should be disabled. |
| `APP_ORIGIN` | Variable | `https://the3cmall.com` | Restricts browser form submissions to the approved site origin. |

## Recommended production routing

- Primary waitlist inbox: `beta@the3cmall.com`
- Temporary operational copy: `hello@ellviisautomations.com`
- Outbound sender: `3C Mall <no-reply@the3cmall.app>`
- Applicant reply-to: `beta@the3cmall.com`

Only use an address after it has been created or configured as a Cloudflare Email Routing destination. The sender domain must also be verified in Resend.
