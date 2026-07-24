import { test, expect } from '@playwright/test';

test.describe('Persona Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Group Benefits')).toBeVisible({ timeout: 10000 });
  });

  test('shows current persona name', async ({ page }) => {
    // Default persona P-001 is Alex Chen
    await expect(page.getByText(/Alex Chen/i)).toBeVisible({ timeout: 10000 });
  });

  test('clicking persona switcher opens dropdown', async ({ page }) => {
    await page.getByText(/Alex Chen/i).click();
    await expect(page.getByText(/Maria Torres/i)).toBeVisible({ timeout: 5000 });
  });

  test('switching persona updates the display', async ({ page }) => {
    await page.getByText(/Alex Chen/i).click();
    await page.getByText(/Maria Torres/i).click();
    // Wait for dropdown to close and confirm header shows new persona
    await expect(page.getByTestId('persona-switcher')).toContainText(/Maria Torres/i, { timeout: 5000 });
  });
});
