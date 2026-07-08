const modelTier = 'complex';

function buildPrompt({ application }) {
  return `You are a senior pet insurance underwriter simulating a multi-agent decision pipeline.

APPLICATION:
${JSON.stringify(application, null, 2)}

Simulate 5 specialist agents making sequential assessments:
1. Risk Assessment Agent: Clinical risk, severity score (0-100), 12-month claim likelihood
2. Fraud Detection Agent: Fraud signals, risk level LOW/MEDIUM/HIGH
3. Pricing Agent: Premium calculation using breed/age/health factors
4. Coverage Scoping Agent: Coverage terms, exclusions, and endorsements
5. Final Decision Agent: Synthesises all inputs and issues binding underwriting decision

Underwriting Rules:
UR-01: Breed tier loading (Tier 1:0%, 2:5%, 3:15%, 4:30%, 5:EXCLUDE)
UR-02: Exclude all confirmed pre-existing conditions
UR-03: Age loading (0-3:0%, 4-6:10%, 7-9:20%, 10+:35%)
UR-04: Chronic condition cap at $3,000/year
UR-05: Cancer history → REFER
UR-06: Fraud signals → DECLINE
UR-07: Standard baseline premium by coverage tier

Return ONLY a valid JSON object:
{
  "job_id": "UW-${Date.now()}",
  "decision": "ACCEPT_STANDARD|ACCEPT_SUBSTANDARD|REFER|DECLINE",
  "recommended_premium": 0.00,
  "risk_score": 0.00,
  "risk_tier": "STANDARD|SUBSTANDARD",
  "agent_reports": [
    {
      "agent": "Risk Assessment Agent",
      "findings": "string",
      "risk_contribution": 0.00
    },
    {
      "agent": "Fraud Detection Agent",
      "findings": "string",
      "risk_contribution": 0.00
    },
    {
      "agent": "Pricing Agent",
      "findings": "string",
      "risk_contribution": null
    },
    {
      "agent": "Coverage Scoping Agent",
      "findings": "string",
      "risk_contribution": null
    },
    {
      "agent": "Final Decision Agent",
      "findings": "string",
      "risk_contribution": null
    }
  ],
  "conditions": ["string"],
  "exclusions": ["string"],
  "endorsements": ["string"],
  "coverage_terms": {
    "annual_benefit": 0,
    "deductible": 0,
    "reimbursement_pct": 80,
    "waiting_period_illness": 14,
    "waiting_period_accident": 0
  },
  "explanation": "string",
  "referral_required": false,
  "confidence": 0.00
}`;
}

module.exports = { modelTier, buildPrompt };
