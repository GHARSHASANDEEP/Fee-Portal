# Technical Design Document: Fee Tracking System & Parent Portal
**Client:** Company A, Jaipur coaching institute (Problem 3)
**GitHub:** `<ADD YOUR REPO URL HERE>`  **Live app:** `<ADD LIVE URL HERE>`

## 1. What was built (core slice)
Fee ledger, parent portal (OTP login, dues, pay link, receipts, attendance and scores), reminders that stop on payment, pro-rata refund calculator, accounts dues dashboard (by centre and batch, with ageing and a Tally CSV export), a dropout-risk flag that only creates counsellor tasks, and an unmatched-payments queue. Hindi and English throughout. Roles: **parent** and **accounts executive**.

## 2. Architecture and why
| Layer | Choice | Why |
|---|---|---|
| Backend | Node 22, built-in `http`, no framework | Zero dependencies: nothing to audit or break, runs anywhere. Trade-off: hand-rolled routing (about 40 lines), acceptable at this size. |
| Database | SQLite (`node:sqlite`) | Single file, transactional, enough for 2,600 students. Money is stored as integer paise. Migrating to Postgres means changing `db.js` only. |
| Frontend | Static HTML, CSS and vanilla JS, built with DOM calls (`textContent`, never `innerHTML`) | Small payload for low-end phones on slow networks; no build step; XSS-safe by construction. |
| Auth | Parent: mobile and OTP. Staff: email and password (scrypt). Signed HMAC session token, 8-hour expiry | Matches the brief (parents use OTP). SMS is mocked, so the demo OTP is configurable. |

**Layering:** `src/fees.js` holds pure rules with no I/O (unit-tested). `src/db.js` holds schema, seed and automation. `src/server.js` holds routes, auth and validation. `public/` holds the UI.

## 3. Data model
`users`(role, email, pass_hash) · `students`(code, batch, centre, parent_phone, lang, fee_total, course dates, consent_at, status) · `instalments`(student, due, amount) · `payments`(student, amount, **unique ref**, source) · `unmatched`(ref, payer, amount) · `reminders`(**unique instalment+offset**) · `tasks`(**unique student**, score, reasons, status) · `metrics`(attendance and test series) · `refunds`.
Key decision: **balances are never stored.** Payments are allocated to instalments oldest-first at read time, so the ledger cannot drift out of sync and an out-of-order or partial payment is always handled the same way.

## 4. Main flows
1. **Pay:** parent taps Pay, a confirm sheet appears (mock gateway, test mode), and `POST /api/pay` pays the oldest unpaid balance. A client-generated `ref` makes double-taps and retries idempotent (unique constraint).
2. **Reminders:** the daily job (also a button) checks each unpaid instalment at offsets −3, 0, +3, +7 and +15 days. It inserts into `reminders` with a unique key, so re-running never duplicates. **Stopping on payment** works because the rule only fires when the balance is above 0. There is no state to forget to clear.
3. **Gateway webhook:** requires `x-webhook-secret`. A payment is applied only if it matches a known student and does not exceed their balance. Anything else goes to the **accounts queue** and nothing is marked paid. Accounts can then assign it manually.
4. **Refund:** staff pick a student and leaving date, see a full breakup, then confirm. Confirming closes the account, which also stops reminders and the pay button.
5. **Dashboard:** ageing buckets (0–30, 31–60, 60+ late, not yet due) per centre and batch, a student list sorted by lateness, and a Tally CSV export with a GST split.

### Refund rule (ASSUMPTION, see §8)
`consumed = fee × elapsed days ÷ course days` · `admin fee = min(5% of fee, ₹5,000)` · `refund = paid − consumed − admin fee`, clamped to [0, paid] · payable within 10 days of leaving (MoE 2024 guideline). Covered by unit tests, including the clamps.

## 5. The AI part: dropout-risk flag
It is an **explainable weighted score (0–100), not a trained model**. Signals: overdue instalments (up to 40), recent attendance below 70% (20), attendance drop above 10 points (15), and test scores down over 20% (25). A flag at 50 or above creates **one counsellor call task** with the human-readable reasons.
**When it is wrong or unsure:** it can never message a parent or touch fees. Counsellors mark *Done* or *False flag*, and a task is unique per student so it cannot spam. I chose rules over ML because there is no labelled history, and every flag must be explainable to a counsellor. With real history, the score could be calibrated or replaced by a model, with the same task-only output.

## 6. UI and design decisions
- **Parent home:** one hero with amount, due date, status and one pay button, matching the brief's "five seconds" test. Instalments, receipts, attendance and scores sit below the fold.
- **Staff:** four tabs (Dues, Tasks and queue, Refund, Reminders). Ageing is shown as stacked bars, since a rupee table hides where the money is stuck. Rows open a ledger sheet.
- **System:** white space, one accent colour (deep green), system fonts with Devanagari fallback, 44px touch targets, visible focus rings, automatic dark mode, language toggle (Hindi default) on every screen. Loading, empty and error states exist on each view. Mobile-first, with sheets that become centred modals on desktop.

## 7. Security
No secrets in the repo (`.env.example` lists names only). scrypt password hashing, HMAC-signed tokens, OTP and login throttling, role checks on every route, parent-to-child ownership checks (tested), input validation, 100 KB body limit, security headers including a strict CSP, parameterised SQL, and DOM built with `textContent`.

## 8. Assumptions (labelled)
A1 Course runs about 12 months, fee ₹1.2 lakh (JEE) or ₹1.6 lakh (NEET), 4 instalments of 25%. A2 Fees include 18% GST. A3 Refund policy as in §4 (the client's written policy replaces it; only `refund()` changes). A4 Parent identity is the phone number on file, one parent to many children. A5 Seed students beyond the 3 sample rows are invented. Sample due dates are made relative to today so the statuses match the brief. A6 `consent_at` is stored, but a real verifiable-parental-consent flow is not built. A7 Reminders are written to a log, not sent.

## 9. What I cut, and next steps
**Cut:** real payment gateway and SMS/WhatsApp, verifiable parental consent (DPDP), bulk CSV upload of attendance and scores (scores are seeded), full GST receipt PDFs, centre-scoped staff roles, instalment plan editing and discounts UI, audit log, and a scheduler (the job is a button and is idempotent, so a cron can call it).
**Next:** consent capture at onboarding, receipt PDFs, the CSV upload, Postgres, a cron, an audit trail for refunds, and a counsellor role.
**Known limits:** in-memory throttling resets on restart; the SQLite file needs a persistent disk when deployed; Hindi strings should be reviewed by a native speaker; no visual regression or browser tests.
