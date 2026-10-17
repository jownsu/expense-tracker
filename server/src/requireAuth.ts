import type { RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.js";

// Reads the session cookie via Better Auth. No session → 401; otherwise the
// user is put on res.locals.user for the route handler to scope queries by.
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.locals.user = session.user;
    next();
  } catch (err) {
    // Express 4 doesn't catch async errors — forward so the request doesn't hang.
    next(err);
  }
};
