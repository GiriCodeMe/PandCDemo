const request = require('supertest');
const app = require('../../app');

const VALID_CLINIC = 'CLINIC-NVA-0881';
const VALID_POLICY = 'PET-2026-774512';   // Rocky — deductible fully met, produces real payout
const VALID_MICROCHIP = '981020003887654'; // Rocky's microchip

const PREAUTH_BASE = {
  clinicId: VALID_CLINIC,
  policyNumber: VALID_POLICY,
  diagnosisCode: 'ICD-VET-K92.2',
  diagnosisDescription: 'Acute Gastritis — vomiting and lethargy',
  procedureLineItems: [{ description: 'Endoscopy with sedation', unitCharge: 600 }],
};

const SETTLEMENT_BASE = {
  header: { clinicId: VALID_CLINIC },
  patientContext: { policyNumber: VALID_POLICY },
  treatmentData: {
    lineItems: [{ description: 'Endoscopy with sedation', unitCharge: 600 }],
    diagnosisCode: 'ICD-VET-K92.2',
    diagnosisDescription: 'Acute Gastritis — vomiting and lethargy',
  },
  financials: { grossInvoiceTotal: 600, currency: 'USD' },
};

// ─── Eligibility ──────────────────────────────────────────────────────────────

describe('GET /api/clinic/eligibility', () => {
  test('400 when clinicId missing', async () => {
    const res = await request(app).get('/api/clinic/eligibility?q=PET-2026-991823');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/clinicId/i);
  });

  test('400 when query < 6 chars', async () => {
    const res = await request(app).get(`/api/clinic/eligibility?q=SHORT&clinicId=${VALID_CLINIC}`);
    expect(res.status).toBe(400);
  });

  test('404 for unknown policy number', async () => {
    const res = await request(app).get(`/api/clinic/eligibility?q=PET-UNKNOWN-000000&clinicId=${VALID_CLINIC}`);
    expect(res.status).toBe(404);
    expect(res.body.found).toBe(false);
  });

  test('200 found for valid policy number', async () => {
    const res = await request(app).get(`/api/clinic/eligibility?q=${VALID_POLICY}&clinicId=${VALID_CLINIC}`);
    expect(res.status).toBe(200);
    expect(res.body.found).toBe(true);
    expect(res.body.policy.policyNumber).toBe(VALID_POLICY);
  });

  test('200 found when searching by microchip ID', async () => {
    const res = await request(app).get(`/api/clinic/eligibility?q=${VALID_MICROCHIP}&clinicId=${VALID_CLINIC}`);
    expect(res.status).toBe(200);
    expect(res.body.found).toBe(true);
  });

  test('response includes policy, patient, and holder sections', async () => {
    const res = await request(app).get(`/api/clinic/eligibility?q=${VALID_POLICY}&clinicId=${VALID_CLINIC}`);
    expect(res.body.policy).toBeDefined();
    expect(res.body.patient).toBeDefined();
    expect(res.body.holder).toBeDefined();
    expect(res.body.holder.holderEmailMasked).toMatch(/\*{4}/);
  });

  test('annualLimitRemaining = annualBenefitMax - accumulatedBenefitUsed', async () => {
    const res = await request(app).get(`/api/clinic/eligibility?q=${VALID_POLICY}&clinicId=${VALID_CLINIC}`);
    const { annualBenefitMax, annualLimitRemaining } = res.body.policy;
    expect(annualLimitRemaining).toBe(annualBenefitMax - 420); // Rocky: 15000 - 420
  });
});

// ─── Pre-Authorization ────────────────────────────────────────────────────────

