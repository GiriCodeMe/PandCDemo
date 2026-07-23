const { test, expect } = require('@playwright/test');

const URL = '/hotel-portal';
const WAFFLES  = 'PET-7721';   // all vaccines GREEN
const ROCKY    = 'PET-3341';   // Bordetella EXPIRING_SOON → AMBER
const FACILITY = 'HOTEL-PALACE-OHIO-02';

function isoDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

// Tab buttons render as  <span>🩺</span><span>Health Pass</span>
// FAQ buttons also contain "health pass" in their text, so we match on the END of the name.
function clickTab(page, label) {
  return page.getByRole('button', { name: new RegExp(`${label}$`) }).click();
}

// Wait for pets to load from /api/fnol/policies
async function waitForPets(page) {
  await expect(
    page.locator(`select.form-input option[value="${WAFFLES}"]`)
  ).toBeAttached({ timeout: 8_000 });
}

// ─── Health Pass ──────────────────────────────────────────────────────────────

test.describe('Health Pass', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await waitForPets(page);
  });

  test('Waffles (PET-7721) is cleared for check-in', async ({ page }) => {
    await page.locator('select.form-input').first().selectOption({ value: WAFFLES });
    await page.getByRole('button', { name: 'Run Health Check' }).click();

    await expect(page.getByText('CLEARED FOR CHECK-IN')).toBeVisible();
    await expect(page.locator('text=ACTIVE').first()).toBeVisible();
  });

  test('Rocky (PET-3341) gets conditional clearance (AMBER)', async ({ page }) => {
    await page.locator('select.form-input').first().selectOption({ value: ROCKY });
    await page.getByRole('button', { name: 'Run Health Check' }).click();

    await expect(page.getByText(/CONDITIONAL/)).toBeVisible();
  });

  test('result shows Vaccination Status section with Rabies, Bordetella, DHPP', async ({ page }) => {
    await page.locator('select.form-input').first().selectOption({ value: WAFFLES });
    await page.getByRole('button', { name: 'Run Health Check' }).click();

    await expect(page.getByText('Vaccination Status')).toBeVisible();
    await expect(page.getByText('Rabies')).toBeVisible();
    await expect(page.getByText('Bordetella')).toBeVisible();
    await expect(page.getByText('DHPP')).toBeVisible();
  });

  test('"Mark as Checked In" button records a timestamp', async ({ page }) => {
    await page.locator('select.form-input').first().selectOption({ value: WAFFLES });
    await page.getByRole('button', { name: 'Run Health Check' }).click();

    const checkInBtn = page.getByRole('button', { name: 'Mark as Checked In' });
    await expect(checkInBtn).toBeVisible();
    await checkInBtn.click();
    await expect(page.getByText(/Checked in at/)).toBeVisible();
  });
});

// ─── Stay Protection ──────────────────────────────────────────────────────────

test.describe('Stay Protection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await clickTab(page, 'Stay Protection');
  });

  test('quote shows premium fields for a valid stay', async ({ page }) => {
    const facilityCard = page.locator('.card').filter({ hasText: 'Facility & Stay Dates' });
    await facilityCard.locator('select.form-input').selectOption({ value: FACILITY });
    await facilityCard.locator('input[type="date"]').nth(0).fill(isoDate(2));
    await facilityCard.locator('input[type="date"]').nth(1).fill(isoDate(7));
    await page.getByRole('button', { name: 'Get Quote' }).click();

    await expect(page.getByText('Total Premium')).toBeVisible();
    await expect(page.getByText('Daily Premium')).toBeVisible();
    await expect(page.getByText('Total Days')).toBeVisible();
  });

  test('4-night stay quote shows $14.00 total / $3.50 daily', async ({ page }) => {
    const facilityCard = page.locator('.card').filter({ hasText: 'Facility & Stay Dates' });
    await facilityCard.locator('select.form-input').selectOption({ value: FACILITY });
    await facilityCard.locator('input[type="date"]').nth(0).fill(isoDate(1));
    await facilityCard.locator('input[type="date"]').nth(1).fill(isoDate(5));
    await page.getByRole('button', { name: 'Get Quote' }).click();

    await expect(page.locator('strong').filter({ hasText: '$14.00' })).toBeVisible();
    await expect(page.getByText('$3.50')).toBeVisible();
  });

  test('full booking flow issues a MICRO-STAY- policy number', async ({ page }) => {
    // --- Facility & dates ---
    const facilityCard = page.locator('.card').filter({ hasText: 'Facility & Stay Dates' });
    await facilityCard.locator('select.form-input').selectOption({ value: FACILITY });
    await facilityCard.locator('input[type="date"]').nth(0).fill(isoDate(2));
    await facilityCard.locator('input[type="date"]').nth(1).fill(isoDate(7));
    await page.getByRole('button', { name: 'Get Quote' }).click();
    await expect(page.getByText('Total Premium')).toBeVisible();

    // Check "Add Stay Protection" checkbox
    const stayCheckbox = page.locator('input[type="checkbox"]').first();
    if (!(await stayCheckbox.isChecked())) await stayCheckbox.check();

    // --- Owner info ---
    const ownerCard = page.locator('.card').filter({ hasText: 'Owner Information' });
    const ownerInputs = ownerCard.locator('input.form-input');
    await ownerInputs.nth(0).fill('Test');
    await ownerInputs.nth(1).fill('Owner');
    await ownerInputs.nth(2).fill('test@example.com');
    await ownerInputs.nth(3).fill('+15551234567');

    // --- Pet info ---
    const petCard = page.locator('.card').filter({ hasText: 'Pet Information' });
    const petInputs = petCard.locator('input.form-input');
    await petInputs.nth(0).fill('Waffles');               // Pet Name
    await petCard.locator('select.form-input').first().selectOption({ value: 'Canine' });
    await petInputs.nth(1).fill('Labrador');               // Breed
    await petInputs.nth(2).fill('3');                      // Age

    await page.getByRole('button', { name: 'Confirm Booking' }).click();

    await expect(page.getByText('Stay Protection Bound Successfully')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/MICRO-STAY-/)).toBeVisible();
    await expect(page.getByText('Download Policy PDF')).toBeVisible();
  });
});

