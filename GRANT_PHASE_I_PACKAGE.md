# 3C Mall Phase I Grant Master Package

**Applicant:** Ell Vii’s Automations LLC  
**Project / Trade Name:** 3C Mall  
**Arizona trade-name filing:** Filing No. 9492047  
**Date first used:** November 25, 2025  
**Nature of business:** Software platform for grocery comparison and meal planning  
**Project Director / Principal Investigator:** Lawrence Velasquez  
**Project period:** 12 months  
**Working direct-cost request:** $222,200  

> This document is a grant-development master file. The final application must be conformed to the active Notice of Funding Opportunity (NOFO), its page limits, required forms, current award ceiling, and topic-area instructions.

---

## 1. Grant-Safe Project Definition

3C Mall is a household grocery-comparison, meal-planning, and food-budget decision-support software platform. It helps users organize grocery needs, compare estimated prices and unit costs, build practical meal plans, and review progress over time.

3C Mall is **not** presented as:

- a grocery retailer or seller of food;
- a delivery company;
- a payment processor or merchant of record;
- an official representative of any retailer unless a written agreement exists;
- a medical provider, dietitian replacement, or source of individualized medical advice;
- a financial advisor;
- a guaranteed-savings service; or
- a system that processes SNAP/EBT benefits.

Retailers remain responsible for final prices, product availability, eligibility labels, checkout, payment, pickup, delivery, refunds, substitutions, and fulfillment. All displayed prices and savings calculations are estimates that must be confirmed with the retailer.

---

## 2. Project Abstract

Households routinely make grocery and meal-planning decisions using fragmented information spread across retailer sites, recipes, handwritten lists, budgeting tools, and general wellness applications. This fragmentation increases planning time, makes unit-cost comparison difficult, and can create additional stress for families trying to balance food preferences, nutrition goals, household size, retailer availability, and a limited grocery budget.

Ell Vii’s Automations LLC proposes a 12-month Phase I research and development project to evaluate the technical and commercial feasibility of 3C Mall, a coordinated household decision-support platform for grocery comparison, meal planning, and food-budget organization. The project will improve the existing working prototype, establish secure Cloudflare-based data infrastructure, conduct structured stakeholder discovery, and complete a five-family pilot study.

The central research question is whether an integrated, user-guided workflow can reduce grocery-planning burden and improve household confidence in food-budget decisions while maintaining clear retailer boundaries, privacy protections, and transparent estimated-price disclosures.

Phase I work will measure usability, planning time, self-reported planning stress, decision confidence, meal-plan completion, estimated basket-cost differences, price-data accuracy, retention, and system reliability. Five participating families may receive up to $500 each in receipt-based reimbursement, for a maximum participant reimbursement pool of $2,500. Preliminary customer discovery will also seek separate input from households, food-science and nutrition professionals, cybersecurity and cloud professionals, data scientists and artificial-intelligence specialists, software and systems engineers, and grocery or food-industry professionals.

Expected Phase I outputs include a pilot-ready prototype, a secure research-data workflow, documented technical performance, stakeholder-validation evidence, a final feasibility report, a commercialization roadmap, and a clearly defined Phase II research plan.

---

## 3. Importance of the Problem

### 3.1 Household problem

Families often need to answer several questions at once:

- What meals fit the household’s preferences and schedule?
- What ingredients are already available?
- Which retailer or retailer combination appears to offer a practical total basket?
- Are package sizes and unit costs being compared fairly?
- How can the household stay within a weekly or monthly food budget?
- How can a plan be adjusted when prices, availability, or schedules change?

Existing tools commonly solve only one part of this process. The proposed research tests whether coordinating these decisions in one guided workflow produces measurable value.

### 3.2 Public benefit

The project is designed to support:

- more informed household food purchasing;
- clearer grocery-cost and unit-cost comparisons;
- reduced planning burden;
- practical meal planning across varied eating patterns;
- improved access to understandable food-budget information;
- optional grocery-only decision support for SNAP-participating households without processing benefits or claiming program approval; and
- a scalable platform that could later be sponsored through employers, community organizations, public programs, or other institutional partners.

