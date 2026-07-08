const modelTier = 'fast';

function buildPrompt({ application, previousResults }) {
  return `You are a Risk Assessment Agent for PetLife AI Insurance.

APPLICATION DATA:
${JSON.stringify(application, null, 2)}

Evaluate the actuarial risk profile. Consider breed-specific health predispositions, US pet insurance age mortality curves, neutered/spayed status impact, prior medical history, and body condition indicators.

Return ONLY valid JSON matching this exact schema:
{
  "agent": "Risk Assessment Agent",
  "risk_score": 0.32,
  "risk_tier": "STANDARD",
  "risk_factors": ["factor 1", "factor 2"],
  "breed_loading_pct": 5,
  "age_loading_pct": 0,
  "health_loading_pct": 0,
  "total_loading_pct": 5,
  "findings": "2-3 sentence actuarial summary the underwriter will act on.",
  "risk_contribution": 0.25
}`;
}

module.exports = { modelTier, buildPrompt };
