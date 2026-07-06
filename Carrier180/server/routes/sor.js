const express = require('express');
const router = express.Router();
const mockPolicies = require('../data/mockPolicies');
const mockClaims = require('../data/mockClaims');

/* GET /api/sor/policies/:policyNumber */
router.get('/policies/:policyNumber', (req, res) => {
  const policy = mockPolicies[req.params.policyNumber];
  if (!policy) return res.status(404).json({ error: 'Policy not found' });
  res.json(policy);
});

/* GET /api/sor/policies/:policyNumber/coverages — eligibility check */
router.get('/policies/:policyNumber/coverages', (req, res) => {
  const policy = mockPolicies[req.params.policyNumber];
  if (!policy) return res.status(404).json({ error: 'Policy not found' });

  const { causeOfLoss } = req.query;
  const coverages = policy.coverages;

  let eligible = [];
  let excluded = false;

  if (causeOfLoss) {
    const lossLower = causeOfLoss.toLowerCase();
    if (policy.exclusions.some(e => lossLower.includes(e.toLowerCase()))) {
      excluded = true;
    }
    eligible = Object.entries(coverages)
      .filter(([key]) => {
        if (lossLower.includes('water') || lossLower.includes('flood')) return ['waterDamage', 'moldRemediation', 'sewerBackup'].includes(key);
        if (lossLower.includes('fire') || lossLower.includes('smoke')) return ['fire', 'smokeDamage', 'ale'].includes(key);
        if (lossLower.includes('wind') || lossLower.includes('hail') || lossLower.includes('roof')) return ['windDamage', 'hailDamage'].includes(key);
        return true;
      })
      .map(([key, val]) => ({ coverage: key, ...val }));
  } else {
    eligible = Object.entries(coverages).map(([key, val]) => ({ coverage: key, ...val }));
  }

  res.json({ policyNumber: req.params.policyNumber, excluded, eligible });
});

/* GET /api/sor/claims/history/:policyNumber — prior claims */
router.get('/claims/history/:policyNumber', (req, res) => {
  const prior = mockClaims
    .filter(c => c.policyNumber === req.params.policyNumber)
    .map(c => ({ id: c.id, dateOfLoss: c.dateOfLoss, causeOfLoss: c.causeOfLoss, claimAmount: c.claimAmount, status: c.status }));
  res.json({ policyNumber: req.params.policyNumber, claims: prior, total: prior.length });
});

/* GET /api/sor/policies — list all */
router.get('/policies', (req, res) => {
  res.json(Object.values(mockPolicies));
});

module.exports = router;