---

## 4. Innovation and Knowledge Gap

3C Mall’s proposed innovation is not a single price list or recipe generator. It is the coordinated decision workflow connecting:

1. household preferences and constraints;
2. meal-plan generation and modification;
3. ingredient and grocery-list organization;
4. retailer and unit-cost comparison;
5. estimated basket allocation;
6. user confirmation and retailer routing;
7. receipt-supported outcome review; and
8. longitudinal progress and confidence tracking.

The Phase I knowledge gap is whether this integrated workflow can be implemented securely and accurately enough to generate measurable household value, and which parts of the workflow drive that value.

---

## 5. Research Question and Hypotheses

### Primary research question

Can 3C Mall’s integrated grocery-comparison and meal-planning workflow reduce household planning burden and improve confidence in food-budget decisions during a structured 12-month Phase I project?

### Technical hypothesis

A Cloudflare-based architecture using Pages/Workers Functions, D1, and optional R2 receipt storage can reliably support authenticated household profiles, meal-planning data, research events, feedback, and de-identified receipt metadata while maintaining appropriate access controls and auditability.

### User-value hypothesis

Participating households will report lower planning stress, shorter planning time, and greater confidence after using the coordinated 3C Mall workflow than at baseline.

### Commercial hypothesis

Households and relevant professional stakeholders will identify a credible need for a coordinated grocery, meal-planning, and food-budget decision-support product, and at least one viable paid or sponsored-access pathway will be supported by preliminary evidence.

---

## 6. Phase I Objectives

### Objective 1 — Establish pilot-ready technical infrastructure

- Replace the planned Supabase dependency with Cloudflare D1 as the primary relational database.
- Use Cloudflare Pages/Workers Functions for backend APIs.
- Use R2 only for receipt or image storage when needed.
- Implement secure authentication, session management, email-verification support, profile persistence, pilot consent, event logging, feedback collection, and administrator reporting.
- Document database migrations, deployment bindings, recovery steps, and security controls.

**Success criteria:** core API endpoints pass functional testing; authenticated data remains isolated by user; pilot events and feedback can be exported or summarized; no high-severity unresolved issue remains before participant onboarding.

### Objective 2 — Improve and validate the core 3C Mall workflow

- Confirm the working flow from household preferences to meal planning, grocery organization, retailer comparison, and progress review.
- Replace misleading demo assumptions with clearly marked estimates and live integrations where authorized.
- Document retailer-source limitations, update timing, product matching, unit normalization, missing-item handling, and user confirmation points.
- Add an optional SNAP Budget Planning presentation inside Grocery & Cost that separates eligible and non-eligible estimates only when retailer-confirmed product data supports the distinction. The system will not collect an EBT card number or PIN, determine benefit eligibility, or process benefits.

**Success criteria:** pilot users can complete the core workflow; critical errors are logged and corrected; displayed estimates include appropriate disclosures; grocery and meal-planning outputs can be compared with participant receipts.

### Objective 3 — Conduct stakeholder and market validation

- Conduct a preliminary LinkedIn-based customer-discovery campaign.
- Keep household, scientific, technical, and commercial respondent groups separate.
- Preserve exact questions, answer options, dates, response counts, percentages, screenshots, and relevant comments.
- Seek letters of support or participation from actual end users, subject-matter experts, community organizations, and potential partners.

**Success criteria:** documented response evidence is available; stakeholder themes are coded; letters accurately distinguish support from a formal consulting or subcontracting commitment.

### Objective 4 — Complete a five-family pilot

- Recruit five families using documented eligibility and consent procedures.
- Collect baseline, weekly or task-level, and end-of-pilot measures.
- Reimburse eligible grocery-receipt costs up to $500 per family, only after receipt review, with a total project cap of $2,500.
- Collect only data necessary to evaluate feasibility and user value.

**Success criteria:** at least four of five families complete the minimum pilot protocol; sufficient data exist to evaluate primary measures; reimbursement records reconcile to receipts and policy.

### Objective 5 — Analyze feasibility and prepare Phase II

