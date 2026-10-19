# Expense Tracker

Two apps: `client/` (React + Vite SPA) and `server/` (Express + Prisma + Postgres, Better Auth with Google login). Scripts live in each app's `package.json`. Work follows `implementation-plan.md`; read the relevant task card before starting a task.

## Invariants

- **Money is integer whole pesos (₱).** Store as `Int`; multiply before dividing, then `Math.round` (see `server/src/domain/envelope.ts`).
- **Scope every query to the user.** Protected routes use `requireAuth`, which puts the session user on `res.locals.user`; filter every Prisma query by that user's id.
- Money logic belongs in pure functions in `server/src/domain/`, each with a Vitest test beside it.

## Databases

- `DATABASE_URL` is the dev DB. `TEST_DATABASE_URL` (in `server/.env`) is `expense_tracker_test`, which the Playwright run wipes with `prisma migrate reset`. Point every destructive command at the test DB.
- Tests inject env vars instead of editing `.env`: `dotenv/config` keeps a value that is already set, so `DATABASE_URL=… <cmd>` wins.
- Playwright (`client/playwright.config.ts`) starts its own API on :4001 and Vite on :5174 so it never touches the dev servers on :4000/:5173.

## Git

- Base branch is `develop`; work happens on feature branches (e.g. `build/mvp`). Stay on the branch the user is on.
- Conventional commits with a scope: `feat(server): …`, `fix(domain): …`, `chore(client): …`.
