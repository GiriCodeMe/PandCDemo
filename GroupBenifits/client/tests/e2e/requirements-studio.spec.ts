import { test, expect } from '@playwright/test';

test.describe('Requirements Studio', () => {
  test('loads document library with documents', async ({ page }) => {
    await page.goto('/requirements');
    await expect(page.getByRole('heading', { name: 'AI Requirements Studio' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Document Library' })).toBeVisible();
    await expect(page.getByText('Acme_2027_Benefits_Guide.pdf')).toBeVisible();
    await expect(page.getByText('Acme_Eligibility_Policy.pdf')).toBeVisible();
  });

  test('shows summary stat cards', async ({ page }) => {
    await page.goto('/requirements');
    // Stat card labels — use exact:true to avoid substring matches in doc rows
    await expect(page.getByText('Documents uploaded', { exact: true })).toBeVisible();
    await expect(page.getByText('Rules extracted', { exact: true })).toBeVisible();
    await expect(page.getByText('Conflicts detected', { exact: true })).toBeVisible();
  });

  test('can switch to Requirements Workspace view', async ({ page }) => {
    await page.goto('/requirements');
    await page.getByRole('button', { name: 'Requirements Workspace' }).click();
    await expect(page.getByText('Generate from Documents')).toBeVisible({ timeout: 5000 });
  });

  test('requirements workspace loads requirements list', async ({ page }) => {
    await page.goto('/requirements');
    await page.getByRole('button', { name: 'Requirements Workspace' }).click();
    // Use exact:true so only the span with exactly "FR-5.1" matches, not parent buttons
    await expect(page.getByText('FR-5.1', { exact: true })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Supported File Types')).toBeVisible();
  });

  test('can expand a requirement for details', async ({ page }) => {
    await page.goto('/requirements');
    await page.getByRole('button', { name: 'Requirements Workspace' }).click();
    await page.getByText('Supported File Types').first().click();
    await expect(page.getByText(/The system SHALL accept/)).toBeVisible();
  });

  test('upload document form opens', async ({ page }) => {
    await page.goto('/requirements');
    await page.getByRole('button', { name: 'Upload Document' }).click();
    await expect(page.getByPlaceholder(/Acme_2027_SPD/)).toBeVisible();
  });

  test('AI generate button triggers generation', async ({ page }) => {
    await page.goto('/requirements');
    await page.getByRole('button', { name: 'Requirements Workspace' }).click();
    const genBtn = page.getByRole('button', { name: 'Generate from Documents' });
    await expect(genBtn).toBeVisible();
    await genBtn.click();
    await expect(page.getByText(/AI generation complete/)).toBeVisible({ timeout: 10000 });
  });

  test('can filter requirements by category', async ({ page }) => {
    await page.goto('/requirements');
    await page.getByRole('button', { name: 'Requirements Workspace' }).click();
    await expect(page.getByText('FR-5.1', { exact: true })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'AI Extraction', exact: true }).click();
    await expect(page.getByText('FR-5.4', { exact: true })).toBeVisible({ timeout: 5000 });
  });

  test('BenChat shows requirements-specific context', async ({ page }) => {
    await page.goto('/requirements');
    await page.getByRole('button', { name: 'Open BenChat assistant' }).click();
    // Scope to drawer header area which has the context label
    const drawer = page.getByRole('dialog', { name: 'BenChat assistant' });
    await expect(drawer).toBeVisible({ timeout: 5000 });
    await expect(drawer.getByText('AI Requirements Studio').first()).toBeVisible();
    await expect(page.getByText('What is a requirements document lifecycle?')).toBeVisible();
  });
});
