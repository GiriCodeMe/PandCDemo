const express = require('express');
const router = express.Router();
const aiFactory = require('../ai-factory/factory');
const claimsAdjudicatorAgent = require('../ai-factory/agents/claims-adjudicator');
const { policies, claimsHistory } = require('../services/mockData');

router.get('/', (req, res) => {
  res.json({ claims: claimsHistory, total: claimsHistory.length });
});

router.post('/adjudicate', async (req, res) => {
  const { invoice, policy_id } = req.body;
  if (!invoice || !policy_id) return res.status(400).json({ error: 'Invoice data and policy_id required' });

  const policy = policies.find(p => p.policy_id === policy_id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });

  try {
    const result = await aiFactory.run(claimsAdjudicatorAgent, { invoice, policy });
    res.json({ success: true, adjudication: result, policy, source: 'gemini' });
  } catch (err) {
    console.warn('[claims] AI unavailable, using fallback:', err.message);
    res.json({ success: true, adjudication: getMockAdjudication(invoice, policy), policy, source: 'fallback' });
  }
});

function getMockAdjudication(invoice, policy) {
  const items = invoice?.line_items && invoice.line_items.length > 0 ? invoice.line_items : [
    { description: 'Consultation Fee',    amount: 85.00  },
    { description: 'Diagnostic Testing',  amount: 320.00 },
    { description: 'Prescribed Medication', amount: 74.50 },
  ];

  const deductible    = policy?.coverage?.deductible     || 200;
  const deductible_met = policy?.coverage?.deductible_met || false;
  const coinsurance   = (policy?.coverage?.coinsurance_pct || 20) / 100;
  const excluded      = policy?.excluded_conditions || [];

  const lineDecisions = items.map(item => {
    const isExcluded = excluded.some(ec => item.description?.toLowerCase().includes(ec.toLowerCase()));
    const eligible   = isExcluded ? 0 : item.amount;
    const approved   = isExcluded ? 0 : parseFloat((eligible * (1 - coinsurance)).toFixed(2));
    return {
      description:      item.description,
      billed_amount:    item.amount,
      eligible_amount:  eligible,
      approved_amount:  approved,
      status:           isExcluded ? 'DENIED' : 'APPROVED',
      applied_rules:    isExcluded ? ['R-02: Excluded condition'] : ['R-01: Within coverage', 'R-05: Coinsurance applied'],
      denial_reason:    isExcluded ? `Condition excluded from policy: ${item.description}` : null,
    };
  });

  const totalBilled    = parseFloat(items.reduce((s, i) => s + (i.amount || 0), 0).toFixed(2));
  const grossApproved  = parseFloat(lineDecisions.reduce((s, l) => s + l.approved_amount, 0).toFixed(2));
  const dedApplied     = deductible_met ? 0 : Math.min(deductible, grossApproved);
  const totalApproved  = parseFloat(Math.max(0, grossApproved - dedApplied).toFixed(2));
  const coinsuranceAmt = parseFloat((grossApproved * coinsurance).toFixed(2));

  const deniedCount = lineDecisions.filter(l => l.status === 'DENIED').length;
  const decision = totalApproved <= 0 ? 'DENIED' : deniedCount > 0 ? 'PARTIAL' : 'APPROVED';

  return {
    decision,
    total_billed:       totalBilled,
    deductible_applied: dedApplied,
    coinsurance_applied: coinsuranceAmt,
    total_approved:     totalApproved,
    line_decisions:     lineDecisions,
    explanation:        `Claim ${decision.toLowerCase()} under ${policy?.coverage?.type || 'standard'} coverage. ${deniedCount} item(s) denied due to policy exclusions. Deductible $${dedApplied.toFixed(2)} applied. Policyholder responsible for ${policy?.coverage?.coinsurance_pct || 20}% coinsurance.`,
  };
}

module.exports = router;
