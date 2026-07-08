const modelTier = 'fast';

function buildPrompt({ pet, coverage_type, requested_benefit, health_conditions = [] }) {
  const conditionNote = health_conditions.length > 0
    ? `Pre-existing conditions reported: ${health_conditions.length}. Apply ${(health_conditions.length * 8).toFixed(0)}% loading.`
    : 'No pre-existing conditions reported.';

  return `You are a pet insurance pricing expert. Generate a quote for this application.

PET: ${JSON.stringify(pet)}
Coverage type: ${coverage_type}
Requested annual benefit: $${requested_benefit}
${conditionNote}

Consider breed-specific health risks, age, coverage level, and US market rates.

Return ONLY a valid JSON object:
{
  "quote_id": "QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}",
  "monthly_premium": 0.00,
  "annual_premium": 0.00,
  "risk_level": "LOW|MEDIUM|HIGH",
  "breed_tier": 1,
  "currency": "USD",
  "coverage_summary": {
    "annual_benefit": 0.00,
    "deductible": 0.00,
    "coinsurance_pct": 0,
    "per_incident_max": 0.00,
    "includes_dental": false,
    "includes_wellness": false
  },
  "breed_specific_notes": ["string"],
  "recommended_add_ons": ["string"],
  "exclusions_to_note": ["string"],
  "valid_until": "YYYY-MM-DD",
  "ai_recommendation": "string"
}`;
}

module.exports = { modelTier, buildPrompt };
