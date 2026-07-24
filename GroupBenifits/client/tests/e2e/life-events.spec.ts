import { test, expect } from '@playwright/test';

test.describe('Life Events Hub', () => {
  test('loads life events page with heading', async ({ page }) => {
    await page.goto('/life-events');
    await expect(page.getByRole('heading', { name: 'Life Events', exact: true })).toBeVisible();
    await expect(page.getByTestId('life-events-view-switcher')).toBeVisible();
  });

  test('shows stat cards', async ({ page }) => {
    await page.goto('/life-events');
    await expect(page.getByText('Total Events', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Pending Docs', { exact: true })).toBeVisible();
    // 'Submitted' also appears as filter option + badge — use first() to match stat card
    await expect(page.getByText('Submitted', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Approved', { exact: true }).first()).toBeVisible();
  });

  test('shows life events list', async ({ page }) => {
    await page.goto('/life-events');
    await expect(page.getByTestId('life-events-list')).toBeVisible({ timeout: 5000 });
  });

  test('list contains seed life events', async ({ page }) => {
    await page.goto('/life-events');
    await expect(page.getByTestId('life-events-list')).toBeVisible({ timeout: 5000 });
    // LE-001 is Marriage, LE-002 is Birth — use testId to scope to a specific row
    await expect(page.getByTestId('life-event-row-LE-001')).toBeVisible();
    await expect(page.getByTestId('life-event-row-LE-002')).toBeVisible();
    await expect(page.getByTestId('life-event-row-LE-001').getByText('Marriage')).toBeVisible();
  });

  test('shows status badges', async ({ page }) => {
    await page.goto('/life-events');
    await expect(page.getByTestId('life-events-list')).toBeVisible({ timeout: 5000 });
    // LE-001 is Pending Documentation, LE-002 is Approved
    await expect(page.getByTestId('life-event-row-LE-001').getByText('Pending Documentation')).toBeVisible();
    await expect(page.getByTestId('life-event-row-LE-002').getByText('Approved')).toBeVisible();
  });

  test('status filter works', async ({ page }) => {
    await page.goto('/life-events');
    await expect(page.getByTestId('status-filter')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('status-filter').selectOption('Approved');
    // After filtering for Approved only, Pending Documentation status should not be visible
    await expect(page.getByText('Pending Documentation').first()).not.toBeVisible();
  });

  test('can click life event to see detail', async ({ page }) => {
    await page.goto('/life-events');
    await expect(page.getByTestId('life-events-list')).toBeVisible({ timeout: 5000 });
    // Click first life event row
    await page.getByTestId('life-event-row-LE-001').click();
    // Detail view should show
    await expect(page.getByTestId('life-event-back')).toBeVisible();
    await expect(page.getByText('Required Documents', { exact: true })).toBeVisible();
  });

  test('life event detail shows enrollment window', async ({ page }) => {
    await page.goto('/life-events');
    await expect(page.getByTestId('life-events-list')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('life-event-row-LE-002').click();
    await expect(page.getByText('Enrollment Window', { exact: true })).toBeVisible();
    await expect(page.getByText('Opens', { exact: true })).toBeVisible();
    await expect(page.getByText('Closes', { exact: true })).toBeVisible();
  });

  test('back button returns to list', async ({ page }) => {
    await page.goto('/life-events');
    await expect(page.getByTestId('life-events-list')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('life-event-row-LE-001').click();
    await expect(page.getByTestId('life-event-back')).toBeVisible();
    await page.getByTestId('life-event-back').click();
    await expect(page.getByTestId('life-events-list')).toBeVisible();
  });

  test('can switch to Dependent Rules view', async ({ page }) => {
    await page.goto('/life-events');
    await page.getByTestId('life-events-view-rules').click();
    await expect(page.getByText('Spouse', { exact: true })).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Child').first()).toBeVisible();
  });

  test('dependent rules show documentation requirements', async ({ page }) => {
    await page.goto('/life-events');
    await page.getByTestId('life-events-view-rules').click();
    await expect(page.getByText('Marriage Certificate').first()).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('Birth Certificate').first()).toBeVisible();
  });

  test('Report Life Event button opens modal', async ({ page }) => {
    await page.goto('/life-events');
    await page.getByTestId('report-life-event-btn').click();
    await expect(page.getByTestId('report-life-event-modal')).toBeVisible();
    await expect(page.getByText('Report a Life Event', { exact: true })).toBeVisible();
  });

  test('report form has event type dropdown', async ({ page }) => {
    await page.goto('/life-events');
    await page.getByTestId('report-life-event-btn').click();
    await expect(page.getByTestId('report-life-event-modal')).toBeVisible();
    // Wait for eventTypes API to resolve — select should contain event type options
    const modal = page.getByTestId('report-life-event-modal');
    await expect(modal.locator('select#event-type-select')).toBeVisible({ timeout: 5000 });
    await expect(modal.locator('select#event-type-select option[value="Marriage"]')).toBeAttached();
  });

  test('cancel report form closes modal', async ({ page }) => {
    await page.goto('/life-events');
    await page.getByTestId('report-life-event-btn').click();
    await expect(page.getByTestId('report-life-event-modal')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByTestId('report-life-event-modal')).not.toBeVisible();
  });

  test('BenChat shows life events context', async ({ page }) => {
    await page.goto('/life-events');
    await page.getByRole('button', { name: 'Open BenChat assistant' }).click();
    const dialog = page.getByRole('dialog', { name: 'BenChat assistant' });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText('Life Events').first()).toBeVisible();
  });
});
