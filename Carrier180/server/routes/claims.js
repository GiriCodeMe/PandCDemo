const express = require('express');
const router = express.Router();
const mockClaims = require('../data/mockClaims');
const mockPolicies = require('../data/mockPolicies');

/* In-memory store — seeded from mockClaims */
let claims = [...mockClaims];
let nextId = 2200;

/* GET /api/claims — summary list */
router.get('/', (req, res) => {
  const { status, risk, search } = req.query;
  let result = claims;

  if (status && status !== 'All') {
    result = result.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }
  if (risk && risk !== 'All') {
    result = result.filter(c => c.fraudRisk.toLowerCase() === risk.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(c =>
      c.id.toLowerCase().includes(q) ||
      c.insuredName.toLowerCase().includes(q) ||
      c.policyNumber.toLowerCase().includes(q)
    );
  }

  const summary = result.map(c => ({
    id: c.id,
    policyNumber: c.policyNumber,
    insuredName: c.insuredName,
    causeOfLoss: c.causeOfLoss,
    claimAmount: c.claimAmount,
    dateOfLoss: c.dateOfLoss,
    status: c.status,
    adjuster: c.adjuster,
    fraudRisk: c.fraudRisk,
    aiSentiment: c.aiSentiment,
    insuredSegmentation: c.insuredSegmentation,
    currentStep: c.currentStep
  }));

  res.json({ claims: summary, total: summary.length });
});

/* GET /api/claims/stats — KPI aggregates for dashboard */
router.get('/stats', (req, res) => {
  const newClaims = claims.filter(c => c.status === 'New').length;
  const highFraud = claims.filter(c => c.fraudRisk === 'High').length;
  const largeLoss = claims.filter(c => c.claimAmount >= 50000).length;
  const longCycle = claims.filter(c => c.currentStep < 3 && c.dateOfLoss < '2026-03-01').length;

  res.json({
    newClaims,
    largeLossAlerts: largeLoss,
    insuredSentimentAlerts: 6,
    highFraudRisk: highFraud,
    avgCycleTimeOver15: longCycle || 2
  });
});

/* GET /api/claims/prefill/:policyNumber — auto-fill form from policy */
router.get('/prefill/:policyNumber', (req, res) => {
  const policy = mockPolicies[req.params.policyNumber];
  if (!policy) return res.status(404).json({ error: 'Policy not found' });

  const existingClaim = claims.find(c => c.policyNumber === req.params.policyNumber);
  res.json({
    policyNumber: policy.policyNumber,
    insuredName: existingClaim?.insuredName || '',
    phone: existingClaim?.contact?.phone || '',
    email: existingClaim?.contact?.email || '',
    address: existingClaim?.address || { line1: '', line2: '', city: '', state: policy.state?.split(' ')[0] || '', zip: '' }
  });
});

/* GET /api/claims/:id — full detail */
router.get('/:id', (req, res) => {
  const claim = claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  res.json(claim);
});

/* POST /api/claims — create from FNOL form */
router.post('/', (req, res) => {
  const { policyNumber, insuredName, phone, email, address, dateOfLoss, isHomeLivable, typeOfLoss, causeOfLoss, description, documents } = req.body;

  const policy = mockPolicies[policyNumber];
  const id = `2026-${nextId++}`;

  const newClaim = {
    id,
    policyNumber: policyNumber || '',
    customerId: policy ? Object.keys(mockPolicies).indexOf(policyNumber) >= 0 ? `CUST-00${Object.keys(mockPolicies).indexOf(policyNumber) + 1}` : 'CUST-NEW' : 'CUST-NEW',
    insuredName: insuredName || '',
    causeOfLoss: causeOfLoss || '',
    claimAmount: 0,
    dateOfLoss: dateOfLoss || new Date().toISOString().split('T')[0],
    dateSubmitted: new Date().toISOString().split('T')[0],
    status: 'New',
    adjuster: 'Jane Doe',
    fraudRisk: 'Low',
    aiSentiment: 'Neutral',
    insuredSegmentation: policy ? 'Silver' : 'Bronze',
    isHomeLivable: isHomeLivable !== false,
    typeOfLoss: typeOfLoss || '',
    primaryPeril: causeOfLoss || '',
    initialReserves: 0,
    fnolNarrative: description || '',
    address: address || {},
    contact: { phone: phone || '', email: email || '' },
    documents: (documents || []).map((d, i) => ({ id: `doc-new-${i}`, name: d, description: '', size: 'unknown', uploadedAt: new Date().toISOString() })),
    missingDocuments: [],
    dataInconsistencies: [],
    coverageVerification: { status: 'Pending', covered: null, coverages: [], rationale: '' },
    fraudAnalysis: { score: 0, level: 'Low', flags: [] },
    insuredHistory: [],
    communications: [],
    nextSteps: { decisionStatus: 'Pending Review', decisionRationale: '', nextBestActions: [] },
    currentStep: 1,
    region: address?.state === 'TX' ? 'Texas Inland' : 'Florida Coast'
  };

  claims.push(newClaim);
  res.status(201).json(newClaim);
});

/* PATCH /api/claims/:id/step — advance step */
router.patch('/:id/step', (req, res) => {
  const claim = claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  claim.currentStep = req.body.step || claim.currentStep;
  res.json(claim);
});

/* PATCH /api/claims/:id/status — update status */
router.patch('/:id/status', (req, res) => {
  const claim = claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  if (req.body.status) claim.status = req.body.status;
  if (req.body.fraudRisk) claim.fraudRisk = req.body.fraudRisk;
  res.json(claim);
});

module.exports = router;
