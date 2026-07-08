const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiFactory = require('../ai-factory/factory');
const invoiceParserAgent = require('../ai-factory/agents/invoice-parser');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ── Mock EIS ClaimCore Data ──────────────────────────────────────────────────
const EIS_POLICIES = [
  {
    policyNumber: 'PET-2026-991823',
    ownerCustomerId: 'CUST-44129',
    petId: 'PET-7721',
    petName: 'Waffles',
    species: 'Canine',
    breed: 'Beagle',
    dob: '2022-05-10',
    holderName: 'Jordan Rivera',
    holderEmail: 'j.rivera@example.com',
    postcode: '08540',
    coverageType: 'ACCIDENT_ILLNESS',
    annualBenefitMax: 10000,
    deductible: 250,
    Accumulated_Deductible_Balance: 0,
    coinsurancePct: 20,
    termStart: '2026-06-01',
    termEnd: '2027-06-01',
    issueDate: '2026-06-01',
    status: 'ACTIVE',
    waitingPeriodDays: { accident: 0, illness: 14 },
  },
  {
    policyNumber: 'PET-2026-774512',
    ownerCustomerId: 'CUST-88204',
    petId: 'PET-3341',
    petName: 'Rocky',
    species: 'Canine',
    breed: 'German Shepherd',
    dob: '2019-02-28',
    holderName: 'Mia Thompson',
    holderEmail: 'mia.t@example.com',
    postcode: '90210',
    coverageType: 'COMPREHENSIVE',
    annualBenefitMax: 15000,
    deductible: 200,
    Accumulated_Deductible_Balance: 200,
    coinsurancePct: 10,
    termStart: '2025-11-01',
    termEnd: '2026-11-01',
    issueDate: '2025-11-01',
    status: 'ACTIVE',
    waitingPeriodDays: { accident: 0, illness: 14 },
  },
  {
    policyNumber: 'PET-2026-330091',
    ownerCustomerId: 'CUST-11730',
    petId: 'PET-9902',
    petName: 'Cleo',
    species: 'Feline',
    breed: 'Siamese',
    dob: '2020-08-14',
    holderName: 'Tyler Nguyen',
    holderEmail: 'tyler.n@example.com',
    postcode: '10001',
    coverageType: 'PREMIUM',
    annualBenefitMax: 25000,
    deductible: 100,
    Accumulated_Deductible_Balance: 100,
    coinsurancePct: 10,
    termStart: '2025-09-15',
    termEnd: '2026-09-15',
    issueDate: '2025-09-15',
    status: 'ACTIVE',
    waitingPeriodDays: { accident: 0, illness: 14 },
  },
  {
    policyNumber: 'PET-2026-558834',
    ownerCustomerId: 'CUST-29017',
    petId: 'PET-5512',
    petName: 'Daisy',
    species: 'Canine',
    breed: 'Labrador Retriever',
    dob: '2021-11-03',
    holderName: 'Priya Sharma',
    holderEmail: 'p.sharma@example.com',
    postcode: '77001',
    coverageType: 'ACCIDENT_ILLNESS',
    annualBenefitMax: 8000,
    deductible: 300,
    Accumulated_Deductible_Balance: 150,
    coinsurancePct: 20,
    termStart: '2026-01-10',
    termEnd: '2027-01-10',
    issueDate: '2026-01-10',
    status: 'ACTIVE',
    waitingPeriodDays: { accident: 0, illness: 14 },
  },
  {
    policyNumber: 'PET-2026-119023',
    ownerCustomerId: 'CUST-63901',
    petId: 'PET-1188',
    petName: 'Biscuit',
    species: 'Canine',
    breed: 'French Bulldog',
    dob: '2020-07-22',
    holderName: 'Michael Chen',
    holderEmail: 'mchen@example.com',
    postcode: '90210',
    coverageType: 'COMPREHENSIVE',
    annualBenefitMax: 15000,
    deductible: 250,
    Accumulated_Deductible_Balance: 0,
    coinsurancePct: 20,
    termStart: '2026-06-20',  // issued < 30 days ago — triggers FNOL-T03 for large invoices
    termEnd: '2027-06-20',
    issueDate: '2026-06-20',
    status: 'ACTIVE',
    waitingPeriodDays: { accident: 0, illness: 14 },
  },
];

// In-memory open claims store (simulates ClaimCore database)
const OPEN_CLAIMS = [
  {
    claimId: 'CLM-2026-00000001',
    petId: 'PET-3341',
    policyNumber: 'PET-2026-774512',
    primarySymptomCategory: 'Orthopedic',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    grossAmount: 420.00,
  },
];

