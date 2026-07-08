const modelTier = 'complex';

function buildPrompt({ application, previousResults }) {
  return `You are the Final Decision Agent for PetLife AI Insurance. You receive findings from four specialist agents and issue the binding underwriting recommendation.

APPLICATION DATA:
${JSON.stringify(application, null, 2)}

AGENT PIPELINE FINDINGS:
Risk Assessment: ${JSON.stringify(previousResults?.risk_assessment || {}, null, 2)}
Fraud Detection: ${JSON.stringify(previousResults?.fraud_detection || {}, null, 2)}
Pricing: ${JSON.stringify(previousResults?.pricing || {}, null, 2)}
Coverage Scoping: ${JSON.stringify(previousResults?.coverage_scope || {}, null, 2)}

Issue the binding decision using these criteria:
- ACCEPT_STANDARD: Standard rates, no referral triggers, clean application
- ACCEPT_SUBSTANDARD: Loadings applied, policy bindable with stated exclusions
- REFER: High-risk indicators requiring senior underwriter manual review
- DECLINE: Hard knockout criteria met (age >14, banned breed, ≥3 chronic conditions)

Return ONLY valid JSON:
{
  "agent": "Final Decision Agent",
  "decision": "ACCEPT_STANDARD",
  "recommended_premium": 44.10,
  "risk_score": 0.32,
  "risk_tier": "STANDARD",
  "confidence": 0.93,
  "referral_required": false,
  "exclusions": [],
  "endorsements": ["Standard Accident & Illness"],
  "conditions": [],
  "explanation": "3-4 sentence comprehensive decision rationale.",
  "findings": "2-3 sentence executive summary of the final decision.",
  "risk_contribution": null,
  "policy_bindable": true
}`;
}

module.exports = { modelTier, buildPrompt };
