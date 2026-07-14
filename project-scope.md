## Problem

I am tired of manually tracking my expenses in Google Sheets. Every month I duplicate a
sheet and manually input my expenses, salary, and savings. I also struggle to access it
from my phone — I need a laptop to edit it conveniently.

## Solution

An expense tracker app: mobile-friendly so I can update anywhere instantly, but with the
same data accessible on a laptop. It models my real spreadsheet — percentage-based
budget envelopes, savings accounts with running balances, and a savings prediction.

---

## v1 Scope

Ship the smallest thing that actually replaces the spreadsheet.

**In v1**

- Google login (single user — me).
- Budget **envelopes** as a % of monthly income: Needs 50 / Wants 25 / Savings 25, plus a
  **Misc** pool. Percentages editable.
- **Savings accounts** (MP2, Digital Bank) with a sub-split (40 / 60) and running balances
  across months.
- Monthly cycle: enter income → envelopes auto-size → log transactions → each envelope
  shows `Left`.
- **Close the month**: for each leftover, I choose — carry to Misc, or move into a savings
  account (manual decision each month).
- **Savings prediction** to a chosen date (year-end or any date).
- **Monthly summary / history**: what I saved each month, envelope by envelope.
- Single currency (₱ PHP).
- Installment notes (e.g. "3/9") are just free text on a transaction — no special handling.

**Deferred to v2+**

- Offline support + sync (write queue, service worker, conflict resolution).
- AI smart expense categorization.
- AI spending insights / coach / tips / trivia.
- Importing existing spreadsheet history (v1 starts fresh; entries can be back-dated).
- Funding-source tracking (paid from cash vs bank vs card).
- Active installment management (auto-adding monthly payments).

---

## Tech Stack

Secondary goal: learn backend development — so the backend is hand-built, not a BaaS.

**Frontend** — React + Vite + Tailwind, as an installable **PWA** (mobile-first, via
`vite-plugin-pwa`). Deploy static on Vercel/Netlify.

**Backend** — Express + Postgres + **Prisma** (ORM + migrations):
- **Auth** — Auth.js (`@auth/express`) with the Google provider + `@auth/prisma-adapter`.
  Sessions persisted in Postgres; all app data is owned by the Auth.js `User`.
- **Authorization** — every query scoped to the authenticated user's id in the API layer.
- **Validation** — Zod on request bodies.
- **AI secrets** (v2) live on the Express server, never the client.

**Structure** — one repo: `client/` (React) + `server/` (Express), separate `package.json`.

**Hosting** — frontend on Vercel/Netlify; Express on Render; Postgres on Neon (durable
free tier). Free Render spins down when idle → a cold start on first open; fine for
personal use.

Money math lives in **pure functions with unit tests** (the only genuinely risky logic).

---

## Data Model

Auth.js's adapter adds its own tables (`User`, `Account`, `Session`, `VerificationToken`).
On top of those sit the six app models below, every row owned by a `userId` that FKs to
`User.id`. Every API query is scoped to the authenticated user in the Express layer (no
row-level security — authorization is enforced in application code).

| Table | Key fields | Purpose |
|---|---|---|
| **envelopes** | `name`, `kind` (spending/savings), `percent`, `sort` | Categories. Seeded: Needs (spending, 50), Wants (25), Savings (savings, 25), Misc (spending, 0). Editable. |
| **savings_accounts** | `name`, `split_percent`, `opening_balance`, `sort` | MP2 (40%), Digital Bank (60%). `opening_balance` seeds current running totals. |
| **months** | `period` (first of month), `income`, `status` (open/closed) | One per calendar month. Income editable, prefilled from last month. |
| **month_envelopes** | `month_id`, `envelope_id`, `allocated`, `carried_in` | Per-envelope snapshot for that month. `budget = allocated + carried_in`. |
| **transactions** | `month_id`, `envelope_id`, `amount`, `note`, `occurred_on` | Spending line items. `note` holds free text like "(3/9)". Back-datable. |
| **savings_contributions** | `month_id`, `account_id`, `amount`, `source` (planned/leftover), `occurred_on` | Money entering a savings account: the planned monthly split, or a leftover moved at month-close. |

**Unifying rule:** every envelope's budget = `percent × income + carried_in`. Needs/Wants/
Savings normally carry in 0; Misc has `percent = 0` and its budget *is* the leftovers
carried in. One formula, no special-casing.

**Derived, never stored** (so nothing drifts):
- envelope `spent` = sum of its transactions this month; `left = budget − spent`
- savings account `balance` = `opening_balance + sum(all contributions to it)`

**Decisions:** savings is a separate table from spending (different meaning — a growing
tracked balance, not money leaving). No funding-source column in v1.

---

## Screens

1. **This Month** (home) — income at top; envelope cards showing budget / spent / left;
   quick "add expense".
2. **Add Transaction** — envelope, amount, note, date (default today). For the Savings
   envelope: pick account + mark planned/leftover.
3. **Envelope Detail** — transactions in an envelope this month; edit / delete / back-date.
4. **Close Month** — each envelope's `Left`; choose carry-to-Misc / move-to-savings /
   leave. Locks the month, opens the next prefilled.
5. **Savings** — accounts, balances, contribution history.
6. **Prediction** — pick a target date (default year-end); projected total + per-account.
7. **History / Summary** — past months, saved per month, envelope breakdown.
8. **Settings** — envelope %, savings accounts & splits, default income, currency.

---

## Key Flows

**Monthly cycle** — open a month → income prefilled from last month → envelopes sized by
percent → log transactions through the month → each envelope's `Left` updates live.

**Month-close** — manual per-envelope decision on leftovers (carry to Misc / move to a
savings account / leave). Closes the month and opens the next one prefilled.

**Prediction** — `projected balance at date D = current balance + planned_monthly_split ×
months_remaining(now → D)`, per account and total. Baseline assumes the plan is met;
manual leftovers are not counted (conservative).

---

## Edge Cases / Rules

- Closed months are read-only unless explicitly reopened.
- Envelope percentages need not sum to 100 (Misc sits on top) — show a note, don't force.
- v1 has no offline queue: if the device is offline, detect it and block save with a clear
  message. (Real offline support is v2.)
- Every API query is scoped to the authenticated user's id (enforced in Express), so data
  is isolated even though the DB has no row-level security.

---

## Testing

Unit tests on the pure money-math functions: envelope budget = `percent × income +
carried_in`, `left = budget − spent`, account balance = `opening + Σ contributions`, and
the prediction projection. No framework beyond a test runner; these are pure functions.
