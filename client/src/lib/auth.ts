import { createAuthClient } from "better-auth/react";

// baseURL is the API origin; the client appends /api/auth itself.
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
});
