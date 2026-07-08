const express = require('express');
const router = express.Router();
const aiFactory = require('../ai-factory/factory');
const pawspectAgent = require('../ai-factory/agents/pawspect');

router.post('/chat', async (req, res) => {
  const { message, pageContext, history } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });

  try {
    const answer = await aiFactory.run(pawspectAgent, { message, pageContext, history });
    res.json({ answer, source: 'gemini' });
  } catch (err) {
    console.warn('[pawspect] AI unavailable, using fallback:', err.message);
    res.json({ answer: getFallbackAnswer(message, pageContext), source: 'fallback' });
  }
});

function getFallbackAnswer(message, pageContext) {
  const msg = message.toLowerCase();
  const page = pageContext?.page || '';

  if (msg.includes('risk') || msg.includes('score')) {
    return '**Risk Score** in PetLife UW ranges from 0 (minimal risk) to 1.0 (high risk).\n\n- **0–0.35**: STANDARD tier — straight-through processing eligible\n- **0.35–0.65**: SUBSTANDARD — accepted with breed loadings or exclusions\n- **0.65+**: REFER or DECLINE\n\nKey risk drivers include breed (brachycephalic dogs carry elevated respiratory risk), age (>7 years adds 15% loading), and prior claim history.';
  }
  if (msg.includes('fraud') || msg.includes('behaviour') || msg.includes('behavioral') || msg.includes('behavioural')) {
    return '**Fraud detection** runs a two-tier pipeline:\n\n**Tier 1 — System Checks (automated):**\n- Duplicate Invoice Detection\n- Vet Clinic ID Validation\n- Policy Active at Date of Service\n- Claim Amount vs History\n\n**Tier 2 — AI Behavioural Checks (Gemini-powered):**\n- **Invoice Tampering** (CRITICAL): Detects metadata alteration, font/pixel inconsistencies, or re-used invoice numbers. Triggers **SIU referral + payment freeze**.\n- **Unusual Vet-Owner Pattern** (HIGH): Flags anomalous relationships between the vet clinic and policyholder. Triggers **payment block + adjudicator warning**.\n- **Rapid High-Value Submission** (MEDIUM): Detects high-value claims submitted suspiciously soon after policy inception. **Flagged for medical audit**.\n\n**Score routing:** < 50 = STP eligible · 50–79 = manual review required · ≥ 80 = SIU referral, payment frozen.';
  }
  if (msg.includes('reserve') || msg.includes('accumulator')) {
    return '**Reserve calculation** follows REQRES-1.2 pipeline:\n\n1. **Initial Reserve** = min(Gross Invoice, Remaining Annual Limit)\n2. **Deductible Ingestion** — subtract remaining annual deductible\n3. **Co-insurance** — apply policy reimbursement % (e.g., 80%)\n4. **Exclusion Deductions** — subtract non-eligible line items\n5. **Net Reserve** — posted to financial ledger\n\nReserve erosion (REQRES-1.3) fires within 500ms when any line item is denied.';
  }
  if (msg.includes('stp') || msg.includes('straight')) {
    return '**Straight-Through Processing (STP)** means a claim or UW application is auto-approved without manual review.\n\n**STP qualifies when:**\n- Fraud score < 50 (LOW tier)\n- Risk score ≤ 0.35 (STANDARD tier)\n- No CRE rule flags triggered\n- Claim amount within expected historical range\n\nSTP reduces processing time from days to seconds.';
  }
  if (msg.includes('subrogation') || msg.includes('cob')) {
    return '**Subrogation** is the right to recover claim costs from a third party responsible for the loss.\n\n**COB (Coordination of Benefits)** applies when a pet has dual insurance coverage:\n- Liability is split proportionally between carriers\n- Formula: Policy A Share = A Limit / (A Limit + B Limit)\n\n**TPL (Third-Party Liability)** triggers a recovery sub-file when keywords like "attacked at daycare" or "hit by vehicle" appear in the claim narrative.';
  }
  if (msg.includes('compliance') || msg.includes('sla')) {
    return '**Compliance SLA targets:**\n\n- **US (NAIC)**: Acknowledgement within **15 calendar days**\n- **UK (FCA)**: Acknowledgement within **5 business days**\n- **Breach threshold**: Day 20 — compliance supervisor webhook fires\n\n**Authority limits:**\n- Tier 1 Adjuster: max $500/claim\n- Tier 2 Adjuster: max $2,500\n- Claims Manager: max $10,000\n- VP/SIU: unlimited (crypto signature for >$50k)';
  }
  return `I can help with questions about **${page}** including underwriting, claims processing, fraud analysis, and compliance. Try asking about risk scores, reserve calculations, fraud rules, STP eligibility, or subrogation.`;
}

module.exports = router;