// ─── Incident Response ────────────────────────────────────────────────────────

test.describe('Incident Response', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await clickTab(page, 'Incident Response');
    await waitForPets(page);
  });

  test('description < 10 chars shows validation message', async ({ page }) => {
    const symptomsField = page.getByPlaceholder(/Describe symptoms/);
    await symptomsField.fill('short');
    await symptomsField.blur();
    await expect(page.getByText('Minimum 10 characters required.')).toBeVisible();
  });

  test('submit incident report creates an INC-HTL- reference', async ({ page }) => {
    const selects = page.locator('select.form-input');
    await selects.nth(0).selectOption({ value: WAFFLES });            // Select Pet
    await selects.nth(1).selectOption({ value: 'ILLNESS' });          // Incident Type

    await page.getByPlaceholder(/Describe symptoms/).fill('Vomiting and lethargy observed for over 2 hours');

    const now = new Date(); now.setMinutes(0, 0, 0);
    await page.locator('input[type="datetime-local"]').fill(now.toISOString().slice(0, 16));
    await page.getByPlaceholder(/STAFF-/).fill('STAFF-007');
    await selects.nth(2).selectOption({ value: FACILITY });           // Facility

    await page.getByRole('button', { name: 'Submit Incident Report' }).click();

    await expect(page.getByText(/INC-HTL-/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Coverage Status/)).toBeVisible();
  });

  test('active policy incident shows Full Policy Coverage', async ({ page }) => {
    const selects = page.locator('select.form-input');
    await selects.nth(0).selectOption({ value: WAFFLES });
    await selects.nth(1).selectOption({ value: 'INJURY' });
    await page.getByPlaceholder(/Describe symptoms/).fill('Dog limping on front right leg after outdoor play');

    const now = new Date(); now.setMinutes(0, 0, 0);
    await page.locator('input[type="datetime-local"]').fill(now.toISOString().slice(0, 16));
    await page.getByPlaceholder(/STAFF-/).fill('STAFF-012');
    await selects.nth(2).selectOption({ value: FACILITY });

    await page.getByRole('button', { name: 'Submit Incident Report' }).click();

    await expect(page.getByText('Full Policy Coverage')).toBeVisible({ timeout: 10_000 });
  });
});

// ─── Loyalty Dashboard ────────────────────────────────────────────────────────

test.describe('Loyalty Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await clickTab(page, 'Loyalty Dashboard');
    await waitForPets(page);
  });

  test('page shows Loyalty Event Log table header', async ({ page }) => {
    await expect(page.getByText('Loyalty Event Log')).toBeVisible();
  });

  test('firing VET_VISIT_DISCOUNT shows success message', async ({ page }) => {
    const simSection = page.locator('.card').filter({ hasText: 'Simulate Loyalty Event' });
    await simSection.locator('select.form-input').nth(0).selectOption({ value: WAFFLES });
    await simSection.locator('select.form-input').nth(1).selectOption({ value: 'VET_VISIT_DISCOUNT' });
    await simSection.getByRole('button', { name: 'Fire Event' }).click();

    await expect(page.getByText('Loyalty event applied successfully.')).toBeVisible({ timeout: 8_000 });
  });

  test('CHECKOUT_DEDUCTIBLE_CREDIT (UI auto-sends stayDays:6) succeeds', async ({ page }) => {
    const simSection = page.locator('.card').filter({ hasText: 'Simulate Loyalty Event' });
    await simSection.locator('select.form-input').nth(0).selectOption({ value: WAFFLES });
    await simSection.locator('select.form-input').nth(1).selectOption({ value: 'CHECKOUT_DEDUCTIBLE_CREDIT' });
    await simSection.getByRole('button', { name: 'Fire Event' }).click();

    await expect(page.getByText('Loyalty event applied successfully.')).toBeVisible({ timeout: 8_000 });
  });
});
