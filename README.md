# 3C Mall

3C Mall is a household grocery-comparison, meal-planning, and food-budget decision-support software platform developed by Ell Vii’s Automations LLC.

The platform helps households organize meal ideas, build grocery lists, compare estimated retailer and unit-cost information, and review planning progress. It is designed to reduce fragmentation across grocery planning tasks while keeping the user in control of final decisions.

## Product boundaries

3C Mall is not a grocery retailer, delivery company, payment processor, medical provider, dietitian replacement, financial advisor, official retailer representative, or guaranteed-savings service. Retailers control final price, availability, eligibility labels, checkout, payment, substitutions, pickup, delivery, refunds, and fulfillment.

Displayed prices, availability, savings, and benefit-related subtotals are estimates unless expressly confirmed by the retailer. The platform does not collect an EBT card number or PIN, determine SNAP eligibility, or process SNAP benefits.

## Current Phase I focus

The grant-focused Phase I work is organized around four measurable areas:

1. **Grocery & Cost** — estimated price, package-size, unit-cost, and basket comparisons.
2. **Meal Planning & Nutrition Support** — general household meal-planning organization across varied preferences.
3. **My Progress & Outcomes** — planning time, confidence, stress, completion, and receipt-supported comparison measures.
4. **Community Support — Beta** — quiet, moderated, opt-in support where included in the approved pilot.

The 3C Concierge routes users among these areas and helps explain choices without replacing professional judgment.

## Technology

- React + Vite frontend
- Cloudflare Pages hosting
- Cloudflare Pages/Workers Functions for APIs
- Cloudflare D1 as the primary relational database
- Cloudflare R2 for approved receipt or image objects when needed
- Durable Objects or WebSockets only where a future real-time requirement is demonstrated

## Phase I grant package

The working grant package is in [`GRANT_PHASE_I_PACKAGE.md`](./GRANT_PHASE_I_PACKAGE.md).

Participant and stakeholder materials are in:

- [`grant/phase-i/STAKEHOLDER_TOOLKIT.md`](./grant/phase-i/STAKEHOLDER_TOOLKIT.md)
- [`grant/phase-i/PILOT_FORMS.md`](./grant/phase-i/PILOT_FORMS.md)

The working project period is 12 months and includes a five-family pilot. Eligible participant reimbursement is capped at $500 per family and $2,500 total, subject to receipt review and the approved grant budget.

## Local development

```bash
npm install
npm run dev
```

Create a production D1 database and R2 bucket in Cloudflare, apply the SQL migration in `migrations/`, configure the bindings described in `wrangler.example.jsonc`, and set the required secrets before pilot use.

## Required production secrets

- `ADMIN_API_TOKEN`
- `RESEND_API_KEY` or another approved email-delivery integration
- any authorized retailer or data-provider credentials

Secrets must be stored in Cloudflare configuration, not committed to the repository.

## Status

The existing application is a working prototype. Phase I is intended to validate technical feasibility, household value, data quality, security controls, and market potential. Prepared documents and code do not substitute for actual pilot evidence, signed letters, external review, or an active grant award.
