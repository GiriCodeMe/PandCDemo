const express = require('express');
const router = express.Router();
const aiFactory = require('../ai-factory/factory');
const quoteGeneratorAgent = require('../ai-factory/agents/quote-generator');

router.post('/generate', async (req, res) => {
  const { pet, holder, coverage_type, requested_benefit, health_conditions } = req.body;
  if (!pet || !holder || !coverage_type) {
    return res.status(400).json({ error: 'Pet info, holder info, and coverage type required' });
  }

  try {
    const result = await aiFactory.run(quoteGeneratorAgent, {
      pet: { ...pet, holder_name: [holder.first_name, holder.last_name].filter(Boolean).join(' ') || holder.name || '', postcode: holder.postcode },
      coverage_type,
      requested_benefit: requested_benefit || 5000,
      health_conditions: health_conditions || [],
    });
    res.json({ success: true, quote: result, source: 'gemini' });
  } catch (err) {
    console.warn('[quote] AI unavailable, using fallback:', err.message);
    res.json({ success: true, quote: getMockQuote(req.body), source: 'fallback' });
  }
});

function getMockQuote(body) {
  const breed     = body?.pet?.breed || 'Mixed Breed';
  const conditions = Array.isArray(body?.health_conditions) ? body.health_conditions : [];
  const tiers = {
    BASIC: 35, ACCIDENT_ILLNESS: 70, STANDARD: 55, COMPREHENSIVE: 120, PREMIUM: 95, WELLNESS: 45,
  };
  const base     = tiers[body?.coverage_type] || 65;
  const surcharge = conditions.length * 0.08;
  const premium  = parseFloat((base * (1 + surcharge)).toFixed(2));
  const riskLevel = conditions.length === 0 ? 'LOW' : conditions.length <= 2 ? 'MEDIUM' : 'HIGH';

  return {
    quote_id:        `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    monthly_premium: premium,
    annual_premium:  parseFloat((premium * 12).toFixed(2)),
    risk_level:      riskLevel,
    breed_tier:      conditions.length === 0 ? 1 : conditions.length <= 2 ? 2 : 3,
    currency:        'USD',
    coverage_summary: {
      annual_benefit:    body?.requested_benefit || 5000,
      deductible:        body?.pet?.deductible   || 250,
      coinsurance_pct:   20,
      per_incident_max:  1500,
      includes_dental:   body?.coverage_type === 'COMPREHENSIVE',
      includes_wellness: body?.coverage_type === 'COMPREHENSIVE' || body?.coverage_type === 'WELLNESS',
    },
    breed_specific_notes: [
      `${breed} has ${riskLevel.toLowerCase()} health risk profile`,
      ...(conditions.length > 0 ? [`${conditions.length} pre-existing condition(s) noted — may affect premium`] : []),
    ],
    recommended_add_ons: ['Dental coverage', 'Complementary therapies'],
    exclusions_to_note: conditions.length > 0
      ? [`Pre-existing conditions reported (${conditions.length}) — subject to underwriting review`]
      : [],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ai_recommendation: conditions.length > 0
      ? `Based on ${conditions.length} reported symptom(s), premium adjusted with a ${(surcharge * 100).toFixed(0)}% loading. Pre-existing conditions may require exclusion riders.`
      : 'Standard coverage recommended based on breed and age profile. No pre-existing conditions reported.',
  };
}

module.exports = router;
