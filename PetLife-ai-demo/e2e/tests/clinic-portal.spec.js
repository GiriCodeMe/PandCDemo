const { test, expect } = require('@playwright/test');

const URL = '/clinic';
const CLINIC_ID    = 'CLINIC-NVA-0881';
const ROCKY_POLICY = 'PET-2026-774512';   // deductible fully met

// The clinic selector is the only <select> that has clinic options
async function selectClinic(page) {
  await page
    .locator('select.form-input')
    .filter({ has: page.locator(`option[value="${CLINIC_ID}"]`) })
    .selectOption({ value: CLINIC_ID });
}

// Tab buttons render as  <span>🔍</span><span>Eligibility</span>
// FAQ accordion buttons also contain the same words — match END of accessible name.
function clickTab(page, label) {
  return page.getByRole('button', { name: new RegExp(`${label}$`) }).click();
}

// ─── Eligibility — no clinic selected ────────────────────────────────────────

test.describe('Eligibility — no clinic selected', () => {
  test('shows hint when no clinic is selected', async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByText('Select a Clinic ID above before searching.')).toBeVisible();
  });
});

// ─── Eligibility ──────────────────────────────────────────────────────────────

test.describe('Eligibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await selectClinic(page);
    // Eligibility is the default tab — no explicit click needed
  });

  test('search by policy number returns active patient', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Microchip ID, Policy Number, or Owner Phone');
    await searchInput.fill(ROCKY_POLICY);
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('ACTIVE')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Coverage Summary')).toBeVisible();
    await expect(page.getByText('Deductible Remaining')).toBeVisible();
    await expect(page.getByText('Annual Limit Remaining')).toBeVisible();
  });

  test('Rocky (fully-met deductible) shows $0 deductible remaining', async ({ page }) => {
    await page.getByPlaceholder('Microchip ID, Policy Number, or Owner Phone').fill(ROCKY_POLICY);
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('ACTIVE')).toBeVisible({ timeout: 10_000 });
    // Server returns deductibleRemaining: 0; UI renders it as `$${value}` → "$0"
    await expect(page.getByText('$0', { exact: true })).toBeVisible();
  });

  test('unknown policy shows no Coverage Summary', async ({ page }) => {
    await page.getByPlaceholder('Microchip ID, Policy Number, or Owner Phone').fill('PET-2099-UNKNOWN');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.getByText('Coverage Summary')).not.toBeVisible({ timeout: 8_000 });
  });

  test('"Use in Pre-Auth" populates policy number on Pre-Auth tab', async ({ page }) => {
    await page.getByPlaceholder('Microchip ID, Policy Number, or Owner Phone').fill(ROCKY_POLICY);
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('ACTIVE')).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /Use in Pre-Auth/ }).click();

    // Pre-Auth tab should now be active; policy input pre-filled
    const policyInput = page.getByPlaceholder(/e\.g\. POL-|e\.g\. PET-/);
    await expect(policyInput).toHaveValue(ROCKY_POLICY);
  });
});

// ─── Pre-Authorization ────────────────────────────────────────────────────────

