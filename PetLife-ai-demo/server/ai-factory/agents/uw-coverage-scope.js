const modelTier = 'fast';

function buildPrompt({ application, previousResults }) {
  const riskProfile = previousResults?.risk_assessment?.findings || 'Standard actuarial risk profile.';
  const pricingNote = previousResults?.pricing?.findings || '';
  return `You are a Coverage Scoping Agent for PetLife AI Insurance.

APPLICATION DATA:
${JSON.stringify(application, null, 2)}

RISK PROFILE: ${riskProfile}
PRICING CONTEXT: ${pricingNote}

Determine the exact coverage scope: which conditions to exclude based on declared medical history, breed-specific waiting periods, coverage sub-limits, and required endorsements under US pet insurance regulatory guidelines.

Return ONLY valid JSON:
{
  "agent": "Coverage Scoping Agent",
  "exclusions": ["Pre-existing condition: Hip Dysplasia — bilateral"],
  "endorsements": ["Standard Accident & Illness coverage"],
  "waiting_periods": {
    "accident_days": 0,
    "illness_days": 14,
    "orthopedic_months": 6,
    "cruciate_months": 6
  },
  "special_conditions": [],
  "coverage_notes": ["Note about specific coverage boundary"],
  "findings": "2-3 sentence coverage scoping summary for the underwriter.",
  "risk_contribution": null
}`;
}

module.exports = { modelTier, buildPrompt };
