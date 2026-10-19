# Expense Tracker

Two apps: `client/` (React + Vite SPA) and `server/` (Express + Prisma + Postgres, Better Auth with Google login). Scripts live in each app's `package.json`. Work follows `implementation-plan.md`; read the relevant task card before starting a task.

## Invariants

- **Money is integer whole pesos (₱).** Store as `Int`; multiply before dividing, then `Math.round` (see `server/src/domain/envelope.ts`).
- **Scope every query to the user.** Protected routes use `requireAuth`, which puts the session user on `res.locals.user`; filter every Prisma query by that user's id.
- Money logic belongs in pure functions in `server/src/domain/`, each with a Vitest test beside it.

## Databases

- `DATABASE_URL` is the dev DB. `TEST_DATABASE_URL` (in `server/.env`) is `expense_tracker_test`, used by Vitest and Playwright, and wiped by every e2e run. Point every destructive command at the test DB. E2E test details live in the `e2e-test-writer` agent.

## Git

- Base branch is `develop`; work happens on feature branches (e.g. `build/mvp`). Stay on the branch the user is on.
- Conventional commits with a scope: `feat(server): …`, `fix(domain): …`, `chore(client): …`.
