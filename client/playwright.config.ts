import { defineConfig, devices } from '@playwright/test'

// TEST_DATABASE_URL lives in server/.env next to DATABASE_URL.
process.loadEnvFile('../server/.env')
const testDb = process.env.TEST_DATABASE_URL
// The server command below wipes this DB, so refuse to run against the dev DB.
if (!testDb || testDb === process.env.DATABASE_URL) {
  throw new Error('Set TEST_DATABASE_URL in server/.env to a separate database')
}

// Own ports so e2e never reuses (or collides with) the dev servers on 4000/5173.
const API_PORT = 4001
const WEB_PORT = 5174
export const API_URL = `http://localhost:${API_PORT}`
export const WEB_URL = `http://localhost:${WEB_PORT}`
// Session saved by e2e/auth.setup.ts; every browser test starts logged in.
export const AUTH_FILE = 'playwright/.auth/user.json'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: WEB_URL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      // A logged-out test opts out with test.use({ storageState: { cookies: [], origins: [] } })
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      // Fresh schema every run: reset (creates the DB if missing) then start the API.
      command: 'npx prisma migrate reset --force && npx tsx src/index.ts',
      cwd: '../server',
      url: `${API_URL}/health`,
      env: {
        DATABASE_URL: testDb,
        PORT: String(API_PORT),
        BETTER_AUTH_URL: API_URL,
        CLIENT_ORIGIN: WEB_URL,
        // Enables email/password sign-in for auth.setup.ts (see server/src/auth.ts).
        E2E: 'true',
      },
      timeout: 60_000,
    },
    {
      command: `npm run dev -- --port ${WEB_PORT} --strictPort`,
      url: WEB_URL,
      env: { VITE_API_URL: API_URL },
    },
  ],
})
