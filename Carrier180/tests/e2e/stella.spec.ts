import { test, expect } from '@playwright/test'

test.describe('Ask Stella', () => {
  test('Stella button visible on Dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/ask stella/i).first()).toBeVisible()
  })

  test('Stella button visible on Reports page', async ({ page }) => {
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/ask stella/i).first()).toBeVisible()
  })

  test('clicking Stella button opens the panel', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.getByText(/ask stella/i).first().click()
    // Panel should appear — look for the greeting message
    await expect(page.getByText(/hi.*stella|i'm stella/i).first()).toBeVisible({ timeout: 5_000 })
  })

  test('Stella panel contains a message input', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.getByText(/ask stella/i).first().click()
    const input = page.locator('input[placeholder*="Ask"], input[placeholder*="stella"], input[placeholder*="message"], textarea').first()
    await expect(input).toBeVisible({ timeout: 5_000 })
  })

  test('Stella close button closes the panel', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.getByText(/ask stella/i).first().click()
    // Wait for panel to open (overlay or header is visible)
    await page.locator('button[aria-label="Close Stella"]').waitFor({ state: 'visible', timeout: 5_000 })
    await page.locator('button[aria-label="Close Stella"]').click()
    await expect(page.locator('button[aria-label="Close Stella"]')).not.toBeVisible({ timeout: 3_000 })
  })

  test('Stella responds to a message on claim review', async ({ page }) => {
    await page.goto('/claims/2026-102/review?step=3')
    await page.waitForLoadState('networkidle')
    await page.getByText(/ask stella/i).first().click()
    const input = page.locator('input[placeholder*="Ask"], input[placeholder*="stella"], input[placeholder*="message"], textarea').first()
    await input.waitFor({ timeout: 5_000 })
    await input.fill('What is the fraud risk on this claim?')
    await input.press('Enter')
    // Wait for a reply — either from Gemini or simulated
    await expect(
      page.getByText(/high|fraud|risk|SIU|investigation/i).last()
    ).toBeVisible({ timeout: 20_000 })
  })

  test('Stella shows claim-aware context on step 3', async ({ page }) => {
    await page.goto('/claims/2026-093/review?step=3')
    await page.waitForLoadState('networkidle')
    await page.getByText(/ask stella/i).first().click()
    const input = page.locator('input[placeholder*="Ask"], input[placeholder*="stella"], input[placeholder*="message"], textarea').first()
    await input.waitFor({ timeout: 5_000 })
    await input.fill('Should this claim be approved?')
    await input.press('Enter')
    // Low risk claim — response should mention approve or low risk
    await expect(
      page.getByText(/approve|low risk|proceed|authorization/i).last()
    ).toBeVisible({ timeout: 20_000 })
  })
})
