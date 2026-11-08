# deployment.md

## Run locally
Requires **Node 22.5+** (uses built-in `node:sqlite`). No `npm install` needed: zero dependencies.
```bash
git clone <YOUR REPO URL> && cd fee-portal
cp .env.example .env     # optional; every variable has a demo default
npm start                # seeds the database on first run, serves http://localhost:3000
npm test                 # 13 tests: fee rules + API access control
```
Delete `data.db` to reseed. Seeded due dates are relative to today.

## Deployment
Any Node 22 host with a persistent disk (Render, Railway, Fly.io). Build: none. Start command: `npm start`. Health check: `/healthz`. Mount the disk and point `DB_PATH` at it. Without it, the SQLite file resets on every deploy.

## Environment variables (names only)
`SESSION_SECRET` (set a long random value in production) · `DEMO_OTP` · `DEMO_STAFF_PASSWORD` · `WEBHOOK_SECRET` (the webhook is disabled if unset) · `DB_PATH` · `PORT`

## Demo logins
| Role | Login |
|---|---|
| Parent, part-paid, overdue (Ishita Sharma) | mobile `9000000002`, OTP `123456` |
| Parent, fully paid (Aarav Meena) | mobile `9000000001`, OTP `123456` |
| Parent, due soon (Mohit Gurjar) | mobile `9000000003`, OTP `123456` |
| Accounts executive | `accounts@demo.test` / `demo-accounts-1` |

## Suggested reviewer walkthrough
1. Parent `9000000002`: see the overdue amount, press Pay, confirm, and the receipt appears.
2. Staff: Dues tab (ageing), open a student, then Reminders tab, *Run automation*, then Tasks and queue (counsellor tasks and the unmatched payment).
3. Refund tab: pick a student and date, review the breakup, confirm.
