import { test, expect } from '@playwright/test';

test.describe('Employer Directory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/employers');
  });

  test('shows employer list page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /employers/i })).toBeVisible({ timeout: 10000 });
  });

  test('shows Acme Corporation card', async ({ page }) => {
    // Use heading role to avoid matching context-switcher span
    await expect(page.getByRole('heading', { name: 'Acme Corporation' })).toBeVisible({ timeout: 10000 });
  });

  test('clicking employer navigates to detail', async ({ page }) => {
    await page.getByRole('heading', { name: 'Acme Corporation' }).click();
    await expect(page).toHaveURL(/\/employers\/ACM-001/);
    // On detail page the employer name is an h1
    await expect(page.getByRole('heading', { name: /Acme Corporation/i }).first()).toBeVisible();
  });
});
