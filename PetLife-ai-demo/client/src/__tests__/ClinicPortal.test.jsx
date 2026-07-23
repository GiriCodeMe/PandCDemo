import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ClinicPortal from '../pages/ClinicPortal';

vi.mock('../api', () => ({
  clinicEligibility: vi.fn().mockResolvedValue({
    data: {
      found: true,
      queriedAt: '2026-07-23T00:00:00Z',
      clinicId: 'CLINIC-NVA-0881',
      policy: {
        policyNumber: 'PET-2026-774512',
        coverageType: 'COMPREHENSIVE',
        status: 'ACTIVE',
        termStart: '2025-11-01',
        termEnd: '2026-11-01',
        annualBenefitMax: 15000,
        annualLimitRemaining: 14580,
        deductible: 200,
        deductibleRemaining: 0,
        coinsurancePct: 10,
        insurerReimbursementPct: 90,
        exclusionRiders: ['Left Knee Cruciate Exclusion'],
        inWaitingPeriod: false,
        waitingPeriodEndDate: '2025-11-15',
      },
      patient: { petId: 'PET-3341', petName: 'Rocky', species: 'Canine', breed: 'German Shepherd', dob: '2019-02-28', microchipId: '981020003887654' },
      holder: { holderName: 'Mia Thompson', holderEmailMasked: 'm****@example.com', ownerPhone: '+1-310-555-0987', postcode: '90210' },
    },
  }),
  clinicPreauth: vi.fn().mockResolvedValue({
    data: {
      outcome: 'APPROVED',
      preAuthToken: 'PA-4512-ENDO-20260723-ABCDEF',
      tokenExpiry: '2026-08-22',
      procedureTotal: 600,
      lineDecisions: [{ description: 'Endoscopy with sedation', unitCharge: 600, approvedAmount: 540, status: 'APPROVED' }],
      guaranteedPayoutCeiling: { netCarrierPayoutToClinic: 540, customerPayAtDesk: 60 },
      issuedAt: '2026-07-23T12:00:00Z',
    },
  }),
  clinicSettlement: vi.fn().mockResolvedValue({
    data: {
      settlementStatus: 'ADJUDICATED_SUCCESS',
      claimReferenceNumber: 'CLM-2026-TEST-001',
      breakdown: { netCarrierPayoutToClinic: 540, customerPayAtDesk: 60, grossInvoiceTotal: 600 },
      issuedAt: '2026-07-23T12:00:00Z',
    },
  }),
}));

function renderPortal() {
  return render(
    <MemoryRouter>
      <ClinicPortal />
    </MemoryRouter>
  );
}

// ─── Regression: LineItemsTable input focus ───────────────────────────────────

describe('LineItemsTable — input focus regression (was losing focus after 1 char)', () => {
  beforeEach(async () => {
    renderPortal();
    const preAuthTab = screen.getByRole('button', { name: /Pre-Authorization/i });
    await userEvent.setup().click(preAuthTab);
  });

  test('Item Code input retains full text across multiple keystrokes', async () => {
    const user = userEvent.setup();
    renderPortal();
    await user.click(screen.getAllByRole('button', { name: /Pre-Authorization/i })[0]);

    const input = screen.getAllByPlaceholderText('e.g. PROC-001')[0];
    await user.type(input, 'PROC-ENDOSCOPY-001');
    expect(input).toHaveValue('PROC-ENDOSCOPY-001');
  });

  test('Description input retains full text across multiple keystrokes', async () => {
    const user = userEvent.setup();
    renderPortal();
    await user.click(screen.getAllByRole('button', { name: /Pre-Authorization/i })[0]);

    const input = screen.getAllByPlaceholderText('Procedure description')[0];
    await user.type(input, 'Full endoscopy procedure with sedation');
    expect(input).toHaveValue('Full endoscopy procedure with sedation');
  });

  test('Charge input retains value across multiple keystrokes', async () => {
    const user = userEvent.setup();
    renderPortal();
    await user.click(screen.getAllByRole('button', { name: /Pre-Authorization/i })[0]);

    const input = screen.getAllByPlaceholderText('0.00')[0];
    await user.type(input, '600');
    expect(input).toHaveValue(600);
  });
});

// ─── Pre-Auth submit guard ────────────────────────────────────────────────────

describe('ClinicPortal — Pre-Auth submit guard', () => {
  test('Submit button is disabled before any fields are filled', async () => {
    renderPortal();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Pre-Authorization/i }));
    const btn = screen.getByRole('button', { name: /Request Pre-Authorization/i });
    expect(btn).toBeDisabled();
  });
});

// ─── Settlement tab auto-populate ────────────────────────────────────────────

describe('ClinicPortal — Settlement tab auto-populates policy from eligibility', () => {
  test('policy number appears in settlement tab after eligibility search', async () => {
    renderPortal();
    const user = userEvent.setup();

    // Select a clinic
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'CLINIC-NVA-0881');

    // Search for a policy
    const searchInput = screen.getByPlaceholderText(/microchip.*policy.*phone/i);
    await user.type(searchInput, 'PET-2026-774512');
    await user.click(screen.getByRole('button', { name: /^Search$/i }));

    // Wait for result, then switch to Settlement tab
    await screen.findByText(/Rocky/i);
    await user.click(screen.getByRole('button', { name: /Settlement/i }));

    // Policy number should be pre-filled in settlement tab
    const policyInput = screen.getByDisplayValue('PET-2026-774512');
    expect(policyInput).toBeTruthy();
  });
});
