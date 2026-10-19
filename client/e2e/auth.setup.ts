import { test as setup, expect } from '@playwright/test'
import { API_URL, AUTH_FILE, WEB_URL } from '../playwright.config.ts'

// Runs once before the browser tests: signs in a test user through the
// E2E-only email/password auth and saves the session cookie for every test.
setup('authenticate', async ({ request }) => {
  const user = { name: 'E2E User', email: 'e2e@example.test', password: 'e2e-password-123' }
  // Better Auth checks Origin against trustedOrigins (CSRF).
  const headers = { Origin: WEB_URL }

  // Fresh DB each run, so sign-up normally works; sign-in covers a retried setup.
  let res = await request.post(`${API_URL}/api/auth/sign-up/email`, { data: user, headers })
  if (!res.ok()) {
    res = await request.post(`${API_URL}/api/auth/sign-in/email`, {
      data: { email: user.email, password: user.password },
      headers,
    })
  }
  expect(res.ok()).toBeTruthy()

  // Prove the cookie works on a protected route before saving it.
  expect((await request.get(`${API_URL}/api/test`)).status()).toBe(200)
  await request.storageState({ path: AUTH_FILE })
})
