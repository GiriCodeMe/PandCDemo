const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

const SERVER_DIR = path.resolve(__dirname, '../server');
const CLIENT_DIR = path.resolve(__dirname, '../client');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'on-failure', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'node index.js',
      url: 'http://localhost:3001/api/health',
      cwd: SERVER_DIR,
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
    },
    {
      command: 'npm run dev -- --port 5173',
      url: 'http://localhost:5173',
      cwd: CLIENT_DIR,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
