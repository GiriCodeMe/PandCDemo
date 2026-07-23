const express = require('express');
const router = express.Router();
const multer = require('multer');
const aiFactory = require('../ai-factory/factory');
const invoiceParserAgent = require('../ai-factory/agents/invoice-parser');
const { EIS_POLICIES, OPEN_CLAIMS, runTriageRules, generateClaimRef } = require('../services/eisData');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ── GET /api/fnol/policies — EIS policy list for picker ──────────────────────
router.get('/policies', (req, res) => {
  const safe = EIS_POLICIES.map(p => ({
    policyNumber: p.policyNumber,
    policy_id: p.policy_id,
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
