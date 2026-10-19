import { execSync } from "node:child_process";
import { defineConfig } from "vitest/config";

// DB-backed tests (e.g. seedUser.test.ts) run against the test DB, never dev data.
process.loadEnvFile(".env");
const testDb = process.env["TEST_DATABASE_URL"];
if (!testDb || testDb === process.env["DATABASE_URL"]) {
  throw new Error("Set TEST_DATABASE_URL in server/.env to a separate database");
}

// Apply pending migrations (non-destructive) so the schema exists even before the first e2e run.
execSync("npx prisma migrate deploy", { env: { ...process.env, DATABASE_URL: testDb }, stdio: "ignore" });

export default defineConfig({
  test: { env: { DATABASE_URL: testDb } },
});
