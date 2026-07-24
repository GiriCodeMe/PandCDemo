import { test, expect, type Page } from '@playwright/test';

/** Switch to a persona by clicking the global nav PersonaSwitcher and choosing by role text. */
async function selectPersona(page: Page, role: string) {
  await page.getByTestId('persona-switcher').click();
  await page.locator('[role="option"]').filter({ hasText: role }).click();
  // Allow login API + store update to settle
  await page.waitForTimeout(300);
}

test.describe('Enrollment Hub — Persona Views', () => {
  test('defaults to Benefits Admin view on first load', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByRole('heading', { name: 'Enrollment', exact: true })).toBeVisible();
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
  });

  test('only one persona switcher exists (global nav only)', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId('persona-switcher')).toHaveCount(1);
    await expect(page.getByTestId('enrollment-persona-select')).toHaveCount(0);
  });

  test('switch to Employee shows employee enrollment view', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'Employee');
    await expect(page.getByTestId('enrollment-employee-view')).toBeVisible({ timeout: 6000 });
  });

  test('employee view shows waiting period banner', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'Employee');
    await expect(page.getByTestId('employee-waiting-period-banner')).toBeVisible({ timeout: 6000 });
  });

  test('employee view has My Benefits, Open Enrollment, Compare Plans tabs', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'Employee');
    await expect(page.getByTestId('employee-enrollment-tabs')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('My Benefits', { exact: true })).toBeVisible();
    await expect(page.getByText('Open Enrollment', { exact: true })).toBeVisible();
    await expect(page.getByText('Compare Plans', { exact: true })).toBeVisible();
  });

  test('switch to HR Administrator shows work queue', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'HR Administrator');
    await expect(page.getByTestId('enrollment-hr-view')).toBeVisible({ timeout: 6000 });
  });

  test('HR Admin view shows pending enrollments section', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'HR Administrator');
    await expect(page.getByTestId('hr-pending-count')).toBeVisible({ timeout: 6000 });
  });

  test('HR Admin view shows eligibility exceptions list', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'HR Administrator');
    await expect(page.getByTestId('hr-exceptions-list')).toBeVisible({ timeout: 6000 });
  });

  test('HR Admin view contains ACM-E012 (Linda White) exception row', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'HR Administrator');
    await expect(page.getByTestId('hr-exception-row-ACM-E012')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('Carrier rejection blocking enrollment')).toBeVisible();
  });

  test('switch to Payroll Administrator shows payroll view with stats', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'Payroll Administrator');
    await expect(page.getByTestId('enrollment-payroll-view')).toBeVisible({ timeout: 6000 });
    await expect(page.getByTestId('payroll-stats')).toBeVisible({ timeout: 6000 });
  });

  test('payroll view shows reconciliation table', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'Payroll Administrator');
    await expect(page.getByTestId('payroll-reconciliation-table')).toBeVisible({ timeout: 6000 });
  });

  test('switch to Carrier Administrator shows carrier summary table', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'Carrier Administrator');
    await expect(page.getByTestId('enrollment-carrier-view')).toBeVisible({ timeout: 6000 });
    await expect(page.getByTestId('carrier-summary-table')).toBeVisible({ timeout: 6000 });
  });

  test('carrier view shows failed transactions with CT-10045', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'Carrier Administrator');
    await expect(page.getByTestId('enrollment-carrier-view')).toBeVisible({ timeout: 6000 });
    await page.getByText('Failed Transactions').click();
    await expect(page.getByTestId('carrier-tx-CT-10045')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('DEP-INVALID-ID')).toBeVisible();
  });

  test('switch to Employer/Group Admin shows executive KPI grid', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'Employer/Group Admin');
    await expect(page.getByTestId('enrollment-executive-view')).toBeVisible({ timeout: 6000 });
    await expect(page.getByTestId('executive-kpi-grid')).toBeVisible({ timeout: 6000 });
  });

  test('executive view shows enrollment rate KPI', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'Employer/Group Admin');
    await expect(page.getByTestId('executive-enrollment-rate')).toBeVisible({ timeout: 6000 });
  });

  test('switch to Benefits Analyst shows compliance audit table', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'Benefits Analyst');
    await expect(page.getByTestId('enrollment-compliance-view')).toBeVisible({ timeout: 6000 });
    await expect(page.getByTestId('compliance-audit-table')).toBeVisible({ timeout: 6000 });
  });

  test('compliance view contains ACM-E012 (Linda White) row', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'Benefits Analyst');
    await expect(page.getByTestId('compliance-row-ACM-E012')).toBeVisible({ timeout: 6000 });
  });

  test('compliance view expands Linda White evidence trail', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await selectPersona(page, 'Benefits Analyst');
    await expect(page.getByTestId('compliance-row-ACM-E012')).toBeVisible({ timeout: 6000 });
    await page.getByTestId('compliance-row-ACM-E012').click();
    await expect(page.getByTestId('compliance-detail-panel')).toBeVisible({ timeout: 6000 });
    await expect(page.getByText('Carrier enrollment accepted')).toBeVisible();
  });

  test('BenChat shows enrollment context', async ({ page }) => {
    await page.goto('/enrollment');
    await expect(page.getByTestId('enrollment-benefits-admin-view')).toBeVisible({ timeout: 8000 });
    await page.getByRole('button', { name: 'Open BenChat assistant' }).click();
    const dialog = page.getByRole('dialog', { name: 'BenChat assistant' });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText('Open Enrollment').first()).toBeVisible();
  });
});
