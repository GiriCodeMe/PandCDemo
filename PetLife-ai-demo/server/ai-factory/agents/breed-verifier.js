const modelTier = 'vision';

function buildPrompt({ declared_breed, policy_holder = '' }) {
  return `You are a pet breed verification and fraud detection expert. Analyze this pet photo.

Declared breed: ${declared_breed}
Policy holder: ${policy_holder}

Analyze the image and:
1. Identify the top 3 most likely breeds with probability percentages
2. Compare with declared breed and flag mismatches
3. Check for fraud indicators (stock photo, CGI/synthetic, duplicate, low quality)
4. Note observed physical traits and known breed health risks

Return ONLY a valid JSON object:
{
  "declared_breed": "${declared_breed}",
  "identified_breeds": [
    {"breed": "string", "probability": 0.00, "risk_flag": false, "notes": "string"}
  ],
  "breed_match": true,
  "match_confidence": 0.00,
  "risk_level": "LOW|MEDIUM|HIGH",
  "risk_flags": ["string"],
  "fraud_indicators": ["string"],
  "physical_traits_observed": ["string"],
  "breed_health_risks": ["string"],
  "policy_implications": "string",
  "recommendation": "ACCEPT|REFER|REJECT"
}`;
}

module.exports = { modelTier, buildPrompt };
