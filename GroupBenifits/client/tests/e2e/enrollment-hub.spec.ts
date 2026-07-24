import { test, expect } from '@playwright/test';

test.describe('Enrollment Hub', () => {
  test('loads Enrollment Overview page', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByRole('heading', { name: 'Enrollment', exact: true })).toBeVisible();
    await expect(page.getByTestId('enrollment-view-switcher')).toBeVisible();
  });

  test('shows open enrollment period banner', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByText('Acme Corp 2027 Open Enrollment')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('OPEN', { exact: true })).toBeVisible();
  });

  test('shows enrollment progress stats', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByText('Enrollment Progress', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Submitted', { exact: true })).toBeVisible();
    await expect(page.getByText('In Progress', { exact: true })).toBeVisible();
    await expect(page.getByText('Not Started', { exact: true })).toBeVisible();
  });

  test('shows enrollment timeline', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByText('Enrollment Timeline', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Plan configuration published', { exact: true })).toBeVisible();
    await expect(page.getByText('Coverage effective date', { exact: true })).toBeVisible();
  });

  test('can switch to My Benefits view', async ({ page }) => {
    await page.goto('/enrollment');
    await page.getByTestId('enrollment-view-my-benefits').click();
    await expect(page.getByText('My Benefits', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Benefits Active for Plan Year 2027')).toBeVisible({ timeout: 5000 });
  });

  test('shows premium summary in My Benefits', async ({ page }) => {
    await page.goto('/enrollment');
    await page.getByTestId('enrollment-view-my-benefits').click();
    await expect(page.getByText('Your monthly cost', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Employer contribution', { exact: true })).toBeVisible();
    await expect(page.getByText('Per paycheck (26/yr)', { exact: true })).toBeVisible();
  });

  test('shows elections in My Benefits', async ({ page }) => {
    await page.goto('/enrollment');
    await page.getByTestId('enrollment-view-my-benefits').click();
    await expect(page.getByText('Your Elections', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Medical', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Dental', { exact: true }).first()).toBeVisible();
  });

  test('can switch to Compare Plans view', async ({ page }) => {
    await page.goto('/enrollment');
    await page.getByTestId('enrollment-view-comparison').click();
    await expect(page.getByText('Medical Plan Comparison', { exact: true })).toBeVisible();
  });

  test('plan comparison shows three medical plans', async ({ page }) => {
    await page.goto('/enrollment');
    await page.getByTestId('enrollment-view-comparison').click();
    await expect(page.getByText('PPO 500')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('PPO 1000')).toBeVisible();
    await expect(page.getByText('HDHP 3000')).toBeVisible();
  });

  test('plan comparison shows features table', async ({ page }) => {
    await page.goto('/enrollment');
    await page.getByTestId('enrollment-view-comparison').click();
    await expect(page.getByText('Annual Deductible', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('HSA Eligible', { exact: true })).toBeVisible();
  });

  test('can open enrollment wizard', async ({ page }) => {
    await page.goto('/enrollment');
    await page.getByRole('button', { name: 'Enroll Now' }).click();
    await expect(page.getByRole('heading', { name: 'Open Enrollment Wizard' })).toBeVisible();
    // Wait for wizard to initialize (API calls: plans + start session)
    await expect(page.getByText(/Step 1 of 8/)).toBeVisible({ timeout: 10000 });
  });

  test('enrollment wizard shows step 1 welcome content', async ({ page }) => {
    await page.goto('/enrollment');
    await page.getByRole('button', { name: 'Enroll Now' }).click();
    await expect(page.getByText(/Step 1 of 8/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Acme Corp 2027 Open Enrollment')).toBeVisible({ timeout: 5000 });
  });

  test('enrollment wizard can advance to step 2', async ({ page }) => {
    await page.goto('/enrollment');
    await page.getByRole('button', { name: 'Enroll Now' }).click();
    await expect(page.getByText(/Step 1 of 8/)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /Continue to Medical/i }).click();
    await expect(page.getByText(/Step 2 of 8/)).toBeVisible({ timeout: 5000 });
  });

  test('enrollment wizard step 2 shows medical plans', async ({ page }) => {
    await page.goto('/enrollment');
    await page.getByRole('button', { name: 'Enroll Now' }).click();
    await expect(page.getByText(/Step 1 of 8/)).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /Continue to Medical/i }).click();
    await expect(page.getByText('PPO 500')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('HDHP 3000')).toBeVisible();
    await expect(page.getByText('Waive Coverage', { exact: true }).first()).toBeVisible();
  });

  test('BenChat shows enrollment context', async ({ page }) => {
    await page.goto('/enrollment');
    await page.getByRole('button', { name: 'Open BenChat assistant' }).click();
    const dialog = page.getByRole('dialog', { name: 'BenChat assistant' });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText('Open Enrollment').first()).toBeVisible();
  });
});
