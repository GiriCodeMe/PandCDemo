import { test, expect } from '@playwright/test';

test.describe('Notifications Hub', () => {
  test('loads Notifications page with heading', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.getByRole('heading', { name: 'Notifications', exact: true })).toBeVisible();
    await expect(page.getByTestId('notifications-view-switcher')).toBeVisible();
  });

  test('shows stats row', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.getByTestId('notification-stats')).toBeVisible({ timeout: 5000 });
    const stats = page.getByTestId('notification-stats');
    await expect(stats.getByText('Total Sent', { exact: true })).toBeVisible();
    await expect(stats.getByText('Delivery Rate', { exact: true })).toBeVisible();
    await expect(stats.getByText('Open Rate', { exact: true })).toBeVisible();
    await expect(stats.getByText('Failed', { exact: true })).toBeVisible();
    await expect(stats.getByText('Scheduled', { exact: true })).toBeVisible();
  });

  test('overview shows failed notifications panel', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.getByTestId('failed-notifications')).toBeVisible({ timeout: 5000 });
    // NOTIF-006 is the failed notification for Bob Johnson
    await expect(page.getByTestId('notification-row-NOTIF-006')).toBeVisible();
  });

  test('overview shows recent notifications', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.getByTestId('recent-notifications')).toBeVisible({ timeout: 5000 });
  });

  test('overview shows scheduled notifications', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.getByTestId('scheduled-notifications')).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to Notification History view', async ({ page }) => {
    await page.goto('/notifications');
    await page.getByTestId('notifications-view-history').click();
    await expect(page.getByTestId('notifications-list')).toBeVisible({ timeout: 5000 });
  });

  test('history shows all notifications', async ({ page }) => {
    await page.goto('/notifications');
    await page.getByTestId('notifications-view-history').click();
    await expect(page.getByTestId('notifications-list')).toBeVisible({ timeout: 5000 });
    // NOTIF-001 is Enrollment Reminder for John Smith
    await expect(page.getByTestId('notification-row-NOTIF-001')).toBeVisible();
    // NOTIF-004 is COBRA notice for David Wilson
    await expect(page.getByTestId('notification-row-NOTIF-004')).toBeVisible();
  });

  test('history status filter works', async ({ page }) => {
    await page.goto('/notifications');
    await page.getByTestId('notifications-view-history').click();
    await expect(page.getByTestId('notifications-list')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('notif-status-filter').selectOption('Failed');
    // NOTIF-006 is Failed — should appear
    await expect(page.getByTestId('notification-row-NOTIF-006')).toBeVisible();
    // NOTIF-001 is Sent — should be filtered out
    await expect(page.getByTestId('notification-row-NOTIF-001')).not.toBeVisible();
  });

  test('history category filter works', async ({ page }) => {
    await page.goto('/notifications');
    await page.getByTestId('notifications-view-history').click();
    await expect(page.getByTestId('notifications-list')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('notif-category-filter').selectOption('COBRA');
    // NOTIF-004 is COBRA category — should appear
    await expect(page.getByTestId('notification-row-NOTIF-004')).toBeVisible();
    // NOTIF-001 is Enrollment category — should be filtered out
    await expect(page.getByTestId('notification-row-NOTIF-001')).not.toBeVisible();
  });

  test('can navigate to Templates view', async ({ page }) => {
    await page.goto('/notifications');
    await page.getByTestId('notifications-view-templates').click();
    await expect(page.getByTestId('templates-section')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('template-list')).toBeVisible({ timeout: 5000 });
  });

  test('templates view shows template cards', async ({ page }) => {
    await page.goto('/notifications');
    await page.getByTestId('notifications-view-templates').click();
    await expect(page.getByTestId('template-list')).toBeVisible({ timeout: 5000 });
    // TPL-001 is Open Enrollment Reminder
    await expect(page.getByTestId('template-card-TPL-001')).toBeVisible();
    await expect(page.getByTestId('template-card-TPL-005')).toBeVisible(); // COBRA notice
  });

  test('clicking template shows detail preview', async ({ page }) => {
    await page.goto('/notifications');
    await page.getByTestId('notifications-view-templates').click();
    await expect(page.getByTestId('template-card-TPL-001')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('template-card-TPL-001').click();
    const detail = page.getByTestId('template-detail');
    await expect(detail).toBeVisible();
    await expect(detail.getByRole('heading', { name: 'Open Enrollment Reminder' })).toBeVisible();
  });

  test('BenChat shows notifications context', async ({ page }) => {
    await page.goto('/notifications');
    await page.getByRole('button', { name: 'Open BenChat assistant' }).click();
    const dialog = page.getByRole('dialog', { name: 'BenChat assistant' });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText('Notifications').first()).toBeVisible();
  });
});
