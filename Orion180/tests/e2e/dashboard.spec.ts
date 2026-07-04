import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('redirects / to /dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('KPI — New Claims label visible', async ({ page }) => {
    await expect(page.getByText('New Claims').first()).toBeVisible()
  })

  test('KPI — Large Loss Alerts label visible', async ({ page }) => {
    await expect(page.getByText('Large Loss Alerts').first()).toBeVisible()
  })

  test('KPI — Insured Sentiment Alerts label visible', async ({ page }) => {
    await expect(page.getByText('Insured Sentiment Alerts').first()).toBeVisible()
  })

  test('KPI — High Fraud Risk label visible', async ({ page }) => {
    await expect(page.getByText('High Fraud Risk').first()).toBeVisible()
  })

  test('KPI — Avg Cycle Time > 15 Days label visible', async ({ page }) => {
    await expect(page.getByText('Avg Cycle Time > 15 Days').first()).toBeVisible()
  })

  test('claims table shows 3 seed insureds', async ({ page }) => {
    await expect(page.getByText('John Smith').first()).toBeVisible()
    await expect(page.getByText('Mary Johnson').first()).toBeVisible()
    await expect(page.getByText('Robert Davis').first()).toBeVisible()
  })

  test('Gopi Reddy is NOT shown (renamed to Robert Davis)', async ({ page }) => {
    await expect(page.getByText('Gopi Reddy')).not.toBeVisible()
  })

  test('claims table shows claim IDs', async ({ page }) => {
    await expect(page.getByText('2026-108').first()).toBeVisible()
    await expect(page.getByText('2026-102').first()).toBeVisible()
    await expect(page.getByText('2026-093').first()).toBeVisible()
  })

  test('search filters to one claim', async ({ page }) => {
    // Use exact ClaimsTable placeholder to avoid matching TopNav search input
    const search = page.getByPlaceholder('Search by Claim # or Policyholder...')
    await search.fill('mary')
    await page.waitForTimeout(600)
    await expect(page.getByText('Mary Johnson').first()).toBeVisible()
    await expect(page.getByText('John Smith')).not.toBeVisible()
    await expect(page.getByText('Robert Davis')).not.toBeVisible()
  })

  test('status filter — New shows only new claims', async ({ page }) => {
    await page.getByRole('combobox').filter({ hasText: 'Status' }).selectOption('New')
    await page.waitForTimeout(600)
    const rows = page.locator('tbody tr:not(:has(td[colspan]))')
    for (const row of await rows.all()) {
      await expect(row.getByText('New')).toBeVisible()
    }
  })

  test('risk filter — High shows only high-risk claims', async ({ page }) => {
    await page.getByRole('combobox').filter({ hasText: 'Risk' }).selectOption('High')
    await page.waitForTimeout(600)
    await expect(page.getByText('Mary Johnson').first()).toBeVisible()
  })

  test('clicking a claim row navigates to review', async ({ page }) => {
    await page.getByText('John Smith').first().click()
    await expect(page).toHaveURL(/\/claims\/2026-108\/review/)
  })

  test('New Claim button navigates to /claims/new', async ({ page }) => {
    // "+ New Claim" button in sidebar — use role to avoid matching "New Claims" KPI label
    await page.getByRole('button', { name: /new claim/i }).click()
    await expect(page).toHaveURL(/\/claims\/new/)
  })

  test('Ask Stella button is visible in nav', async ({ page }) => {
    await expect(page.getByText(/ask stella/i).first()).toBeVisible()
  })
})