// ── Triage Engine ─────────────────────────────────────────────────────────────
function runTriageRules(payload, policy) {
  const triageResults = [];
  const today = new Date();
  const dos = new Date(payload.invoiceMetadata.dateOfService);
  const grossAmount = payload.invoiceMetadata.financialSummary.grossInvoiceAmount;
  const policyIssueDate = new Date(policy.issueDate);
  const termStart = new Date(policy.termStart);
  const petId = payload.claimantContext.petId;
  const symCategory = payload.customerDeclaration.primarySymptomCategory;

  // FNOL-T01: Account Deductible Sync
  const deductibleRemaining = policy.deductible - policy.Accumulated_Deductible_Balance;
  triageResults.push({
    ruleId: 'FNOL-T01',
    name: 'Account Deductible Sync',
    triggered: true,
    metadata: {
      annualDeductible: policy.deductible,
      accumulatedBalance: policy.Accumulated_Deductible_Balance,
      remainingDeductible: Math.max(0, deductibleRemaining),
      deductibleMet: deductibleRemaining <= 0,
    },
    note: deductibleRemaining <= 0
      ? `Deductible fully met ($${policy.deductible}). Claim processes at coinsurance rate only.`
      : `$${Math.max(0, deductibleRemaining).toFixed(2)} deductible balance remaining before reimbursement applies.`,
  });

  // FNOL-T02: Multi-Claim Triage Grouping
  const windowMs = 14 * 24 * 60 * 60 * 1000;
  const relatedClaim = OPEN_CLAIMS.find(c =>
    c.petId === petId &&
    c.primarySymptomCategory === symCategory &&
    c.status === 'OPEN' &&
    (today - new Date(c.createdAt)) <= windowMs
  );
  triageResults.push({
    ruleId: 'FNOL-T02',
    name: 'Multi-Claim Triage Grouping',
    triggered: !!relatedClaim,
    metadata: relatedClaim ? { parentClaimId: relatedClaim.claimId, linkedAs: 'Supplemental Invoice Addendum' } : null,
    note: relatedClaim
      ? `Linked as Supplemental Invoice Addendum to ${relatedClaim.claimId}. Multi-deductible application prevented.`
      : 'No open claim within 14-day window for same symptom category. New claim file created.',
  });

  // FNOL-T03: Immediate Fraud Scoring
  const daysSinceIssue = Math.floor((today - policyIssueDate) / (1000 * 60 * 60 * 24));
  const fraudTrigger = grossAmount > 3500 && daysSinceIssue <= 30;
  triageResults.push({
    ruleId: 'FNOL-T03',
    name: 'Immediate Fraud Scoring',
    triggered: fraudTrigger,
    metadata: fraudTrigger ? { flag: 'FRD-SUSPECT-NEW-POLICY', routedTo: 'SIU Workspace', grossAmount, daysSinceIssue } : null,
    note: fraudTrigger
      ? `FRD-SUSPECT-NEW-POLICY flag appended. Invoice $${grossAmount} + policy issued ${daysSinceIssue} days ago. Routed to SIU.`
      : `No fraud indicators. Invoice $${grossAmount.toFixed(2)} and policy age ${daysSinceIssue} days within normal parameters.`,
  });

  // FNOL-T04: Waiting Period Validation
  const illnessWaitMs = (policy.waitingPeriodDays?.illness || 14) * 24 * 60 * 60 * 1000;
  const waitEnd = new Date(termStart.getTime() + illnessWaitMs);
  const inWaitingPeriod = dos < waitEnd && dos >= termStart;
  triageResults.push({
    ruleId: 'FNOL-T04',
    name: 'Waiting Period Validation',
    triggered: inWaitingPeriod,
    metadata: inWaitingPeriod
      ? { priorityCode: 'WAITING_PERIOD_REVIEW', waitPeriodEnd: waitEnd.toISOString().split('T')[0], dateOfService: payload.invoiceMetadata.dateOfService }
      : null,
    note: inWaitingPeriod
      ? `Date of service ${payload.invoiceMetadata.dateOfService} falls within ${policy.waitingPeriodDays?.illness || 14}-day illness waiting period (ends ${waitEnd.toISOString().split('T')[0]}). Priority: WAITING_PERIOD_REVIEW.`
      : `Date of service ${payload.invoiceMetadata.dateOfService} is outside waiting period. Standard processing applies.`,
  });

  const routedToSIU = fraudTrigger;
  const linkedToParent = !!relatedClaim;
  const waitingPeriodReview = inWaitingPeriod;
  const overallTriage = routedToSIU ? 'SIU_REVIEW' : waitingPeriodReview ? 'WAITING_PERIOD_REVIEW' : 'STANDARD_PROCESSING';

  return { triageResults, overallTriage, linkedToParent, parentClaimId: relatedClaim?.claimId || null };
}