test.describe('Pre-Authorization', () => {
  // Run eligibility first, then jump to pre-auth via the shortcut button
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await selectClinic(page);
    await page.getByPlaceholder('Microchip ID, Policy Number, or Owner Phone').fill(ROCKY_POLICY);
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('ACTIVE')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /Use in Pre-Auth/ }).click();
  });

  test('policy number is pre-filled from eligibility', async ({ page }) => {
    await expect(page.getByPlaceholder(/e\.g\. POL-|e\.g\. PET-/)).toHaveValue(ROCKY_POLICY);
  });

  test('submit with a line item returns APPROVED', async ({ page }) => {
    await page.getByPlaceholder('e.g. ICD-VET-K92.2').fill('ICD-VET-K92.2');
    await page.locator('textarea.form-input').first().fill('Acute gastroenteritis with vomiting');

    await page.getByPlaceholder('e.g. PROC-001').fill('PROC-001');
    await page.getByPlaceholder('Procedure description').fill('Emergency exam and treatment');
    await page.getByPlaceholder('0.00').fill('550');

    await page.getByRole('button', { name: 'Request Pre-Authorization' }).click();

    await expect(page.getByText('APPROVED', { exact: true }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('result table has Description, Charged, Carrier Pays columns', async ({ page }) => {
    await page.getByPlaceholder('e.g. ICD-VET-K92.2').fill('ICD-VET-K92.2');
    await page.locator('textarea.form-input').first().fill('Acute gastroenteritis with vomiting');

    await page.getByPlaceholder('e.g. PROC-001').fill('PROC-001');
    await page.getByPlaceholder('Procedure description').fill('Annual blood panel');
    await page.getByPlaceholder('0.00').fill('600');

    await page.getByRole('button', { name: 'Request Pre-Authorization' }).click();

    await expect(page.getByText('Line Decisions')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('columnheader', { name: 'Charged' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Carrier Pays' })).toBeVisible();
  });

  test('pre-auth token is generated with a Copy button', async ({ page }) => {
    await page.getByPlaceholder('e.g. ICD-VET-K92.2').fill('ICD-VET-K92.2');
    await page.locator('textarea.form-input').first().fill('Post-operative wound care assessment');

    await page.getByPlaceholder('e.g. PROC-001').fill('PROC-002');
    await page.getByPlaceholder('Procedure description').fill('Wound care');
    await page.getByPlaceholder('0.00').fill('800');

    await page.getByRole('button', { name: 'Request Pre-Authorization' }).click();

    await expect(page.getByText('APPROVED', { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Copy' })).toBeVisible();
  });
});

// ─── Settlement ───────────────────────────────────────────────────────────────

test.describe('Settlement', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await selectClinic(page);
  });

  test('policy number auto-populates after eligibility lookup', async ({ page }) => {
    // Eligibility search
    await page.getByPlaceholder('Microchip ID, Policy Number, or Owner Phone').fill(ROCKY_POLICY);
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.getByText('ACTIVE')).toBeVisible({ timeout: 10_000 });

    // Switch to Settlement tab
    await clickTab(page, 'Settlement');

    // Policy number should be auto-populated
    await expect(page.getByPlaceholder(/e\.g\. PET-2026-/)).toHaveValue(ROCKY_POLICY);
  });

  test('settlement returns ADJUDICATED result with Bill Split', async ({ page }) => {
    await clickTab(page, 'Settlement');

    await page.getByPlaceholder(/e\.g\. PET-2026-/).fill(ROCKY_POLICY);
    await page.getByPlaceholder('ICD-VET-K92.2').fill('ICD-VET-K92.2');
    await page.locator('textarea.form-input').first().fill('Post-treatment settlement for gastroenteritis');

    await page.getByPlaceholder('e.g. PROC-001').fill('PROC-001');
    await page.getByPlaceholder('Procedure description').fill('Emergency treatment');
    await page.getByPlaceholder('0.00').fill('500');

    await page.getByRole('button', { name: 'Submit Settlement' }).click();

    await expect(page.getByText(/ADJUDICATED/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Bill Split')).toBeVisible();
    await expect(page.getByText('Customer Pays at Desk')).toBeVisible();
    await expect(page.getByText('Insurer Direct Payout to Clinic')).toBeVisible();
  });

  test('bill split includes Payment Instruction and Print button', async ({ page }) => {
    await clickTab(page, 'Settlement');

    await page.getByPlaceholder(/e\.g\. PET-2026-/).fill(ROCKY_POLICY);
    await page.getByPlaceholder('ICD-VET-K92.2').fill('ICD-VET-K92.2');
    await page.locator('textarea.form-input').first().fill('Routine follow-up and medication dispensed');

    await page.getByPlaceholder('e.g. PROC-001').fill('PROC-003');
    await page.getByPlaceholder('Procedure description').fill('Follow-up consult');
    await page.getByPlaceholder('0.00').fill('300');

    await page.getByRole('button', { name: 'Submit Settlement' }).click();

    await expect(page.getByText('Payment Instruction')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Method:')).toBeVisible();
    await expect(page.getByText('Print')).toBeVisible();
  });
});
