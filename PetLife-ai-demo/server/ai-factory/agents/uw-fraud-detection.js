const modelTier = 'fast';

function buildPrompt({ application, previousResults }) {
  const riskCtx = previousResults?.risk_assessment?.findings || 'No prior risk assessment available.';
  return `You are a Fraud Detection Agent for PetLife AI Insurance.

APPLICATION DATA:
${JSON.stringify(application, null, 2)}

RISK ASSESSMENT CONTEXT: ${riskCtx}

Check for: application inconsistencies, breed misrepresentation signals, suspicious inception timing relative to known conditions, microchip cross-reference anomalies, prior claim history patterns that suggest moral hazard.

Return ONLY valid JSON:
{
  "agent": "Fraud Detection Agent",
  "is_suspicious": false,
  "fraud_risk_level": "LOW",
  "fraud_indicators": [],
  "fraud_score": 0.04,
  "cross_references_checked": ["Microchip database", "Prior claim history", "Application consistency"],
  "findings": "2-3 sentence fraud assessment summary.",
  "risk_contribution": 0.05
}`;
}

module.exports = { modelTier, buildPrompt };
