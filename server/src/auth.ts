import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.js";

// E2E=true (set only by client/playwright.config.ts) turns on email/password so
// tests can sign in without Google. Refuse to boot if it ever reaches production.
const e2e = process.env["E2E"] === "true";
if (e2e && process.env["NODE_ENV"] === "production") {
  throw new Error("E2E auth must never be enabled in production");
}

// Better Auth reads BETTER_AUTH_SECRET and BETTER_AUTH_URL from env automatically.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: e2e },
  socialProviders: {
    google: {
      clientId: process.env["GOOGLE_CLIENT_ID"] as string,
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"] as string,
    },
  },
  // The SPA lives on a different origin — allow it for CSRF + post-login redirects.
  trustedOrigins: [process.env["CLIENT_ORIGIN"] ?? "http://localhost:5173"],
});