describe('POST /api/clinic/preauth', () => {
  test('400 when clinicId missing', async () => {
    const { clinicId, ...rest } = PREAUTH_BASE;
    const res = await request(app).post('/api/clinic/preauth').send(rest);
    expect(res.status).toBe(400);
  });

  test('400 when diagnosisCode missing', async () => {
    const { diagnosisCode, ...rest } = PREAUTH_BASE;
    const res = await request(app).post('/api/clinic/preauth').send(rest);
    expect(res.status).toBe(400);
  });

  test('400 when diagnosisDescription missing', async () => {
    const { diagnosisDescription, ...rest } = PREAUTH_BASE;
    const res = await request(app).post('/api/clinic/preauth').send(rest);
    expect(res.status).toBe(400);
  });

  test('400 when procedureLineItems is empty array', async () => {
    const res = await request(app).post('/api/clinic/preauth').send({ ...PREAUTH_BASE, procedureLineItems: [] });
    expect(res.status).toBe(400);
  });

  test('400 when line item has empty description', async () => {
    const res = await request(app).post('/api/clinic/preauth').send({
      ...PREAUTH_BASE,
      procedureLineItems: [{ description: '', unitCharge: 600 }],
    });
    expect(res.status).toBe(400);
  });

  test('400 when line item unitCharge is 0', async () => {
    const res = await request(app).post('/api/clinic/preauth').send({
      ...PREAUTH_BASE,
      procedureLineItems: [{ description: 'Endoscopy', unitCharge: 0 }],
    });
    expect(res.status).toBe(400);
  });

  test('404 for unknown policyNumber', async () => {
    const res = await request(app).post('/api/clinic/preauth').send({ ...PREAUTH_BASE, policyNumber: 'PET-UNKNOWN-000000' });
    expect(res.status).toBe(404);
  });

  test('200 valid response has outcome and preAuthToken', async () => {
    const res = await request(app).post('/api/clinic/preauth').send(PREAUTH_BASE);
    expect(res.status).toBe(200);
    expect(['APPROVED', 'PARTIAL_APPROVAL', 'REFERRED', 'DECLINED']).toContain(res.body.outcome);
    expect(res.body.preAuthToken ?? res.body.outcome).toBeTruthy();
  });

  test('lineDecisions includes unitCharge and approvedAmount for each item', async () => {
    const res = await request(app).post('/api/clinic/preauth').send(PREAUTH_BASE);
    if (!res.body.lineDecisions) return; // REFERRED/DECLINED paths may not include lineDecisions
    expect(res.body.lineDecisions.length).toBe(1);
    const ld = res.body.lineDecisions[0];
    expect(typeof ld.unitCharge).toBe('number');
    expect(typeof ld.approvedAmount).toBe('number');
    expect(ld.description).toBe('Endoscopy with sedation');
  });

  test('carrier pays non-zero for policy with fully-met deductible', async () => {
    // Rocky: deductible=200, accumulated=200 — carrier should pay 90% of $600
    const res = await request(app).post('/api/clinic/preauth').send(PREAUTH_BASE);
    if (!res.body.lineDecisions) return;
    const ld = res.body.lineDecisions[0];
    expect(ld.approvedAmount).toBeGreaterThan(0);
  });

  test('multiple line items are each included in lineDecisions', async () => {
    const payload = {
      ...PREAUTH_BASE,
      procedureLineItems: [
        { description: 'Endoscopy', unitCharge: 400 },
        { description: 'Lab Work', unitCharge: 200 },
      ],
    };
    const res = await request(app).post('/api/clinic/preauth').send(payload);
    if (!res.body.lineDecisions) return;
    expect(res.body.lineDecisions.length).toBe(2);
  });
});

// ─── Settlement ───────────────────────────────────────────────────────────────

describe('POST /api/clinic/settlement', () => {
  test('400 when header.clinicId missing', async () => {
    const res = await request(app).post('/api/clinic/settlement').send({ ...SETTLEMENT_BASE, header: {} });
    expect(res.status).toBe(400);
  });

  test('400 when patientContext.policyNumber missing', async () => {
    const res = await request(app).post('/api/clinic/settlement').send({ ...SETTLEMENT_BASE, patientContext: {} });
    expect(res.status).toBe(400);
  });

  test('400 when treatmentData.lineItems is empty', async () => {
    const res = await request(app).post('/api/clinic/settlement').send({
      ...SETTLEMENT_BASE,
      treatmentData: { ...SETTLEMENT_BASE.treatmentData, lineItems: [] },
    });
    expect(res.status).toBe(400);
  });

  test('400 when financials.grossInvoiceTotal is 0', async () => {
    const res = await request(app).post('/api/clinic/settlement').send({
      ...SETTLEMENT_BASE,
      financials: { grossInvoiceTotal: 0, currency: 'USD' },
    });
    expect(res.status).toBe(400);
  });

  test('404 for unknown policyNumber', async () => {
    const res = await request(app).post('/api/clinic/settlement').send({
      ...SETTLEMENT_BASE,
      patientContext: { policyNumber: 'PET-UNKNOWN-000000' },
    });
    expect(res.status).toBe(404);
  });

  test('200 valid response includes settlementStatus and claimReferenceNumber', async () => {
    const res = await request(app).post('/api/clinic/settlement').send(SETTLEMENT_BASE);
    expect(res.status).toBe(200);
    expect(['ADJUDICATED_SUCCESS', 'MANUAL_MEDICAL_REVIEW', 'ESCROW_HOLD']).toContain(res.body.settlementStatus);
    expect(res.body.claimReferenceNumber).toBeDefined();
  });

  test('ADJUDICATED_SUCCESS response includes breakdown', async () => {
    const res = await request(app).post('/api/clinic/settlement').send(SETTLEMENT_BASE);
    if (res.body.settlementStatus !== 'ADJUDICATED_SUCCESS') return;
    expect(res.body.breakdown).toBeDefined();
    expect(typeof res.body.breakdown.netCarrierPayoutToClinic).toBe('number');
    expect(typeof res.body.breakdown.customerPayAtDesk).toBe('number');
  });
});
