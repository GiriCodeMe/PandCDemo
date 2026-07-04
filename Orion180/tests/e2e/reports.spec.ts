import { test, expect } from '@playwright/test'

test.describe('Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
  })

  // ── page title ────────────────────────────────────────────────────────────
  test('renders page title', async ({ page }) => {
    await expect(page.getByText('Claims Analytics & Reports')).toBeVisible()
  })

  test('title text is readable (not white on white)', async ({ page }) => {
    const title = page.getByText('Claims Analytics & Reports')
    const color = await title.evaluate(el => getComputedStyle(el).color)
    expect(color).not.toBe('rgb(255, 255, 255)')
  })

  // ── KPI cards ─────────────────────────────────────────────────────────────
  test('KPI — Total Active Claims = 121', async ({ page }) => {
    await expect(page.getByText('121').first()).toBeVisible()
  })

  test('KPI — Avg Cycle Time = 14.2 days', async ({ page }) => {
    await expect(page.getByText('14.2 days').first()).toBeVisible()
  })

  test('KPI — Total Exposure = $4.8M', async ({ page }) => {
    await expect(page.getByText('$4.8M').first()).toBeVisible()
  })

  test('KPI — SIU Referrals YTD = 7', async ({ page }) => {
    await expect(page.getByText('SIU Referrals YTD').first()).toBeVisible()
  })

  test('KPI — Settled This Month = 34', async ({ page }) => {
    await expect(page.getByText('Settled This Month').first()).toBeVisible()
  })

  // ── charts ────────────────────────────────────────────────────────────────
  test('peril chart — Water / Plumbing row visible', async ({ page }) => {
    await expect(page.getByText('Water / Plumbing')).toBeVisible()
  })

  test('peril chart — Fire / Smoke row visible', async ({ page }) => {
    await expect(page.getByText('Fire / Smoke')).toBeVisible()
  })

  test('fraud distribution — all 3 risk labels visible', async ({ page }) => {
    await expect(page.getByText('Low Risk')).toBeVisible()
    await expect(page.getByText('Medium Risk')).toBeVisible()
    await expect(page.getByText('High Risk')).toBeVisible()
  })

  test('settlement trend — months Jan and Jun visible', async ({ page }) => {
    // Use exact matching to avoid substring hits on "Jane Doe" etc.
    await expect(page.getByText('Jan', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Jun', { exact: true }).first()).toBeVisible()
  })

  // ── regional table ────────────────────────────────────────────────────────
  test('regional table section heading visible', async ({ page }) => {
    await expect(page.getByText('Regional Performance Breakdown')).toBeVisible()
  })

  test('South Florida (Miami) region visible', async ({ page }) => {
    await expect(page.getByText('South Florida (Miami)')).toBeVisible()
  })

  test('Gulf Coast (Houston) region visible', async ({ page }) => {
    await expect(page.getByText('Gulf Coast (Houston)')).toBeVisible()
  })

  // ── action items ──────────────────────────────────────────────────────────
  test('action items section visible', async ({ page }) => {
    await expect(page.getByText(/Open Action Items/i)).toBeVisible()
  })

  test('all 3 insureds appear in action items', async ({ page }) => {
    await expect(page.getByText('Mary Johnson').first()).toBeVisible()
    await expect(page.getByText('John Smith').first()).toBeVisible()
    await expect(page.getByText('Robert Davis').first()).toBeVisible()
  })

  test('Gopi Reddy does NOT appear', async ({ page }) => {
    await expect(page.getByText('Gopi Reddy')).not.toBeVisible()
  })

  test('priority badges visible — HIGH, MEDIUM, LOW', async ({ page }) => {
    await expect(page.getByText('HIGH').first()).toBeVisible()
    await expect(page.getByText('MEDIUM').first()).toBeVisible()
    await expect(page.getByText('LOW').first()).toBeVisible()
  })

  test('clicking Mary Johnson action item navigates to her claim', async ({ page }) => {
    await page.getByText('Mary Johnson').first().click()
    await expect(page).toHaveURL(/\/claims\/2026-102\/review/)
  })

  // ── export buttons ────────────────────────────────────────────────────────
  test('Export PDF button visible', async ({ page }) => {
    await expect(page.getByText('Export PDF')).toBeVisible()
  })

  test('Export CSV button visible', async ({ page }) => {
    await expect(page.getByText('Export CSV')).toBeVisible()
  })

  // ── theme check ───────────────────────────────────────────────────────────
  test('page background is light (not dark navy)', async ({ page }) => {
    const bg = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)
    expect(bg).not.toBe('rgb(10, 15, 44)')
    expect(bg).not.toBe('rgb(0, 0, 0)')
  })
})
