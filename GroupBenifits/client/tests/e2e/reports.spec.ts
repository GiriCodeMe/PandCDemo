import { test, expect } from '@playwright/test';

test.describe('Reports Hub', () => {
  test('loads Reports page with heading', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Reports', exact: true })).toBeVisible();
    await expect(page.getByTestId('reports-view-switcher')).toBeVisible();
  });

  test('executive summary view loads KPIs', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByTestId('executive-summary')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('executive-kpis')).toBeVisible();
    // Should show 4 KPI cards
    const kpis = page.getByTestId('executive-kpis');
    await expect(kpis.getByText('Enrollment Rate', { exact: true })).toBeVisible();
    await expect(kpis.getByText('Monthly Cost', { exact: true })).toBeVisible();
    await expect(kpis.getByText('Carrier Success', { exact: true })).toBeVisible();
    await expect(kpis.getByText('Open Exceptions', { exact: true })).toBeVisible();
  });

  test('executive summary shows financial summary', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByTestId('financial-summary')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Total Monthly Cost', { exact: true })).toBeVisible();
    await expect(page.getByText('Projected Annual', { exact: true })).toBeVisible();
  });

  test('executive summary shows top issues', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByTestId('top-issues')).toBeVisible({ timeout: 5000 });
    // ISS-001 is carrier High severity issue
    await expect(page.getByTestId('issue-row-ISS-001')).toBeVisible();
    await expect(page.getByTestId('issue-row-ISS-003')).toBeVisible();
  });

  test('can navigate to Enrollment report', async ({ page }) => {
    await page.goto('/reports');
    await page.getByTestId('reports-view-enrollment').click();
    await expect(page.getByTestId('enrollment-report')).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId('enrollment-summary')).toBeVisible();
  });

  test('enrollment report shows by-employer breakdown', async ({ page }) => {
    await page.goto('/reports');
    await page.getByTestId('reports-view-enrollment').click();
    await expect(page.getByTestId('enrollment-by-employer')).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId('employer-row-EMP-001')).toBeVisible();
    await expect(page.getByTestId('employer-row-EMP-002')).toBeVisible();
  });

  test('enrollment report shows by-product breakdown', async ({ page }) => {
    await page.goto('/reports');
    await page.getByTestId('reports-view-enrollment').click();
    await expect(page.getByTestId('enrollment-by-product')).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId('product-row-MEDICAL')).toBeVisible();
    await expect(page.getByTestId('product-row-DENTAL')).toBeVisible();
  });

  test('enrollment report shows timeline', async ({ page }) => {
    await page.goto('/reports');
    await page.getByTestId('reports-view-enrollment').click();
    await expect(page.getByTestId('enrollment-timeline')).toBeVisible({ timeout: 8000 });
    // 7 timeline bars
    const bars = page.getByTestId('enrollment-timeline').locator('[data-testid^="timeline-bar-"]');
    await expect(bars.first()).toBeVisible();
  });

  test('can navigate to Carrier Audit report', async ({ page }) => {
    await page.goto('/reports');
    await page.getByTestId('reports-view-carrier').click();
    await expect(page.getByTestId('carrier-audit-report')).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId('carrier-summary')).toBeVisible();
  });

  test('carrier audit shows carrier breakdown', async ({ page }) => {
    await page.goto('/reports');
    await page.getByTestId('reports-view-carrier').click();
    await expect(page.getByTestId('carrier-breakdown')).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId('carrier-row-CAR-001')).toBeVisible();
    await expect(page.getByTestId('carrier-row-CAR-002')).toBeVisible();
    await expect(page.getByTestId('carrier-row-CAR-004')).toBeVisible();
  });

  test('carrier audit shows failure reasons and resolution', async ({ page }) => {
    await page.goto('/reports');
    await page.getByTestId('reports-view-carrier').click();
    await expect(page.getByTestId('failure-reasons')).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId('resolution-stats')).toBeVisible();
  });

  test('can navigate to Compliance report', async ({ page }) => {
    await page.goto('/reports');
    await page.getByTestId('reports-view-compliance').click();
    await expect(page.getByTestId('compliance-report')).toBeVisible({ timeout: 8000 });
  });

  test('compliance report shows ACA section', async ({ page }) => {
    await page.goto('/reports');
    await page.getByTestId('reports-view-compliance').click();
    await expect(page.getByTestId('aca-section')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Forms 1095-C Generated', { exact: true })).toBeVisible();
    await expect(page.getByText('Form 1094-C', { exact: true })).toBeVisible();
  });

  test('compliance report shows open exceptions', async ({ page }) => {
    await page.goto('/reports');
    await page.getByTestId('reports-view-compliance').click();
    await expect(page.getByTestId('compliance-exceptions')).toBeVisible({ timeout: 8000 });
    // EXC-001 is ACA distribution deadline
    await expect(page.getByTestId('exception-row-EXC-001')).toBeVisible();
    await expect(page.getByTestId('exception-row-EXC-002')).toBeVisible();
  });

  test('compliance report shows audit trail summary', async ({ page }) => {
    await page.goto('/reports');
    await page.getByTestId('reports-view-compliance').click();
    await expect(page.getByTestId('audit-trail-summary')).toBeVisible({ timeout: 8000 });
  });

  test('BenChat shows Reports context', async ({ page }) => {
    await page.goto('/reports');
    await page.getByRole('button', { name: 'Open BenChat assistant' }).click();
    const dialog = page.getByRole('dialog', { name: 'BenChat assistant' });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText('Reports & Analytics').first()).toBeVisible();
  });
});
