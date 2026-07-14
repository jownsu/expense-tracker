# Tech Stack

The stack for the expense tracker (v1 / MVP). Companion to `project-scope.md`.

---

## How to work with me on this

- **Backend — coach me.** Learning the BE side is a goal of this project. While building
  anything server-side (Express, Prisma, auth, sessions, SQL), don't just hand me code:
  explain the *why*, the concepts, the tradeoffs, and go step by step. Point out what I'm
  learning and where the foot-guns are.
- **Frontend — just build.** I'm already comfortable with React. Keep FE explanation
  minimal; no need to walk me through hooks, components, or React Query basics.

---

## Frontend

I know this side already — listed for completeness, no deep explanation needed.

- **React + Vite** — SPA.
- **Tailwind CSS** — styling.
- **shadcn/ui** — component library (copy-in components, Radix + Tailwind under the hood).
  Works with Vite via the shadcn CLI.
- **TanStack React Query** — server-state: fetching, caching, and syncing with the Express
  API.
- **PWA** — installable, mobile-first, via `vite-plugin-pwa`.
- **Deploy** — static hosting on Vercel or Netlify.

---

## Backend

Express + Postgres + **Prisma** (ORM + migrations). This is the side to teach as we go.

- **Validation** — Zod on request bodies.
- **Authorization** — every query scoped to the authenticated user's id in the API layer
  (no row-level security; enforced in application code).
- **AI secrets** (v2) live on the Express server, never the client.
- **Structure** — one repo: `client/` (React) + `server/` (Express), separate
  `package.json` each.

---

## Auth — decision

You asked whether `next-auth` or Auth.js fits. Findings:

| Option | Verdict |
|---|---|
| **`next-auth`** | ❌ No. It's coupled to Next.js (its API routes/server). We dropped Next, so it doesn't apply. |
| **Auth.js (`@auth/express`)** | ✅ Works. Auth.js is the framework-agnostic evolution of NextAuth and ships an official Express integration + a Prisma adapter + Google provider. Less code — but it *handles the OAuth/session mechanics for you*, and the Express integration has thinner docs than the Next one. |
| **Hand-rolled** | ✅ Most learning. Google Identity Services on the client → verify the ID token server-side with `google-auth-library` → issue a signed **httpOnly** cookie session (JWT via a vetted lib like `jose`). You learn token verification, sessions, cookies, and auth middleware first-hand. |

**Decision: Auth.js (`@auth/express`)** with the Google provider and the
`@auth/prisma-adapter`. Chosen to ship auth quickly and spend the learning budget on the
API/DB layer.

What it brings in:
- Adds Auth.js's own Prisma models — `User`, `Account`, `Session`, `VerificationToken` — to
  the schema. Our app models (`envelopes`, `months`, …) FK to `User.id` as the owner.
- Env: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.

Still worth understanding — and since it's backend, I'll coach it: how the adapter persists
sessions, how to protect routes with the session, and the **cross-origin cookie** gotcha.
The client (Vercel) and API (Render) live on different domains, so session cookies need
`sameSite=none` + `secure`, and CORS must be set up with credentials. That's the trickiest
part of this integration and where most people get stuck.

---

## Hosting

| Piece | Where | Note |
|---|---|---|
| Frontend (static PWA) | Vercel / Netlify | Free, always warm. |
| Express API | Render (free) | Spins down when idle → ~30–50s cold start on first open. Fine for personal use. |
| Postgres | Neon (free) | Durable free tier (doesn't expire like Render's own Postgres). |

Two-origin setup (client and API on different domains) → we'll deal with **CORS** and
cookie `SameSite`/`secure` settings. Good things to learn; I'll explain when we hit them.

---

## What you'll learn on the BE (the curriculum wrapped in this app)

REST API design · Prisma schema modeling, relations & migrations · the Google OAuth flow ·
sessions/JWT & httpOnly cookies · auth middleware · request validation · scoping queries to
a user · CORS & cross-origin cookies · deploying a Node service + managed Postgres.
