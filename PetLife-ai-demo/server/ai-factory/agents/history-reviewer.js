const modelTier = 'vision';

function buildPrompt({ policy_inception_date, species = 'canine' }) {
  return `You are a veterinary medical historian. Review these medical records comprehensively.

Policy inception date: ${policy_inception_date}
Species: ${species}

Identify:
1. All medical events in chronological order
2. Pre-existing conditions (first noted BEFORE policy inception date)
3. Chronic/recurring conditions
4. Overall health assessment

Return ONLY a valid JSON object:
{
  "date_range": {"earliest": "YYYY-MM-DD", "latest": "YYYY-MM-DD"},
  "total_events": 0,
  "timeline_events": [
    {
      "date": "YYYY-MM-DD",
      "event_type": "VISIT|DIAGNOSIS|TREATMENT|SURGERY|PRESCRIPTION|TEST",
      "description": "string",
      "diagnoses": ["string"],
      "treatments": ["string"],
      "clinic": "string"
    }
  ],
  "pre_existing_conditions": [
    {
      "condition": "string",
      "first_noted": "YYYY-MM-DD",
      "classification": "CONFIRMED|PROBABLE|POSSIBLE",
      "icd10_code": "string",
      "is_chronic": false,
      "rule_applied": "PE-01"
    }
  ],
  "chronic_conditions": [
    {
      "condition": "string",
      "occurrence_count": 0,
      "duration_months": 0,
      "current_status": "ACTIVE|MANAGED|RESOLVED"
    }
  ],
  "overall_assessment": "string",
  "recommendation": "APPROVE_CLEAN|APPROVE_WITH_EXCLUSIONS|REFER|DECLINE"
}`;
}

module.exports = { modelTier, buildPrompt };
