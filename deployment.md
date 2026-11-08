# deployment.md

## Run locally
Requires **Node 22.5+** (uses the built-in `node:sqlite`). No `npm install` is needed because there are no dependencies.
```bash
git clone <YOUR REPO URL> && cd fee-portal
npm start        # seeds the database on first run, serves http://localhost:3000
npm test         # 21 tests: fee rules, CSV parsing, API access control and flows
```
To reset the data, stop the server, delete `data.db` and start again. **Delete `data.db` after pulling schema changes.**
To see the sample statuses exactly as in the brief (Ishita 23 days overdue, Mohit due in 13 days), start with the date pinned:
`DEMO_TODAY=2026-11-02 npm start` (Windows PowerShell: `$env:DEMO_TODAY="2026-11-02"; npm start`).

## How it is deployed
**Free option used: Hugging Face Spaces (Docker).** The repo has a `Dockerfile` and a `README.md` with the Space settings (`sdk: docker`, `app_port: 7860`). The Space builds the image and runs `node src/server.js` on port 7860. The database is `/tmp/data.db`, so it is **recreated from seed data whenever the Space restarts**. This is fine for a demo, but not for production.
**Auto-deploy:** `.github/workflows/deploy-space.yml` pushes `main` to the Space on every GitHub push (needs the GitHub secrets `HF_TOKEN` and `HF_USERNAME`).
Any other Node 22 host also works (Render, Railway, Fly.io): start command `npm start`, health check `/healthz`, and for real use mount a persistent disk and point `DB_PATH` at it.

## Environment variables (names only)
`SESSION_SECRET` (long random value in production) · `DEMO_OTP` · `DEMO_STAFF_PASSWORD` · `WEBHOOK_SECRET` (the webhook is off if unset) · `RECEIPT_GSTIN` · `DEMO_TODAY` (optional, pins "today" for demos) · `DB_PATH` · `PORT`

## Demo login details
| Role | Login |
|---|---|
| Parent: part-paid, overdue (Ishita Sharma) | mobile `9000000002`, OTP `123456` |
| Parent: fully paid (Aarav Meena) | mobile `9000000001`, OTP `123456` |
| Parent: new, shows the **consent screen** first (Mohit Gurjar) | mobile `9000000003`, OTP `123456` |
| Accounts executive | `accounts@demo.test` / `demo-accounts-1` |

## Suggested reviewer walkthrough
1. Parent `9000000002`: amount, date and Pay button; pay, then open the **Receipt** (GST split). Open the refund policy from the footer.
2. Parent `9000000003`: give guardian consent, and the dues appear. **Withdraw consent** re-locks them.
3. Staff: **Dues** tab (ageing by centre and batch), open a student, apply a discount, copy a payment link and open it in a private window.
4. Staff: **Reminders** tab, *Run automation*; then **Tasks and queue** (counsellor tasks with reasons, and the unmatched payment to assign).
5. Staff: **Upload** tab, upload a CSV (`student_id,value`) for a batch, and see accepted and rejected rows. Then **Refund**: calculate, confirm, and watch it appear in tracking with its pay-by date.