- Analyze technical performance, user outcomes, market evidence, risks, and cost drivers.
- Identify which features should advance, change, or be removed.
- Produce a final Phase I feasibility report and Phase II technical plan.

**Success criteria:** final report contains measurable results, limitations, commercialization implications, and a justified Phase II scope.

---

## 7. Research Design and Methods

### 7.1 Study design

The project uses a mixed-method feasibility design:

- technical validation of the software and data architecture;
- structured usability testing;
- repeated household self-report measures;
- receipt-supported comparison of estimated and observed grocery outcomes;
- stakeholder discovery; and
- qualitative interviews or open-text feedback.

This Phase I pilot is not designed to establish clinical efficacy, provide medical treatment, or produce population-level causal claims.

### 7.2 Pilot sample

- Five household units.
- Recruitment should seek variation in household size, shopping patterns, food preferences, planning burden, and retailer use.
- Participation is voluntary.
- Participants may withdraw without penalty.
- Minors’ information should not be directly collected unless separately reviewed and properly consented; the default pilot should collect household-level data from an adult participant.

### 7.3 Pilot workflow

1. Eligibility screening and informed consent.
2. Baseline survey.
3. Household-profile and preference setup.
4. Guided use of meal planning and grocery-cost tools.
5. Weekly or task-level check-ins.
6. Optional receipt submission for authorized research comparison and reimbursement.
7. Midpoint interview.
8. End-of-pilot survey and interview.
9. Data reconciliation, analysis, and de-identification.

### 7.4 Reimbursement controls

- Maximum reimbursement: $500 per family.
- Maximum total: $2,500.
- A receipt is required before reimbursement.
- Reimbursement is for approved pilot research participation costs and is not a promise to pay all grocery expenses.
- Duplicate, illegible, altered, unrelated, or previously reimbursed receipts are not eligible.
- Reimbursement decisions and payment records must be documented.
- Participant reimbursement does not make 3C Mall the retailer, purchaser, delivery provider, or merchant of record.

### 7.5 Measures

#### Primary feasibility measures

- successful account setup rate;
- successful completion of the core planning workflow;
- critical and noncritical error rate;
- API and database reliability;
- data-isolation test results;
- pilot retention and protocol completion;
- time required to resolve pilot defects.

#### Primary user-value measures

- grocery-planning time in minutes;
- self-reported planning stress on a defined scale;
- decision confidence on a defined scale;
- percentage of planned meals completed;
- user-reported usefulness;
- continued-use intent;
- estimated time saved;
- estimated basket difference where a valid comparison exists.

#### Data-quality measures

- product-match rate;
- unit-normalization success rate;
- price freshness or source timestamp coverage;
- discrepancy between displayed estimate and receipt price;
- missing or substituted item rate;
- percentage of comparisons containing complete disclosure text.

#### Commercial measures

- stakeholder problem-validation rate;
- willingness to test or support;
- willingness-to-pay range or sponsored-access interest;
- potential partner interest;
- acquisition assumptions and expected service costs;
- feature-priority ranking.

### 7.6 Analysis plan

Because the family pilot is small, analysis will emphasize feasibility, direction, effect size, distribution, and individual household patterns rather than broad statistical generalization.

The final report should include:

- counts and completion rates;
- median and range for time and rating measures;
- baseline-to-endpoint change by family;
- receipt discrepancy summaries;
- categorized technical incidents;
- coded qualitative themes;
- stakeholder-group comparisons; and
- transparent limitations.

No outcome should be described as statistically representative of the public based solely on the five-family pilot or a LinkedIn poll.

---

## 8. Twelve-Month Work Plan

