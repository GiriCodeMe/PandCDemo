import { test, expect } from '@playwright/test';

test.describe('Global Search (Ctrl+K)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await expect(page.getByText('Group Benefits')).toBeVisible({ timeout: 10000 });
  });

  test('Ctrl+K opens search modal', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible({ timeout: 5000 });
  });

  test('Escape closes search modal', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByPlaceholder(/search/i)).not.toBeVisible();
  });

  test('typing in search shows results', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.getByPlaceholder(/search/i).fill('acme');
    // Wait for results (API call)
    await page.waitForTimeout(500);
    await expect(page.getByText(/Acme/i).first()).toBeVisible({ timeout: 5000 });
  });
});
