import express from "express";
import cors from "cors";

export const app = express();

// Allow the React client (a different origin) to call this API, with cookies.
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
app.use(cors({ origin: clientOrigin, credentials: true }));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/ping", (_req, res) => {
  res.json({ message: "pong", service: "expense-tracker-api" });
});
