const modelTier = 'fast';

function buildPrompt({ invoice, policy }) {
  return `You are a pet insurance claims adjudicator. Apply policy rules to determine claim outcomes.

POLICY:
${JSON.stringify(policy, null, 2)}

INVOICE:
${JSON.stringify(invoice, null, 2)}

Apply rules:
R-01: Waiting period check (30 days from policy_start_date)
R-02: Excluded conditions/procedures check
R-03: Annual benefit cap (annual_benefit_max - annual_benefit_used = remaining)
R-04: Category limits (category_limits object)
R-05: Deductible (annual, check if deductible_met)
R-06: Coinsurance (owner pays coinsurance_pct %)
R-07: Per-incident cap
R-08: Pre-existing conditions (excluded_conditions list)

Return ONLY a valid JSON object:
{
  "claim_id": "CLM-${Date.now()}",
  "decision": "APPROVED|PARTIAL|DENIED",
  "total_billed": 0.00,
  "total_approved": 0.00,
  "deductible_applied": 0.00,
  "coinsurance_applied": 0.00,
  "line_decisions": [
    {
      "description": "string",
      "billed_amount": 0.00,
      "eligible_amount": 0.00,
      "approved_amount": 0.00,
      "status": "APPROVED|PARTIAL|DENIED",
      "denial_reason": "string or null",
      "applied_rules": ["R-01"]
    }
  ],
  "explanation": "string"
}`;
}

module.exports = { modelTier, buildPrompt };
