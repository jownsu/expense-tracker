# Expense Tracker — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the v1 expense tracker that replaces the spreadsheet — percentage budget envelopes, savings accounts with running balances, and a savings prediction — as an installable PWA backed by a hand-built Express/Prisma API.

**Architecture:** Two apps in one repo. `client/` is a React+Vite PWA (SPA). `server/` is an Express + Prisma + Postgres API. Auth.js handles Google login; every API query is scoped to the authenticated `User`. Money math lives in pure, unit-tested functions.

**Tech Stack:** React · Vite · Tailwind · shadcn/ui · TanStack React Query · Express · Prisma · Postgres (Neon) · Auth.js (`@auth/express`) · Zod · Vitest · TypeScript.

## Global Constraints

- **Single user.** Every DB query is scoped to the authenticated `User.id` in the Express layer. No row-level security.
- **Money is integer whole pesos (₱), never floats.** The source spreadsheet has no decimals. Store `amount` as `Int`.
- **TypeScript throughout**, both apps. Node 20+.
- **Currency is PHP only.** No multi-currency.
- **Installments are free-text notes** on a transaction — no special handling.
- **Out of scope for this plan (v2+):** offline/sync, all AI features, spreadsheet import, funding-source tracking.
- **Every task ends green and committed.** BE tasks: I coach the concepts as we go. FE tasks: build fast, minimal narration.

**Task card legend:** each task lists **Files**, **Deliverable**, **Verify** (how you prove it works), **Commit**, and — on backend tasks — a **Coach** line naming the concepts to learn.

---

## Phase 0 — Scaffold & tooling

### Task 0.1 — Repo + monorepo layout
- **Files:** Create `.gitignore`, `README.md`, `.env.example`, `client/`, `server/`.
- **Deliverable:** `git init`; two empty app folders; root README explaining the layout; `.gitignore` covering `node_modules`, `.env`, `dist`.
- **Verify:** `git status` clean after commit; folders exist.
- **Commit:** `chore: init repo and monorepo layout`

### Task 0.2 — Server scaffold (Express + TS)
- **Files:** `server/package.json`, `server/tsconfig.json`, `server/src/index.ts`, `server/.env.example`.
- **Deliverable:** Express app with `GET /health` → `{ ok: true }`; dev script via `tsx watch`; TS strict mode on.
- **Verify:** `npm run dev` in `server/`, then `curl localhost:4000/health` returns `{"ok":true}`.
- **Commit:** `feat(server): express scaffold with health check`
- **Coach:** how an Express app boots, middleware order, why a health route, env loading with `dotenv`.

### Task 0.3 — Client scaffold (Vite + React + Tailwind + shadcn + React Query)
- **Files:** `client/` via `npm create vite@latest` (react-ts), Tailwind config, `client/src/main.tsx`, shadcn init, React Query provider.
- **Deliverable:** Vite app renders a page; Tailwind classes work; shadcn `Button` renders; `QueryClientProvider` wraps the app.
- **Verify:** `npm run dev` in `client/`; page loads with a styled shadcn button.
- **Commit:** `feat(client): vite + tailwind + shadcn + react-query scaffold`

---

## Phase 1 — Database & Prisma foundation

### Task 1.1 — Neon + Prisma init
- **Files:** `server/prisma/schema.prisma`, `server/.env` (`DATABASE_URL`).
- **Deliverable:** Neon project created; `prisma init`; connection verified.
- **Verify:** `npx prisma db pull` connects (empty DB, no error).
- **Commit:** `chore(server): prisma init + neon connection`
- **Coach:** what a connection string holds, what Prisma is, `schema.prisma` structure, migrations vs `db push`.

