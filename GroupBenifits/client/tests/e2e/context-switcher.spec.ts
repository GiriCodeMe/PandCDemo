import { test, expect } from '@playwright/test';

test.describe('Context Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows Acme Corporation in context bar', async ({ page }) => {
    await expect(page.getByText(/Acme Corporation/i)).toBeVisible({ timeout: 10000 });
  });

  test('shows plan year in context bar', async ({ page }) => {
    await expect(page.getByText(/2027|Plan Year/i).first()).toBeVisible({ timeout: 10000 });
  });
});
