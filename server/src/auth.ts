import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db.js";

// Better Auth reads BETTER_AUTH_SECRET and BETTER_AUTH_URL from env automatically.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    google: {
      clientId: process.env["GOOGLE_CLIENT_ID"] as string,
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"] as string,
    },
  },
  // The SPA lives on a different origin — allow it for CSRF + post-login redirects.
  trustedOrigins: [process.env["CLIENT_ORIGIN"] ?? "http://localhost:5173"],
});