### Task 1.2 — Schema: Auth.js + app models
- **Files:** Modify `server/prisma/schema.prisma`.
- **Deliverable:** Auth.js models (`User`, `Account`, `Session`, `VerificationToken`) + app models: `Envelope`, `SavingsAccount`, `Month`, `MonthEnvelope`, `Transaction`, `SavingsContribution`. All app models have `userId` → `User`. `amount`/`income`/`allocated`/etc. are `Int`. First migration run.
- **Verify:** `npx prisma migrate dev --name init` succeeds; `npx prisma studio` shows all tables.
- **Commit:** `feat(server): prisma schema for auth + app models`
- **Coach:** modeling relations & foreign keys, one-to-many, enums (`Month.status`, `SavingsContribution.source`), why snapshot `MonthEnvelope` instead of recomputing, integer money.

### Task 1.3 — Default-envelope seeding service
- **Files:** `server/src/services/seedUser.ts`.
- **Deliverable:** `seedDefaultEnvelopes(userId)` inserts Needs (spending, 50), Wants (25), Savings (savings, 25), Misc (spending, 0) if the user has none. Idempotent.
- **Verify:** Unit test: call twice for a user id → exactly 4 envelopes.
- **Commit:** `feat(server): seed default envelopes for a new user`
- **Coach:** idempotency, why seed per-user not globally, transactions.

---

## Phase 2 — Auth (Auth.js)

