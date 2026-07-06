const express = require('express');
const router = express.Router();
const { photoReview, addressCompare, fraudVector } = require('../services/aiFactory');
const claims = require('../data/mockClaims');

function getClaim(id) {
  return claims.find(c => c.id === id);
}

// POST /api/ai/photo-review
router.post('/photo-review', async (req, res) => {
  const { claimId } = req.body;
  if (!claimId) return res.status(400).json({ error: 'claimId required' });
  const claim = getClaim(claimId);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  try {
    const result = await photoReview(claim);
    res.json(result);
  } catch (err) {
    console.error('photo-review error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/address-compare
router.post('/address-compare', async (req, res) => {
  const { claimId } = req.body;
  if (!claimId) return res.status(400).json({ error: 'claimId required' });
  const claim = getClaim(claimId);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  try {
    const result = await addressCompare(claim);
    res.json(result);
  } catch (err) {
    console.error('address-compare error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/fraud-vector
router.post('/fraud-vector', async (req, res) => {
  const { claimId } = req.body;
  if (!claimId) return res.status(400).json({ error: 'claimId required' });
  const claim = getClaim(claimId);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  try {
    const result = await fraudVector(claim);
    res.json(result);
  } catch (err) {
    console.error('fraud-vector error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
