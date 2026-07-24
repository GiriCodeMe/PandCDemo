import { test, expect } from '@playwright/test';

test.describe('Plans Hub', () => {
  test('loads Plan Configuration page', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.getByRole('heading', { name: 'Plan Configuration' })).toBeVisible();
    await expect(page.getByText('Products offered', { exact: true })).toBeVisible();
    await expect(page.getByText('Plans configured', { exact: true })).toBeVisible();
  });

  test('shows configuration checklist', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.getByText('Configuration Checklist', { exact: true })).toBeVisible();
    await expect(page.getByText('Products defined', { exact: true })).toBeVisible();
    await expect(page.getByText('Eligibility rules set', { exact: true })).toBeVisible();
  });

  test('shows open enrollment status', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.getByText('Open Enrollment Period', { exact: true })).toBeVisible();
    await expect(page.getByText('Acme Corp 2027 Open Enrollment')).toBeVisible();
  });

  test('shows configured products grid', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.getByText('Configured Products — Plan Year 2027')).toBeVisible();
    await expect(page.getByText('Medical').first()).toBeVisible();
  });

  test('publish configuration button exists', async ({ page }) => {
    await page.goto('/plans');
    await expect(page.getByRole('button', { name: 'Publish Configuration' })).toBeVisible();
  });

  test('can publish configuration', async ({ page }) => {
    await page.goto('/plans');
    await page.getByRole('button', { name: 'Publish Configuration' }).click();
    // Mock publish returns a "published" message
    await expect(page.getByText(/Plan configuration published/i)).toBeVisible({ timeout: 5000 });
  });

  test('can switch to Eligibility Rules view', async ({ page }) => {
    await page.goto('/plans');
    // Use testid to target the switcher button specifically
    await page.getByTestId('plans-view-eligibility').click();
    await expect(page.getByText('Eligibility rules', { exact: true })).toBeVisible();
    await expect(page.getByText('Conflicting rules', { exact: true })).toBeVisible();
  });

  test('eligibility rules show conflict badges', async ({ page }) => {
    await page.goto('/plans');
    await page.getByTestId('plans-view-eligibility').click();
    await expect(page.getByText('CONFLICT').first()).toBeVisible({ timeout: 5000 });
  });

  test('can expand eligibility rule for details', async ({ page }) => {
    await page.goto('/plans');
    await page.getByTestId('plans-view-eligibility').click();
    await page.getByText('Medical Eligibility — Full-Time 30+ Hours').first().click();
    await expect(page.getByText(/Full-time employees/)).toBeVisible();
  });

  test('can view dependent rules tab', async ({ page }) => {
    await page.goto('/plans');
    await page.getByTestId('plans-view-eligibility').click();
    // Switch to the Dependent Rules tab inside EligibilityRules
    await page.getByRole('button', { name: 'Dependent Rules', exact: true }).click();
    await expect(page.getByText('Spouse', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('DR-001', { exact: true })).toBeVisible();
  });
});