| Period | Major activities | Deliverables |
|---|---|---|
| Months 1–2 | Finalize protocol; configure D1/Workers/R2; implement authentication, consent, profile sync, event logging, and admin reporting; create data dictionary | Technical baseline; migration scripts; test plan; privacy and security checklist |
| Months 3–4 | Core workflow refinement; expert review; stakeholder campaign; recruit pilot families; execute letters/consulting agreements | Stakeholder evidence file; signed commitments; pilot roster; corrected prototype |
| Months 5–6 | Baseline data collection; pilot onboarding; first workflow cycles; defect correction | Baseline dataset; onboarding report; early technical findings |
| Months 7–9 | Continued household use; weekly check-ins; receipt review; midpoint interviews; iterative improvements | Interim pilot report; reimbursement ledger; issue-resolution log |
| Month 10 | End-of-pilot surveys and interviews; data cleaning; technical performance summary | Locked analysis dataset; pilot completion report |
| Month 11 | Quantitative and qualitative analysis; commercialization review; Phase II gap analysis | Draft feasibility report; commercialization findings |
| Month 12 | Final report; demonstration package; Phase II research plan; closeout reconciliation | Final Phase I report; evidence index; Phase II roadmap; final budget reconciliation |

---

## 9. Technical Architecture

### Frontend

- React and Vite.
- Hosted through Cloudflare Pages.
- Clear separation between public marketing pages and authenticated app routes.

### Backend

- Cloudflare Pages/Workers Functions for same-origin APIs.
- Cloudflare D1 as the primary relational database.
- Cloudflare R2 for approved receipt or image objects when required.
- Durable Objects or WebSockets only if a later requirement demonstrates a real-time coordination need.

### Core Phase I data domains

- users and sessions;
- email-verification and password-reset tokens;
- household profile data;
- pilot consent;
- de-identified pilot events;
- weekly feedback and outcome measures;
- receipt metadata and reimbursement status;
- waitlist or stakeholder interest;
- audit logs and rate-limit records.

### Technical validation

The project will test:

- authentication and session security;
- user-level authorization;
- prepared queries and input validation;
- same-origin and CSRF protections;
- rate limiting;
- data retention and deletion;
- backup and restore procedures;
- incident logging;
- accessibility and responsive behavior;
- performance under anticipated pilot load; and
- failure behavior when retailer data or external services are unavailable.

---

## 10. Privacy, Security, and Compliance Plan

### Data minimization

Only information needed for authentication, household planning, pilot measurement, reimbursement review, and required reporting will be collected.

### Sensitive data boundaries

The Phase I pilot will not request:

- EBT card numbers or PINs;
- full payment-card data;
- bank credentials;
- unnecessary medical diagnoses;
- unnecessary information directly identifying minors; or
- retailer login credentials unless an authorized integration and separate security review exists.

### Security controls

- password hashing using a modern salted key-derivation function;
- secure, HttpOnly session cookies;
- token hashing for stored sessions and recovery links;
- prepared D1 statements;
- per-user authorization checks;
- rate limiting on sensitive endpoints;
- administrator-secret protection for reporting endpoints;
- encrypted transport;
- restricted R2 receipt access;
- audit logging;
- documented secrets management;
- data export and deletion procedures; and
- periodic dependency and configuration review.

### Consent and withdrawal

Participants receive a plain-language consent notice explaining what data are collected, why they are collected, how they will be used, reimbursement rules, foreseeable risks, voluntary participation, withdrawal, and contact information. Withdrawal stops future research collection; retention or deletion of previously collected data will follow the consent language, applicable law, grant requirements, and documented data-management policy.

### Legal positioning

All grant, product, README, and participant materials must preserve the decision-support role described in Section 1. Public-facing materials should not claim guaranteed savings, official retailer affiliation, medical treatment, nutritional diagnosis, benefit eligibility, or breach-proof security.

---

## 11. Market and Stakeholder Validation Plan

### Separate respondent categories

1. Families and prospective users.
2. Food scientists, nutrition professionals, and dietitians providing general professional feedback.
3. Cybersecurity, privacy, and cloud engineers.
4. Data scientists and artificial-intelligence specialists.
5. Software, systems, and quality engineers.
6. Grocery, retail, food-access, and community-program professionals.

### Evidence standard

LinkedIn responses are preliminary customer-discovery evidence, not formal population research. Grant language should state:

> Respondents to our preliminary LinkedIn customer-discovery campaign reported…

It should not state:

> The public believes…

The evidence file must preserve the exact post, question, options, audience, date range, response count, percentages, screenshots, and relevant comments.

### Letters

