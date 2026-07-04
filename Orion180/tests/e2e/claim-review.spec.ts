import { test, expect } from '@playwright/test'

// Step 1 — Review Submission
test.describe('Claim Review — Step 1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/claims/2026-108/review?step=1')
    await page.waitForLoadState('networkidle')
  })

  test('shows claim header with ID and insured name', async ({ page }) => {
    await expect(page.getByText('2026-108').first()).toBeVisible()
    await expect(page.getByText('John Smith').first()).toBeVisible()
  })

  test('step stepper is visible', async ({ page }) => {
    // At least two step labels should be visible
    await expect(page.getByText(/review|submission/i).first()).toBeVisible()
    await expect(page.getByText(/validation/i).first()).toBeVisible()
  })

  test('FNOL narrative text is readable (not invisible)', async ({ page }) => {
    // Narrative contains water / damage content
    const narrative = page.locator('text=/water|damage|kitchen|pipe/i').first()
    await expect(narrative).toBeVisible()
    const color = await narrative.evaluate(el => getComputedStyle(el).color)
    expect(color).not.toBe('rgb(255, 255, 255)')
  })

  test('documents section shows uploaded files', async ({ page }) => {
    await expect(page.getByText(/\.pdf|\.jpg|document/i).first()).toBeVisible()
  })
})

// Step 2 — Claim Validation
test.describe('Claim Review — Step 2 (AI analyses)', () => {
  test('2026-108 address compare shows MISMATCH verdict', async ({ page }) => {
    await page.goto('/claims/2026-108/review?step=2')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/mismatch|commerce|invoice/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test('2026-102 fire claim address is consistent', async ({ page }) => {
    await page.goto('/claims/2026-102/review?step=2')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/consistent|match/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test('coverage badges render', async ({ page }) => {
    await page.goto('/claims/2026-108/review?step=2')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/covered|coverage/i).first()).toBeVisible({ timeout: 10_000 })
  })
})

// Step 3 — Insights & Evidence
test.describe('Claim Review — Step 3 (Fraud Vectors)', () => {
  test('2026-102 shows HIGH fraud risk', async ({ page }) => {
    await page.goto('/claims/2026-102/review?step=3')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/HIGH/i).first()).toBeVisible({ timeout: 12_000 })
  })

  test('2026-102 shows SIU referral in decision status (step 5)', async ({ page }) => {
    // SIU text lives in nextSteps (Step 5), not Step 3 fraud analysis section
    await page.goto('/claims/2026-102/review?step=5')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/SIU/i).first()).toBeVisible({ timeout: 12_000 })
  })

  test('2026-093 shows LOW fraud risk', async ({ page }) => {
    await page.goto('/claims/2026-093/review?step=3')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/LOW|low/i).first()).toBeVisible({ timeout: 12_000 })
  })

  test('2026-093 shows APPROVE in decision status (step 5)', async ({ page }) => {
    // "Approved — Pending Final Estimate" lives in nextSteps (Step 5), not fraud analysis (Step 3)
    await page.goto('/claims/2026-093/review?step=5')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/APPROVE|Approved/i).first()).toBeVisible({ timeout: 12_000 })
  })
})

// Step 4 — Communications Log
test.describe('Claim Review — Step 4 (Communications)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/claims/2026-108/review?step=4')
    await page.waitForLoadState('networkidle')
  })

  test('shows communications history', async ({ page }) => {
    await expect(page.getByText(/email|call|sms|communication/i).first()).toBeVisible()
  })

  test('shows AI-generated email templates', async ({ page }) => {
    await expect(page.getByText(/template|email|status update/i).first()).toBeVisible({ timeout: 10_000 })
  })
})

// Step 5 — Next Steps
test.describe('Claim Review — Step 5 (Next Steps)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/claims/2026-108/review?step=5')
    await page.waitForLoadState('networkidle')
  })

  test('step 5 heading is visible with readable text color', async ({ page }) => {
    const heading = page.getByText(/next steps|final decision/i).first()
    await expect(heading).toBeVisible()
    const color = await heading.evaluate(el => getComputedStyle(el).color)
    expect(color).not.toBe('rgb(255, 255, 255)')
  })

  test('Next Best Actions panel renders', async ({ page }) => {
    await expect(page.getByText(/next best action|action/i).first()).toBeVisible()
  })

  test('clicking an action button opens confirm modal', async ({ page }) => {
    const actionButtons = page.locator('button').filter({ hasText: /approve|deny|schedule|request|assign/i })
    const count = await actionButtons.count()
    if (count > 0) {
      await actionButtons.first().click()
      // Confirm modal should appear
      await expect(page.getByText(/confirm action|confirm/i).first()).toBeVisible({ timeout: 5_000 })
    }
  })

  test('confirm modal has white background (not dark)', async ({ page }) => {
    // "Confirm second visit on site" → type='confirm-visit' → falls to else → opens ConfirmModal
    // (not ServiceProviderModal, unlike plumber/inspector actions)
    const visitBtn = page.locator('button').filter({ hasText: /second visit/i }).first()
    if (await visitBtn.count() > 0 && await visitBtn.isVisible()) {
      await visitBtn.click()
      const confirmHeading = page.getByText('Confirm Action').first()
      await expect(confirmHeading).toBeVisible({ timeout: 5_000 })
      const bg = await confirmHeading.evaluate(el => {
        let node = el
        while (node) {
          const s = getComputedStyle(node).backgroundColor
          if (s && s !== 'rgba(0, 0, 0, 0)' && s !== 'transparent') return s
          node = node.parentElement
        }
        return ''
      })
      expect(bg).toBe('rgb(255, 255, 255)')
    }
  })

  test('cancel button closes confirm modal', async ({ page }) => {
    const actionButtons = page.locator('button').filter({ hasText: /approve|deny|schedule|request|assign/i })
    const count = await actionButtons.count()
    if (count > 0) {
      await actionButtons.first().click()
      await page.getByRole('button', { name: /cancel/i }).click()
      await expect(page.getByText(/confirm action/i)).not.toBeVisible()
    }
  })
})

// Theme consistency across all claims
test.describe('Theme consistency across claims', () => {
  test('all 3 claim reviews use light background', async ({ page }) => {
    for (const id of ['2026-108', '2026-102', '2026-093']) {
      await page.goto(`/claims/${id}/review?step=1`)
      await page.waitForLoadState('networkidle')
      const body = page.locator('body')
      const bg = await body.evaluate(el => getComputedStyle(el).backgroundColor)
      // Should be light (not black/dark navy)
      expect(bg).not.toBe('rgb(0, 0, 0)')
      expect(bg).not.toBe('rgb(10, 15, 44)') // #0a0f2c dark navy
    }
  })
})
