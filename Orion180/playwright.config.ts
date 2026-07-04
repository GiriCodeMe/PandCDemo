import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 1,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'node server/server.js',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: true,
      timeout: 10_000,
    },
    {
      command: 'cd client && npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
})