Letters of support should address the writer’s actual relationship to the problem, perceived value, willingness to test or collaborate, and any resources they may provide. A questionnaire response does not make a person a consultant or project-team member.

Any consultant or subcontractor included in the project must provide a separate letter or agreement confirming willingness to participate, role, responsibilities, qualifications, anticipated hours, rate, and deliverables.

---

## 12. Commercialization and Sustainability

Potential post-pilot pathways include:

- household subscription plans;
- family plans;
- employer or corporate wellness access;
- community-organization sponsorship;
- public-program or grant-sponsored access;
- personal-trainer or professional-support tools where legally appropriate;
- retailer or data-provider integrations under written agreement; and
- affiliate revenue where permitted and transparently disclosed.

SNAP benefits will not be used to pay a 3C Mall subscription, service charge, or delivery fee. A government, nonprofit, healthcare, employer, or community contract could separately sponsor platform access for eligible households.

Phase I commercialization work will test customer need, feature priorities, service costs, data-provider constraints, pricing assumptions, sponsored-access interest, and the practical path to authorized retailer integrations.

---

## 13. Project Team and Resource Plan

### Lawrence Velasquez — Project Director, Lead Developer, and Product Architect

Primary responsibilities:

- overall project leadership;
- technical architecture and implementation;
- prototype refinement;
- data and API design;
- pilot operations;
- issue resolution;
- stakeholder coordination;
- analysis oversight;
- commercialization planning; and
- final reporting.

Working rate: **$70 per hour**, 40 hours per week for 52 weeks, totaling **$145,600**.

### Food Science / Nutrition Research Assistant — To be hired after award

Primary responsibilities:

- grocery-category and food-data research;
- review of general meal-planning logic;
- receipt and data-quality review;
- pilot documentation;
- participant-support materials;
- literature and state-of-the-art support; and
- organization of research data.

Working allocation: **600 hours at $32 per hour = $19,200**.

### Payroll / Grant Administration Coordinator — Part time, temporary

Primary responsibilities:

- timekeeping and payroll support;
- reimbursement documentation;
- invoice and receipt reconciliation;
- budget tracking;
- grant-file organization;
- consultant documentation; and
- closeout support.

Working allocation: **400 hours at $38 per hour = $15,200**.

### Consultants and reviewers

Planned limited-scope support includes cybersecurity/privacy review, independent food-science or nutrition review, accessibility review, and legal/compliance review. Named individuals will not be represented as committed until written confirmation is obtained.

---

## 14. Working Budget V2 — $222,200

### Personnel — $180,000

| Role | Calculation | Amount |
|---|---:|---:|
| Project Director / Lead Developer / Product Architect | 2,080 hours × $70 | $145,600 |
| Food Science / Nutrition Research Assistant | 600 hours × $32 | $19,200 |
| Payroll / Grant Administration Coordinator | 400 hours × $38 | $15,200 |
| **Personnel total** |  | **$180,000** |

### Operations and contractual support — $22,200

| Item | Basis | Amount |
|---|---|---:|
| Five-family receipt reimbursement pool | Up to $500 × 5 families | $2,500 |
| Cybersecurity and privacy review | Limited-scope independent review | $6,000 |
| Independent food-science / nutrition review | Limited-scope technical review | $3,600 |
| Cloud, authorized APIs, software, and testing services | Project-period direct services | $4,500 |
| Participant recruitment, communications, and supplies | Direct pilot costs | $1,500 |
| Payroll, bookkeeping, insurance, and financial administration | Direct project support | $2,400 |
| Accessibility and legal/compliance review | Limited-scope review | $1,700 |
| **Operations total** |  | **$22,200** |

### Technology equipment and data infrastructure — $20,000

| Item | Working allocation | Amount |
|---|---|---:|
| Secure Samsung Galaxy development workstation | Development, testing, secure administration | $4,500 |
| Secure local server/NAS, scalable toward 100 TB | Controlled research storage, backup, and development data | $11,000 |
| UPS and encrypted backup media | Continuity and backup | $2,500 |
| Network and security peripherals | Secure project operations | $2,000 |
| **Technology total** |  | **$20,000** |

### Budget caution

