# Technical Design Document: Fee Tracking System & Parent Portal

**Client:** Company A, Jaipur coaching institute (Problem 3)
**GitHub:** `<ADD YOUR REPO URL HERE>`
**Live app:** `<ADD LIVE URL HERE>`

## 1. Scope: every "must have" is built
| Must have (brief) | Where |
|---|---|
| Fee ledger: plan, instalments, discounts, payments, balance, days overdue | Student ledger sheet (staff); `ledger()` in `fees.js`; plan name, gross, discount, net |
| Parent portal, OTP login: dues, receipts, attendance, test scores | Parent home |
| Automatic Hindi/English reminders (before, on, after), stopping on payment | `runAutomation()`; offsets −3, 0, +3, +7, +15 |
| Payment link per instalment (test mode) that marks it paid | Public `/pay/<signed token>` page |
| Pro-rata refund calculator | Refund tab; `refund()` |
| Accounts dashboard by centre and batch, ageing, Tally export | Dues tab; `/api/export/tally.csv` |
| Bulk upload of attendance and test scores per batch | Upload tab; `csv.js` |
| AI: dropout-risk flag → counsellor task | `dropoutRisk()`; Tasks tab |
| Unmatched payments queue | webhook → `unmatched` → Tasks tab |
| Constraints: refund policy published, 10-day refund, GST receipts, DPDP parental consent, Hindi | `/policy` page, refund tracker, receipt view, consent gate, Hindi default |

Roles: **parent** and **accounts executive**.

## 2. Architecture and why
| Layer | Choice | Why |
|---|---|---|
| Backend | Node 22, built-in `http`, no framework | Zero dependencies: nothing to audit; runs anywhere. Trade-off: hand-rolled routing, fine at this size. |
| Database | SQLite (`node:sqlite`) | Single file, transactional, ample for 2,600 students. Money stored as integer paise. Moving to Postgres only touches `db.js`. |
| Frontend | Static HTML/CSS/vanilla JS, DOM built with `textContent` (never `innerHTML`) | Light payload for low-end phones on slow networks; no build step; XSS-safe by construction. |
| Auth | Parent: mobile + OTP. Staff: email + password (scrypt). HMAC-signed session token, 8h expiry | Matches the brief. SMS is mocked, so the OTP is a configurable demo value. |

Layering: `src/fees.js` (pure rules, unit-tested) · `src/csv.js` (pure parser) · `src/db.js` (schema, seed, automation) · `src/server.js` (routes, auth, validation) · `public/` (UI).

## 3. Data model
`users` · `students`(batch, centre, parent_phone, lang, fee_total, course dates, plan_name, discount, discount_reason, status) · `instalments` · `payments`(**unique ref**, source) · `unmatched` · `reminders`(**unique instalment+offset**) · `tasks`(**unique student**) · `metrics`(attendance and score series) · `consents`(guardian, relation, phone, version, withdrawn_at) · `refunds`(pay_by, status, paid_at).
Key decision: **balances are never stored.** Payments are allocated to instalments oldest-first when read, so the ledger cannot drift and partial or out-of-order payments behave the same way every time.

## 4. Main flows
1. **Pay (portal or link):** confirm sheet (mock gateway) → server pays the oldest unpaid instalment's balance. A client `ref` makes retries and double-taps idempotent, including a retry after success.
2. **Payment link:** each instalment has a signed token (HMAC); a tampered or invalid token returns 404. Paying a *later* instalment while an earlier one is open is refused, which keeps allocation correct. Reminders contain this link.
3. **Reminders:** a daily job (also a button, safe to re-run) inserts into `reminders` under a unique key. It only fires while a balance remains, which is how it **stops on payment**. Students without active guardian consent get **no** reminders.
4. **Webhook:** needs `x-webhook-secret`. A payment is applied only if the student matches and it does not exceed the balance; otherwise it goes to the accounts queue and nothing is marked paid. Accounts assign it manually.
5. **Refund:** pick student and date → full breakup → confirm. Confirming closes the account (stops reminders and Pay) and creates a tracked refund with a pay-by date (leaving date + 10 days); overdue refunds are flagged, and accounts mark them paid.
6. **Discount:** staff apply an amount with a reason; it reduces the latest unpaid instalments only, never exceeds the balance, and the refund uses the net fee.
7. **Bulk upload:** staff choose batch and type (attendance or score) and upload `student_id,value`. Valid rows are saved atomically; invalid rows (unknown student, student not in that batch, value outside 0–100, duplicate, bad header) come back with line numbers.
8. **Receipt:** each payment has a numbered receipt (`RCPT-YYYY-NNNNN`) showing base, CGST 9%, SGST 9%, total, GSTIN and SAC, printable or savable as PDF from the browser.
9. **Consent (DPDP):** after OTP login the parent must name themselves as guardian and agree before any child data is shown. The record stores the OTP-verified phone and the policy version. Withdrawal is one tap and re-locks the data and stops reminders.

