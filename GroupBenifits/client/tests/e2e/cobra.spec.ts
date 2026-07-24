import { test, expect } from '@playwright/test';

test.describe('COBRA & Compliance Hub', () => {
  test('loads COBRA page with heading', async ({ page }) => {
    await page.goto('/cobra');
    await expect(page.getByRole('heading', { name: 'COBRA & Compliance', exact: true })).toBeVisible();
    await expect(page.getByTestId('cobra-view-switcher')).toBeVisible();
  });

  test('shows stats row with event counts', async ({ page }) => {
    await page.goto('/cobra');
    await expect(page.getByTestId('cobra-stats')).toBeVisible({ timeout: 5000 });
    const stats = page.getByTestId('cobra-stats');
    await expect(stats.getByText('Total Events', { exact: true })).toBeVisible();
    await expect(stats.getByText('Pending Election', { exact: true })).toBeVisible();
    await expect(stats.getByText('Active COBRA', { exact: true })).toBeVisible();
    await expect(stats.getByText('Declined', { exact: true })).toBeVisible();
    await expect(stats.getByText('Lapsed', { exact: true })).toBeVisible();
  });

  test('shows compliance alerts panel', async ({ page }) => {
    await page.goto('/cobra');
    await expect(page.getByTestId('compliance-alerts')).toBeVisible({ timeout: 5000 });
  });

  test('overview shows COBRA events list', async ({ page }) => {
    await page.goto('/cobra');
    await expect(page.getByTestId('cobra-events-list')).toBeVisible({ timeout: 5000 });
    // COBRA-001 is the pending David Wilson event
    await expect(page.getByTestId('cobra-event-COBRA-001')).toBeVisible();
  });

  test('overview shows alert for COBRA-004 lapsed event', async ({ page }) => {
    await page.goto('/cobra');
    // COBRA-004 generates 2 alerts (lapsed + overdue payment) — use .first()
    await expect(page.getByTestId('alert-COBRA-004').first()).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to COBRA Events view', async ({ page }) => {
    await page.goto('/cobra');
    await page.getByTestId('cobra-view-events').click();
    await expect(page.getByTestId('cobra-events-full-list')).toBeVisible({ timeout: 5000 });
  });

  test('COBRA events view shows all 4 events', async ({ page }) => {
    await page.goto('/cobra');
    await page.getByTestId('cobra-view-events').click();
    await expect(page.getByTestId('cobra-events-full-list')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('cobra-event-COBRA-001')).toBeVisible();
    await expect(page.getByTestId('cobra-event-COBRA-002')).toBeVisible();
    await expect(page.getByTestId('cobra-event-COBRA-003')).toBeVisible();
    await expect(page.getByTestId('cobra-event-COBRA-004')).toBeVisible();
  });

  test('COBRA events status filter works', async ({ page }) => {
    await page.goto('/cobra');
    await page.getByTestId('cobra-view-events').click();
    await expect(page.getByTestId('cobra-events-full-list')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('cobra-status-filter').selectOption('Elected');
    // COBRA-002 is Sarah Chen, Elected
    await expect(page.getByTestId('cobra-event-COBRA-002')).toBeVisible();
    // COBRA-001 is Pending — should be filtered out
    await expect(page.getByTestId('cobra-event-COBRA-001')).not.toBeVisible();
  });

  test('can open COBRA event detail', async ({ page }) => {
    await page.goto('/cobra');
    await page.getByTestId('cobra-view-events').click();
    await expect(page.getByTestId('cobra-event-COBRA-001')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('cobra-event-COBRA-001').click();
    // Detail view shows back button and event info
    await expect(page.getByTestId('cobra-back')).toBeVisible();
    await expect(page.getByText('Voluntary Termination', { exact: true })).toBeVisible();
  });

  test('COBRA detail shows election options', async ({ page }) => {
    await page.goto('/cobra');
    await page.getByTestId('cobra-view-events').click();
    await expect(page.getByTestId('cobra-event-COBRA-001')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('cobra-event-COBRA-001').click();
    // David Wilson has Medical, Dental, Vision options
    await expect(page.getByTestId('cobra-election-MED-PPO-500')).toBeVisible();
    await expect(page.getByTestId('cobra-election-DENT-BASIC')).toBeVisible();
    await expect(page.getByTestId('cobra-election-VIS-STD')).toBeVisible();
  });

  test('back button returns to events list', async ({ page }) => {
    await page.goto('/cobra');
    await page.getByTestId('cobra-view-events').click();
    await expect(page.getByTestId('cobra-event-COBRA-001')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('cobra-event-COBRA-001').click();
    await expect(page.getByTestId('cobra-back')).toBeVisible();
    await page.getByTestId('cobra-back').click();
    await expect(page.getByTestId('cobra-events-full-list')).toBeVisible();
  });

  test('can navigate to Compliance Audit view', async ({ page }) => {
    await page.goto('/cobra');
    await page.getByTestId('cobra-view-audit').click();
    await expect(page.getByTestId('audit-log-list')).toBeVisible({ timeout: 5000 });
  });

  test('audit log shows COBRA notice events', async ({ page }) => {
    await page.goto('/cobra');
    await page.getByTestId('cobra-view-audit').click();
    await expect(page.getByTestId('audit-log-list')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('audit-event-AUD-001')).toBeVisible();
    await expect(page.getByTestId('audit-event-AUD-002')).toBeVisible();
  });

  test('audit log shows termination and lapse events', async ({ page }) => {
    await page.goto('/cobra');
    await page.getByTestId('cobra-view-audit').click();
    await expect(page.getByTestId('audit-log-list')).toBeVisible({ timeout: 5000 });
    // AUD-007 is the COBRA_LAPSED event for Patricia Martinez
    await expect(page.getByTestId('audit-event-AUD-007')).toBeVisible();
    // AUD-009 is the TERMINATION_PROCESSED event for David Wilson
    await expect(page.getByTestId('audit-event-AUD-009')).toBeVisible();
  });

  test('BenChat shows COBRA context', async ({ page }) => {
    await page.goto('/cobra');
    await page.getByRole('button', { name: 'Open BenChat assistant' }).click();
    const dialog = page.getByRole('dialog', { name: 'BenChat assistant' });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText('COBRA').first()).toBeVisible();
  });
});
