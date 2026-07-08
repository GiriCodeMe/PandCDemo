const modelTier = 'fast';

function buildPrompt({ application, previousResults }) {
  const riskLoading = previousResults?.risk_assessment?.total_loading_pct || 0;
  const fraudLevel = previousResults?.fraud_detection?.fraud_risk_level || 'LOW';
  const quotePremium = application?.quote_monthly_premium || null;

  return `You are a Pricing Agent for PetLife AI Insurance.

APPLICATION DATA:
${JSON.stringify(application, null, 2)}

UPSTREAM AGENT CONTEXT:
- Actuarial risk loading applied: +${riskLoading}%
- Fraud risk level: ${fraudLevel}
${quotePremium ? `- Quote-time premium already issued to customer: $${quotePremium.toFixed(2)}/mo` : ''}

Calculate the actuarially appropriate US market premium using NAIC pet insurance benchmarks.
Base rates: BASIC=$28/mo, ACCIDENT_ILLNESS=$42-55/mo, COMPREHENSIVE=$70-95/mo, PREMIUM=$95-140/mo.
Apply breed, age, health, and geographic loadings. Currency: USD only.

CRITICAL RULE: Underwriting adds risk loadings — it never discounts.${quotePremium ? ` The final_monthly_premium MUST be >= $${quotePremium.toFixed(2)} (the quote price already seen by the customer). If your calculation produces a lower figure, use $${quotePremium.toFixed(2)} as the floor and document why.` : ''}

Return ONLY valid JSON:
{
  "agent": "Pricing Agent",
  "base_premium": 42.00,
  "breed_loading": 2.10,
  "age_loading": 0.00,
  "health_loading": 0.00,
  "fraud_loading": 0.00,
  "total_loading_pct": 5,
  "final_monthly_premium": 44.10,
  "final_annual_premium": 529.20,
  "currency": "USD",
  "pricing_rationale": "Brief explanation of loading factors applied.",
  "findings": "2-3 sentence premium justification for the underwriter.",
  "risk_contribution": null
}`;
}

module.exports = { modelTier, buildPrompt };