### Task 2.1 — Google OAuth credentials
- **Files:** `server/.env` (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`), `.env.example` updated.
- **Deliverable:** Google Cloud OAuth client created (web app), redirect URIs for local + prod noted in README.
- **Verify:** Values present in `.env`; documented in README.
- **Commit:** `docs: google oauth setup notes` (no secrets committed)
- **Coach:** what an OAuth client is, client id vs secret, redirect URIs, why secrets never hit git.

### Task 2.2 — Auth.js wiring
- **Files:** `server/src/auth.ts`, modify `server/src/index.ts`.
- **Deliverable:** `@auth/express` mounted with Google provider + `@auth/prisma-adapter`; session strategy configured; auth routes live under `/auth/*`.
- **Verify:** Visit `/auth/signin` → Google consent → row appears in `User`/`Account`/`Session` (check Prisma Studio).
- **Commit:** `feat(server): auth.js google login with prisma adapter`
- **Coach:** the OAuth redirect dance end-to-end, what the adapter writes to each table, sessions vs JWT.

### Task 2.3 — CORS + cross-origin cookies
- **Files:** Modify `server/src/index.ts`.
- **Deliverable:** `cors` configured for the client origin with `credentials: true`; session cookie `sameSite=none` + `secure` in prod; client origin in env.
- **Verify:** From the client dev origin, `fetch('/auth/session', {credentials:'include'})` returns the session (not blocked by CORS).
- **Commit:** `feat(server): cors + cross-origin session cookies`
- **Coach:** the same-origin policy, why cross-site cookies need `SameSite=None; Secure`, credentialed CORS — the #1 place this stack breaks.

### Task 2.4 — `requireUser` middleware + seed on first login
- **Files:** `server/src/middleware/requireUser.ts`, modify auth callback.
- **Deliverable:** Middleware rejects unauthenticated requests (401) and attaches `req.userId`. On first successful login, `seedDefaultEnvelopes(userId)` runs.
- **Verify:** `GET /api/me` returns 401 when logged out, `{ userId }` when logged in; a brand-new user has 4 envelopes.
- **Commit:** `feat(server): requireUser middleware + first-login seeding`
- **Coach:** middleware as a gate, reading the session server-side, where to hook "first login".

---

## Phase 3 — Money-math core (pure functions, TDD)

Pure functions in `server/src/domain/`. **These are the only functions with inline test code — the risky logic.** Tests use the real numbers from the February spreadsheet.

### Task 3.1 — Envelope budget & left
- **Files:** Create `server/src/domain/envelope.ts`, `server/src/domain/envelope.test.ts`.
- **Interfaces produced:** `envelopeBudget(percent:number, income:number, carriedIn?:number):number`, `envelopeLeft(budget:number, spent:number):number`.

- [ ] **Step 1 — failing test** (`envelope.test.ts`):
```ts
import { describe, it, expect } from 'vitest';
import { envelopeBudget, envelopeLeft } from './envelope';

describe('envelopeBudget', () => {
  it('sizes by percent of income', () => {
    expect(envelopeBudget(50, 35000)).toBe(17500); // Needs
    expect(envelopeBudget(25, 35000)).toBe(8750);  // Wants / Savings
  });
  it('adds carried-in leftovers (Misc has percent 0)', () => {
    expect(envelopeBudget(0, 35000, 4677)).toBe(4677);
  });
});

describe('envelopeLeft', () => {
  it('is budget minus spent', () => {
    expect(envelopeLeft(17500, 17330)).toBe(170); // Needs left, Feb
    expect(envelopeLeft(8750, 8175)).toBe(575);   // Wants left, Feb
  });
});
```
- [ ] **Step 2 — run, expect FAIL:** `npx vitest run src/domain/envelope.test.ts` → fails (module not found).
- [ ] **Step 3 — implement** (`envelope.ts`):
```ts
export function envelopeBudget(percent: number, income: number, carriedIn = 0): number {
  return Math.round((percent / 100) * income) + carriedIn;
}
export function envelopeLeft(budget: number, spent: number): number {
  return budget - spent;
}
```
- [ ] **Step 4 — run, expect PASS.**
- [ ] **Step 5 — commit:** `feat(domain): envelope budget and left`
- **Coach:** the unifying rule (`percent×income + carriedIn` covers Misc too), integer rounding on money, why pure functions are trivially testable.

### Task 3.2 — Savings account balance
- **Files:** Create `server/src/domain/savings.ts`, `server/src/domain/savings.test.ts`.
- **Interfaces produced:** `accountBalance(opening:number, contributions:number[]):number`.

- [ ] **Step 1 — failing test:**
```ts
import { describe, it, expect } from 'vitest';
import { accountBalance } from './savings';

describe('accountBalance', () => {
  it('is opening plus all contributions', () => {
    expect(accountBalance(14000, [3500])).toBe(17500);        // MP2
    expect(accountBalance(21000, [5250])).toBe(26250);        // Digital Bank
    expect(accountBalance(0, [3500, 3500, 3500])).toBe(10500);
  });
});
```
- [ ] **Step 2 — run, expect FAIL.**
- [ ] **Step 3 — implement:**
```ts
export function accountBalance(opening: number, contributions: number[]): number {
  return opening + contributions.reduce((sum, c) => sum + c, 0);
}
```
- [ ] **Step 4 — run, expect PASS.**
- [ ] **Step 5 — commit:** `feat(domain): savings account balance`
- **Coach:** derived vs stored state — balance is never written, always summed, so it can't drift.

### Task 3.3 — Split monthly savings across accounts
- **Files:** Modify `server/src/domain/savings.ts` + `savings.test.ts`.
- **Interfaces produced:** `splitSavings(total:number, splits:{accountId:string,percent:number}[]):{accountId:string,amount:number}[]` — assigns the rounding remainder to the last account so no peso is lost.

- [ ] **Step 1 — failing test:**
```ts
import { splitSavings } from './savings';

describe('splitSavings', () => {
  it('splits by percent (40/60 of 8750)', () => {
    expect(splitSavings(8750, [
      { accountId: 'mp2', percent: 40 },
      { accountId: 'db', percent: 60 },
    ])).toEqual([
      { accountId: 'mp2', amount: 3500 },
      { accountId: 'db', amount: 5250 },
    ]);
  });
  it('loses no peso to rounding', () => {
    const r = splitSavings(100, [
      { accountId: 'a', percent: 33 },
      { accountId: 'b', percent: 33 },
      { accountId: 'c', percent: 34 },
    ]);
    expect(r.reduce((s, x) => s + x.amount, 0)).toBe(100);
  });
});
```
- [ ] **Step 2 — run, expect FAIL.**
- [ ] **Step 3 — implement:**
```ts
export function splitSavings(
  total: number,
  splits: { accountId: string; percent: number }[],
): { accountId: string; amount: number }[] {
  const out = splits.map((s) => ({
    accountId: s.accountId,
    amount: Math.floor((s.percent / 100) * total),
  }));
  const remainder = total - out.reduce((sum, x) => sum + x.amount, 0);
  if (out.length) out[out.length - 1].amount += remainder;
  return out;
}
```
- [ ] **Step 4 — run, expect PASS.**
- [ ] **Step 5 — commit:** `feat(domain): split monthly savings across accounts`
- **Coach:** why integer money forces explicit remainder handling, floor-then-fix pattern.

### Task 3.4 — Savings projection (prediction)
- **Files:** Create `server/src/domain/prediction.ts`, `server/src/domain/prediction.test.ts`.
- **Interfaces produced:** `monthsBetween(from:Date, to:Date):number` (whole months, min 0); `projectBalance(current:number, monthlySetAside:number, months:number):number`.

- [ ] **Step 1 — failing test:**
```ts
import { describe, it, expect } from 'vitest';
import { monthsBetween, projectBalance } from './prediction';

describe('monthsBetween', () => {
  it('counts whole months forward', () => {
    expect(monthsBetween(new Date('2026-02-01'), new Date('2026-12-01'))).toBe(10);
  });
  it('never negative', () => {
    expect(monthsBetween(new Date('2026-12-01'), new Date('2026-02-01'))).toBe(0);
  });
});

describe('projectBalance', () => {
  it('adds monthly set-aside per month', () => {
    // current 43,750 total savings + 8,750/mo for 5 months
    expect(projectBalance(43750, 8750, 5)).toBe(87500);
  });
});
```
- [ ] **Step 2 — run, expect FAIL.**
- [ ] **Step 3 — implement:**
```ts
export function monthsBetween(from: Date, to: Date): number {
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return Math.max(0, months);
}
export function projectBalance(current: number, monthlySetAside: number, months: number): number {
  return current + monthlySetAside * months;
}
```
- [ ] **Step 4 — run, expect PASS.**
- [ ] **Step 5 — commit:** `feat(domain): savings projection`
- **Coach:** the prediction is deterministic arithmetic ("if I stick to the plan"), not ML; leftovers are excluded because they're a manual month-end choice.

---

## Phase 4 — API: months & envelopes

All routes under `/api`, behind `requireUser`, scoped to `req.userId`. Request bodies validated with Zod.

### Task 4.1 — Envelope + settings routes
- **Files:** `server/src/routes/envelopes.ts`, Zod schemas.
- **Deliverable:** `GET /api/envelopes`, `PATCH /api/envelopes/:id` (name/percent/sort), `POST /api/envelopes`, `DELETE /api/envelopes/:id`. Percentages editable.
- **Verify:** Integration test: seeded user has 4; PATCH Needs to 55% persists; all scoped to user.
- **Commit:** `feat(api): envelopes CRUD`
- **Coach:** Zod validation as a trust boundary, scoping every query by `userId`, REST verbs.

### Task 4.2 — Open a month (income → envelope snapshot)
- **Files:** `server/src/routes/months.ts`, `server/src/services/openMonth.ts`.
- **Deliverable:** `POST /api/months` `{ period, income }` creates a `Month` (status `open`), and one `MonthEnvelope` per envelope with `allocated = envelopeBudget(percent, income)`, `carriedIn = 0`. Income prefills from previous month if omitted. Unique per user+period.
- **Verify:** Integration test: open Feb with income 35000 → MonthEnvelopes allocate 17500/8750/8750/0.
- **Commit:** `feat(api): open month with envelope snapshot`
- **Coach:** why snapshot at open time (historical accuracy if percents change later), unique constraints, using the domain fn from the API.

### Task 4.3 — Get month detail (computed)
- **Files:** Modify `server/src/routes/months.ts`.
- **Deliverable:** `GET /api/months/:period` returns income, status, and per-envelope `{ budget, spent, left }` where `spent = Σ transactions`, `budget = allocated + carriedIn`, `left = budget − spent`. `GET /api/months` lists all.
- **Verify:** Integration test: with transactions summing 17330 in Needs, `left` = 170.
- **Commit:** `feat(api): month detail with computed spent/left`
- **Coach:** computing derived values in a query (aggregation), keeping the wire shape close to what the UI renders.

---

## Phase 5 — API: transactions

### Task 5.1 — Transactions CRUD
- **Files:** `server/src/routes/transactions.ts`, Zod schemas.
- **Deliverable:** `POST /api/transactions` `{ monthId, envelopeId, amount, note?, occurredOn }`, plus `PATCH`, `DELETE`, and `GET /api/months/:period/envelopes/:id/transactions`. Rejects writes to a `closed` month. `note` free-text (holds "3/9"). `occurredOn` may back-date within reason.
- **Verify:** Integration test: add 250 to Wants → month detail `spent` rises 250, `left` drops 250; deleting reverses it; writing to a closed month → 409.
- **Commit:** `feat(api): transactions CRUD`
- **Coach:** guarding invariants at the API (closed months are read-only), ownership checks on nested resources, why `left` is never stored.

---

## Phase 6 — API: savings

### Task 6.1 — Savings accounts CRUD
- **Files:** `server/src/routes/savingsAccounts.ts`.
- **Deliverable:** `GET/POST/PATCH/DELETE /api/savings-accounts` with `name`, `splitPercent`, `openingBalance`, `sort`. `GET` includes computed `balance = accountBalance(opening, contributions)`.
- **Verify:** Integration test: MP2 opening 14000 + one 3500 contribution → balance 17500.
- **Commit:** `feat(api): savings accounts with computed balance`
- **Coach:** reusing the domain balance fn, computed fields on read.

### Task 6.2 — Savings contributions
- **Files:** `server/src/routes/savingsContributions.ts`.
- **Deliverable:** `POST /api/savings-contributions` `{ monthId, accountId, amount, source }` (`planned`|`leftover`); `GET` list by month/account. Optional helper `POST /api/months/:id/plan-savings` that uses `splitSavings` to create the planned contributions for the month.
- **Verify:** Integration test: plan-savings on a month with savings budget 8750 and accounts 40/60 → creates 3500 + 5250 `planned` contributions.
- **Commit:** `feat(api): savings contributions + auto-split planned`
- **Coach:** two contribution sources modeled by one enum, wiring `splitSavings` into an endpoint.

---

## Phase 7 — API: month close, prediction, history

### Task 7.1 — Close month
- **Files:** `server/src/routes/months.ts`, `server/src/services/closeMonth.ts`.
- **Deliverable:** `POST /api/months/:id/close` with per-envelope leftover decisions: `carryToMisc` (adds to next month's Misc `carriedIn`) or `moveToSavings(accountId)` (creates a `leftover` contribution). Sets status `closed`. Opens/prepares next month with income prefilled. Idempotent-safe.
- **Verify:** Integration test: close Feb with Wants 575 → carryToMisc makes March Misc `carriedIn` include 575; moveToSavings makes a 575 leftover contribution and raises the account balance.
- **Commit:** `feat(api): close month with manual leftover decisions`
- **Coach:** modeling a manual business decision as an endpoint payload, cross-month effects, keeping it re-runnable safely.

### Task 7.2 — Prediction endpoint
- **Files:** `server/src/routes/prediction.ts`.
- **Deliverable:** `GET /api/prediction?date=YYYY-MM-DD` (default year-end) returns per-account and total projected balance = `projectBalance(currentBalance, monthlySetAside, monthsBetween(now, date))`, where `monthlySetAside` is each account's share of the savings envelope.
- **Verify:** Integration test with fixed clock: current 43750 total, 8750/mo, 5 months → 87500.
- **Commit:** `feat(api): savings prediction endpoint`
- **Coach:** injecting "now" so time-based logic is testable, composing the domain fns.

### Task 7.3 — History / summary
- **Files:** `server/src/routes/summary.ts`.
- **Deliverable:** `GET /api/summary` returns, per closed month, total saved and per-envelope `{ budget, spent, left }`.
- **Verify:** Integration test: one closed month returns its saved total and envelope breakdown.
- **Commit:** `feat(api): monthly summary/history`
- **Coach:** aggregating across months, shaping data for a history view.

---

## Phase 8 — Frontend foundation

FE is terse from here — build, minimal narration.

### Task 8.1 — API client + auth flow
- **Files:** `client/src/lib/api.ts`, `client/src/lib/queries.ts`, `client/src/auth/*`, route guard.
- **Deliverable:** fetch wrapper with `credentials:'include'`; React Query hooks; "Sign in with Google" → `/auth/signin`; `useSession`; protected routes redirect to login.
- **Verify:** Login round-trips; protected route blocks when logged out; session persists on refresh.
- **Commit:** `feat(client): api client + google auth flow`

### Task 8.2 — App shell + PWA
- **Files:** `client/src/App.tsx`, router, `vite-plugin-pwa` config, manifest, icons.
- **Deliverable:** mobile-first shell with bottom nav (This Month · Savings · History · Settings); installable PWA (manifest + service worker via plugin).
- **Verify:** Lighthouse "installable" passes; "Add to Home Screen" works on a phone.
- **Commit:** `feat(client): app shell + installable pwa`

---

## Phase 9 — Frontend screens

Each: build the screen against its API, wire React Query, verify against the real endpoint. One commit each.

- [ ] **Task 9.1 — This Month (home):** income header + envelope cards (budget/spent/left), quick-add button. → `feat(client): this-month screen`
- [ ] **Task 9.2 — Add Transaction:** envelope, amount, note, date (default today); savings envelope → account + planned/leftover. → `feat(client): add-transaction`
- [ ] **Task 9.3 — Envelope Detail:** transaction list, edit/delete/back-date. → `feat(client): envelope detail`
- [ ] **Task 9.4 — Savings:** accounts, balances, contribution history. → `feat(client): savings screen`
- [ ] **Task 9.5 — Close Month:** per-envelope leftover decision (carry to Misc / move to savings / leave), confirm → next month opens. → `feat(client): close-month flow`
- [ ] **Task 9.6 — Prediction:** date picker (default year-end), projected total + per-account. → `feat(client): prediction screen`
- [ ] **Task 9.7 — History/Summary:** past months, saved per month, envelope breakdown. → `feat(client): history screen`
- [ ] **Task 9.8 — Settings:** envelope %, savings accounts & splits, default income. → `feat(client): settings screen`

---

## Phase 10 — Deploy

### Task 10.1 — Deploy API + DB
- **Deliverable:** Express on Render (build/start scripts, env vars, `prisma migrate deploy` on release); Neon as prod DB; prod Google redirect URI added.
- **Verify:** Prod `/health` responds; login works against prod.
- **Commit:** `chore: deploy api to render + neon`
- **Coach:** env promotion, running migrations on deploy, prod vs dev OAuth redirect URIs.

### Task 10.2 — Deploy client + end-to-end
- **Deliverable:** Client on Vercel; API base URL env; verify cross-origin cookies work in prod; install PWA on your phone and log a real expense end-to-end.
- **Verify:** Full flow on the phone: login → add expense → see it on laptop with same account.
- **Commit:** `chore: deploy client to vercel + e2e verify`

---

## Self-review (coverage against scope)

- Envelopes/%/budget → 1.2, 1.3, 4.1, 4.2. ✓
- Savings accounts/split/balance → 1.2, 3.2, 3.3, 6.1, 6.2. ✓
- Monthly cycle + snapshot → 4.2, 4.3. ✓
- Transactions (back-date, notes/installments) → 5.1. ✓
- Month-close manual leftover decision → 7.1. ✓
- Prediction → 3.4, 7.2. ✓
- History/summary → 7.3, 9.7. ✓
- Google auth + per-user scoping → Phase 2, all `/api`. ✓
- PWA install + same-data-cross-device → 8.2, 10.2. ✓
- Deferred (offline/AI/import) → intentionally absent. ✓
