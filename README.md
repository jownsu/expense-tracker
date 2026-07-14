# Expense Tracker

Personal expense tracker (v1 / MVP) — percentage budget envelopes, savings accounts with
running balances, and a savings prediction. Installable PWA backed by a hand-built
Express/Prisma API.

See [`project-scope.md`](./project-scope.md), [`tech-stack.md`](./tech-stack.md), and
[`implementation-plan.md`](./implementation-plan.md).

## Layout

```
client/   React + Vite + Tailwind + shadcn/ui PWA (SPA)
server/   Express + Prisma + Postgres API
```

## Getting started

Each app has its own `package.json`. From each folder: `npm install`, then `npm run dev`.

- `server/` needs a Postgres `DATABASE_URL` (Neon) and Google OAuth + Auth.js env vars —
  see `server/.env.example`.
- `client/` needs the API base URL — see `client/.env.example`.

## Tech

React · Vite · Tailwind · shadcn/ui · TanStack React Query · Express · Prisma · Postgres
(Neon) · Auth.js · Zod · Vitest · TypeScript.
