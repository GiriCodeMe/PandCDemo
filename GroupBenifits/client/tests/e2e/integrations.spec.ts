import { test, expect } from '@playwright/test';

test.describe('Integrations Hub', () => {
  test('loads Integrations page with heading', async ({ page }) => {
    await page.goto('/integrations');
    await expect(page.getByRole('heading', { name: 'Integrations', exact: true })).toBeVisible();
    await expect(page.getByTestId('integrations-view-switcher')).toBeVisible();
  });

  test('shows stats row', async ({ page }) => {
    await page.goto('/integrations');
    await expect(page.getByTestId('integrations-stats')).toBeVisible({ timeout: 5000 });
    const stats = page.getByTestId('integrations-stats');
    await expect(stats.getByText('Carrier Success Rate', { exact: true })).toBeVisible();
    await expect(stats.getByText('Payroll Match Rate', { exact: true })).toBeVisible();
    // 'EDI Transactions' also appears in view switcher — scope to stat cards
    await expect(stats.getByText('EDI Transactions', { exact: true })).toBeVisible();
    await expect(stats.getByText('Open Exceptions', { exact: true })).toBeVisible();
  });

  test('overview shows carrier EDI status card', async ({ page }) => {
    await page.goto('/integrations');
    await expect(page.getByText('Carrier EDI Status', { exact: true })).toBeVisible({ timeout: 5000 });
  });

  test('overview shows payroll deductions card', async ({ page }) => {
    await page.goto('/integrations');
    // 'Payroll Deductions' also appears in view switcher — use heading role
    await expect(page.getByRole('heading', { name: 'Payroll Deductions', exact: true })).toBeVisible({ timeout: 5000 });
  });

  test('overview shows exceptions panel when exceptions exist', async ({ page }) => {
    await page.goto('/integrations');
    // CT-10045 is a rejection (DEP-INVALID-ID) and DED-10001 is a payroll mismatch
    await expect(page.getByTestId('exception-CT-10045')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('mismatch-DED-10001')).toBeVisible();
  });

  test('can navigate to Carrier Connections view', async ({ page }) => {
    await page.goto('/integrations');
    await page.getByTestId('integrations-view-carriers').click();
    await expect(page.getByTestId('carrier-list')).toBeVisible({ timeout: 5000 });
  });

  test('carrier connections shows all carriers', async ({ page }) => {
    await page.goto('/integrations');
    await page.getByTestId('integrations-view-carriers').click();
    await expect(page.getByTestId('carrier-list')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Aetna')).toBeVisible();
    await expect(page.getByText('Delta Dental')).toBeVisible();
    await expect(page.getByText('VSP')).toBeVisible();
  });

  test('can navigate to EDI Transactions view', async ({ page }) => {
    await page.goto('/integrations');
    await page.getByTestId('integrations-view-edi').click();
    await expect(page.getByTestId('carrier-transactions-list')).toBeVisible({ timeout: 5000 });
  });

  test('EDI transactions shows CT-10045 rejection', async ({ page }) => {
    await page.goto('/integrations');
    await page.getByTestId('integrations-view-edi').click();
    await expect(page.getByTestId('carrier-txn-CT-10045')).toBeVisible({ timeout: 5000 });
    // Scope 'Rejected' badge to that specific row (filter option is hidden)
    await expect(page.getByTestId('carrier-txn-CT-10045').getByText('Rejected')).toBeVisible();
  });

  test('can expand EDI transaction to see error details', async ({ page }) => {
    await page.goto('/integrations');
    await page.getByTestId('integrations-view-edi').click();
    await expect(page.getByTestId('carrier-txn-CT-10045')).toBeVisible({ timeout: 5000 });
    // Click to expand the rejection transaction
    await page.getByTestId('carrier-txn-CT-10045').click();
    await expect(page.getByText('DEP-INVALID-ID')).toBeVisible({ timeout: 3000 });
  });

  test('EDI status filter works', async ({ page }) => {
    await page.goto('/integrations');
    await page.getByTestId('integrations-view-edi').click();
    await expect(page.getByTestId('ct-status-filter')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('ct-status-filter').selectOption('Rejected');
    // After filtering, CT-10045 should still be visible (it's a Rejection)
    await expect(page.getByTestId('carrier-txn-CT-10045')).toBeVisible();
  });

  test('can navigate to Payroll Deductions view', async ({ page }) => {
    await page.goto('/integrations');
    await page.getByTestId('integrations-view-payroll').click();
    // Payroll query is lazy (enabled only when view='payroll') — allow extra time
    await expect(page.getByTestId('payroll-list')).toBeVisible({ timeout: 8000 });
  });

  test('payroll view shows DED-10001 mismatch', async ({ page }) => {
    await page.goto('/integrations');
    await page.getByTestId('integrations-view-payroll').click();
    await expect(page.getByTestId('payroll-row-DED-10001')).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId('payroll-row-DED-10001').getByText('Mismatch')).toBeVisible();
  });

  test('payroll filter can show only mismatches', async ({ page }) => {
    await page.goto('/integrations');
    await page.getByTestId('integrations-view-payroll').click();
    await expect(page.getByTestId('payroll-list')).toBeVisible({ timeout: 8000 });
    await page.getByTestId('payroll-status-filter').selectOption('Mismatch');
    await expect(page.getByTestId('payroll-row-DED-10001')).toBeVisible();
  });

  test('BenChat shows integrations context', async ({ page }) => {
    await page.goto('/integrations');
    await page.getByRole('button', { name: 'Open BenChat assistant' }).click();
    const dialog = page.getByRole('dialog', { name: 'BenChat assistant' });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText('Integrations').first()).toBeVisible();
  });
});
