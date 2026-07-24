import { test, expect } from '@playwright/test';

test.describe('Health check', () => {
  test('app loads and shows Group Benefits title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Group Benefits/i);
  });

  test('navigation bar is visible', async ({ page }) => {
    await page.goto('/');
    // The nav bar contains the app name
    await expect(page.getByText('Group Benefits')).toBeVisible({ timeout: 10000 });
  });
});