### Refund rule (ASSUMPTION, see §8), published at `/policy`
`consumed = net fee × days attended ÷ course days` · `admin fee = min(5% of net fee, ₹5,000)` · `refund = paid − consumed − admin fee`, clamped to [0, paid] · payable within 10 days. All numbers live in one `POLICY` object, so the calculator and the public page cannot disagree.

## 5. The AI part: dropout-risk flag
An **explainable weighted score (0–100), not a trained model**. Signals: overdue instalments (up to 40), recent attendance below 70% (20), attendance drop above 10 points (15), test scores down over 20% (25). A score of 50 or more creates **one counsellor call task** with the reasons in plain language.
**When it is wrong or unsure:** it can never message a parent or change a fee. Counsellors mark *Done* or *False flag*. Tasks are unique per student, so it cannot spam. Rules were chosen over ML because there is no labelled history and every flag must be explainable. With real history it could be calibrated or replaced with a model that has the same task-only output.

## 6. UI and design decisions
- **Parent home:** one hero with amount, due date, status and one Pay button (the "five seconds" test); instalments, receipts, attendance and scores sit below it.
- **Pay link:** a single-purpose page (name, amount, due date, Pay), shareable by SMS.
- **Staff:** five tabs (Dues, Tasks and queue, Refund, Upload, Reminders). Ageing is drawn as stacked bars with a colour legend because a rupee table hides where money is stuck; rows open a ledger sheet with discount and copy-link actions.
- **System:** white space, one accent colour, system fonts with Devanagari fallback, 44px touch targets, visible focus rings, automatic dark mode, Hindi default with an English toggle everywhere, print styles for receipts, and loading, empty and error states on each view. Mobile-first; sheets become centred modals on desktop.
- Checked in headless Chromium at 390px width: parent flow, consent gate, pay, receipt, all staff tabs and the policy page ran with no console errors.

## 7. Security
No secrets in the repo (`.env.example` lists names only). scrypt password hashing, HMAC-signed session tokens and pay links, OTP and login throttling, role checks on every route, parent-to-child ownership checks (tested), validated inputs (types, ranges, lengths, dates), 100 KB body limit, security headers with a strict CSP, parameterised SQL, DOM built with `textContent`, webhook secret, and no Aadhaar or other unnecessary personal data.

## 8. Assumptions (labelled)
- **A1** Course runs 2026-04-01 to 2027-03-31; fee ₹1.2 lakh (JEE) or ₹1.6 lakh (NEET) in 4 instalments.
- **A2** Fees include 18% GST (CGST 9% + SGST 9%); SAC 999293 and the GSTIN are demo values set by `RECEIPT_GSTIN`.
- **A3** Refund policy as in §4 (the client's written policy replaces it; only `POLICY` changes).
- **A4** The parent's identity is the phone number on file; one parent can have several children.
- **A5** Students beyond the three sample rows are invented. The sample students use the exact sample dates. With `DEMO_TODAY=2026-11-02` the statuses match the brief exactly (Ishita 23 days overdue, Mohit due in 13 days).
- **A6** "Verifiable" consent is the guardian confirming by OTP to the phone on file plus explicit agreement. A production system may need a stronger method, such as a document check, per legal advice.
- **A7** SMS, WhatsApp and the payment gateway are mocked. Reminders are written to a log and the payment page is a stand-in.
- **A8** Receipts are rendered in the browser (print or Save as PDF), not stored as files.

## 9. What I cut, known limits and next steps
**Cut:** a real gateway and SMS provider, a scheduler (the job is idempotent and a cron can call it), centre-scoped staff roles, an audit log, an instalment-plan builder (plans are seeded), server-side PDF receipts, and Excel (.xlsx) upload (CSV only).
**Known limits:**
- Login throttling is in memory and resets on restart.
- SQLite needs a persistent disk when deployed.
- Hindi strings need review by a native speaker.
- There are no automated browser tests; the UI was exercised once with a scripted headless browser.
- Discounts only reduce unpaid instalments.
**Next:** a real gateway and SMS provider, cron, centre-scoped roles, an audit trail for refunds and discounts, server-side receipt PDFs, a counsellor role and a plan builder.