function generateClaimRef() {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 90000000 + 10000000));
  return `CLM-${year}-${seq}`;
}

// ── GET /api/fnol/policies — EIS policy list for picker ──────────────────────
router.get('/policies', (req, res) => {
  const safe = EIS_POLICIES.map(p => ({
    policyNumber: p.policyNumber,
    ownerCustomerId: p.ownerCustomerId,
    petId: p.petId,
    petName: p.petName,
    species: p.species,
    breed: p.breed,
    holderName: p.holderName,
    holderEmail: p.holderEmail,
    postcode: p.postcode,
    coverageType: p.coverageType,
    annualBenefitMax: p.annualBenefitMax,
    deductible: p.deductible,
    Accumulated_Deductible_Balance: p.Accumulated_Deductible_Balance,
    termStart: p.termStart,
    termEnd: p.termEnd,
    status: p.status,
    issueDate: p.issueDate,
  }));
  res.json({ policies: safe, total: safe.length });
});

// ── POST /api/fnol/extract — OCR invoice (delegates to invoice parser) ────────
router.post('/extract', upload.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'At least one file required' });
  }
  const primaryFile = req.files[0];
  try {
    const result = await aiFactory.run(invoiceParserAgent, {
      fileBuffer: primaryFile.buffer,
      mimeType: primaryFile.mimetype,
    });
    res.json({ success: true, extracted: result, source: 'gemini', filesProcessed: req.files.length });
  } catch (err) {
    console.warn('[fnol/extract] AI unavailable, using mock:', err.message);
    res.json({
      success: true,
      source: 'fallback',
      filesProcessed: req.files.length,
      extracted: {
        invoice_number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000 + 10000))}`,
        date_of_service: new Date().toISOString().split('T')[0],
        clinic_name: 'Metropolitan Veterinary Hospital',
        clinic_postal_code: '08540',
        line_items: [
          { description: 'Emergency Exam & Triage', amount: 125.00 },
          { description: 'Subcutaneous Fluids', amount: 85.50 },
          { description: 'Cerenia Injection 10mg/ml', amount: 275.00 },
        ],
        total_amount: 485.50,
        currency: 'USD',
        confidence: 0.87,
      },
    });
  }
});

// ── POST /api/fnol/submit — EIS ClaimCore intake + triage ────────────────────
router.post('/submit', (req, res) => {
  const { payload } = req.body;
  if (!payload) return res.status(400).json({ error: 'payload required' });

  const policyNumber = payload.policyReference?.policyNumber;
  const policy = EIS_POLICIES.find(p => p.policyNumber === policyNumber);
  if (!policy) return res.status(404).json({ error: `Policy ${policyNumber} not found in EIS ClaimCore` });

  const claimRef = generateClaimRef();
  const { triageResults, overallTriage, linkedToParent, parentClaimId } = runTriageRules(payload, policy);

  // Persist to in-memory open claims if not linking to parent
  const newClaim = {
    claimId: claimRef,
    petId: payload.claimantContext.petId,
    policyNumber,
    primarySymptomCategory: payload.customerDeclaration.primarySymptomCategory,
    status: overallTriage === 'SIU_REVIEW' ? 'SIU_HOLD' : 'OPEN',
    createdAt: new Date().toISOString(),
    grossAmount: payload.invoiceMetadata.financialSummary.grossInvoiceAmount,
    linkedToParent,
    parentClaimId,
  };
  if (!linkedToParent) OPEN_CLAIMS.push(newClaim);

  const processingDays = {
    Gastrointestinal: 3, Orthopedic: 5, Dermatological: 4, Neurological: 7,
    Respiratory: 4, Dental: 3, Preventive: 2, Emergency: 2, Other: 5,
  };
  const category = payload.customerDeclaration?.primarySymptomCategory || 'Other';
  const estimateDays = processingDays[category] || 5;

  res.json({
    success: true,
    claimReference: claimRef,
    status: newClaim.status,
    overallTriage,
    linkedToParent,
    parentClaimId,
    triageResults,
    policy: {
      policyNumber: policy.policyNumber,
      petName: policy.petName,
      holderName: policy.holderName,
      coverageType: policy.coverageType,
    },
    notification: {
      type: 'push_and_email',
      recipient: policy.holderEmail,
      message: `Your claim ${claimRef} has been received. Current processing target for ${category} reviews is ${estimateDays} business days.`,
      estimateDays,
    },
    committedAt: new Date().toISOString(),
  });
});

module.exports = router;
