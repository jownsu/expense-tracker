import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { requireAuth } from "./requireAuth.js";

export const app = express();

// Allow the React client (a different origin) to call this API, with cookies.
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
app.use(cors({ origin: clientOrigin, credentials: true }));

// Better Auth owns /api/auth/* (signin, callback, session, signout).
// MUST come before express.json(): the body parser would consume the request
// stream and make auth requests hang.
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/ping", (_req, res) => {
  res.json({ message: "pong", service: "expense-tracker-api" });
});

// Example protected route — only reachable with a valid session cookie.
app.get("/api/test", requireAuth, (_req, res) => {
  res.json({ message: "you are logged in", user: res.locals.user });
});