The active NOFO controls the maximum request and allowable treatment of equipment, participant support, consultants, indirect costs, and owner compensation. A 100 TB local server is likely to receive close reviewer scrutiny in a five-family Phase I pilot. The final budget must either document a defensible research need for that capacity or right-size the equipment before submission.

The currently posted NIFA Phase I opportunity page describes an older FY 2025 opportunity with an award range up to $181,500. The next active NOFO may differ. The $222,200 working budget must therefore be adjusted if the target NOFO has a lower ceiling.

---

## 15. Phase I Deliverables

1. Clean, grant-safe project README.
2. Cloudflare D1 schema and migration package.
3. Pages/Workers Functions API for authentication, profile persistence, consent, telemetry, feedback, receipts, waitlist, health, and protected summary reporting.
4. Deployment and security configuration guide.
5. Research protocol and measurement plan.
6. Participant consent and reimbursement materials.
7. Five-family pilot dataset and reimbursement ledger.
8. Stakeholder questionnaire evidence file.
9. Letters of support and actual participation commitments.
10. Literature and state-of-the-art review.
11. Technical test report.
12. Market-validation summary.
13. Commercialization analysis.
14. Final Phase I feasibility report.
15. Phase II research and product roadmap.

---

## 16. Evaluation-Criteria Crosswalk

| Review area | Phase I response |
|---|---|
| Scientific and technical feasibility | Objectives, hypotheses, architecture, methods, measurable outcomes, pilot workflow, and test criteria are defined in Sections 4–10. |
| Market potential | Stakeholder categories, evidence rules, letters, business pathways, and commercialization tests are defined in Sections 11–12. |
| Importance of the problem | Household burden and public benefit are defined in Section 3. |
| Investigator and resource qualifications | Roles, allocations, consultant requirements, and management responsibilities are defined in Section 13. |
| Budget | Detailed working budget and risk notes are in Section 14. |
| Duplication and differentiation | The innovation is the coordinated decision workflow described in Section 4; the literature and competitive review must document how it differs from separate price, recipe, budgeting, and wellness tools. |

---

## 17. Completion Status

### Completed in this package

- grant-safe project definition;
- project abstract;
- research question and hypotheses;
- five Phase I objectives;
- 12-month work plan;
- five-family pilot design;
- measurement and analysis plan;
- reimbursement controls;
- stakeholder-validation method;
- commercialization framework;
- personnel plan;
- $222,200 working budget;
- technical architecture and security plan;
- reviewer-criteria crosswalk; and
- required deliverables list.

### Requires external completion

- active SAM.gov registration and UEI validation;
- Grants.gov organization profile and authorized representative;
- selection of the active NOFO and topic area;
- final page-limit conversion and forms;
- actual LinkedIn responses and screenshots;
- signed family letters of support;
- signed consultant or subcontractor commitments;
- named food-science/nutrition, cybersecurity, data, and engineering reviewers;
- actual pilot recruitment and consent;
- receipts and reimbursement records;
- literature citations and competitive evidence;
- retailer or data-provider authorization where required;
- creation and binding of the production D1 database and R2 bucket;
- secret configuration for email and administrator access;
- live endpoint, security, accessibility, and recovery testing; and
- final pilot results.

These external items must not be represented as completed until the supporting evidence exists.

---

## 18. Reference Sources for Final Application Development

- USDA NIFA SBIR/STTR program: https://www.nifa.usda.gov/grants/programs/sbir-sttr
- USDA NIFA Phase I funding-opportunity page: https://www.nifa.usda.gov/grants/funding-opportunities/small-business-innovation-research-small-business-technology-transfer
- USDA Phase I evaluation criteria: https://www.nifa.usda.gov/sites/default/files/2024-10/SBIR-STTR%20Phase%20I%20Application%20%20Evaluation%20Criteria.pdf
- Cloudflare D1 documentation: https://developers.cloudflare.com/d1/
- Cloudflare Pages Functions bindings: https://developers.cloudflare.com/pages/functions/bindings/
- Cloudflare D1 migrations: https://developers.cloudflare.com/d1/reference/migrations/
