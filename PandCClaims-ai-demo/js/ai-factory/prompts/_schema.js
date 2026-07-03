/* ═══════════════════════════════════════════════════════════════
   AI Factory — Shared JSON Response Schema
   Single source of truth for the output contract all 3 LOB
   prompts return. Change field names here only.
   Attaches to: window._AIPrompts.SCHEMA
   ═══════════════════════════════════════════════════════════════ */
(function (global) {

  global._AIPrompts = global._AIPrompts || {};

  global._AIPrompts.SCHEMA = `{
  "overallConfidence": <float 0.0–1.0, overall AI confidence in the assessment>,
  "policyMatch": <float 0.0–1.0, confidence that narrative matches a valid policy>,
  "damageAssessment": <float 0.0–1.0, confidence in damage estimation accuracy>,
  "fraudDetection": <float 0.0–1.0, inverse fraud risk: 1.0 = very clean, 0.5 = moderate concern>,
  "coverageValidation": <float 0.0–1.0, confidence that loss event falls within coverage>,
  "metadata": {
    "lossType": "<e.g. Auto Collision | Wind & Hail Damage | Commercial Property Fire>",
    "cause": "<specific root cause of the loss>",
    "policyTier": "<estimated insurance product tier>",
    "state": "<full state name and abbreviation>",
    "weather": "<weather conditions at time of loss, or Normal Conditions>",
    "estimatedDamage": "<dollar estimate with $ sign, e.g. $5,750>",
    "fraudRisk": "<Low Risk Profile | Moderate — Enhanced Review | High — SIU Required>",
    "deductible": "<estimated deductible based on policy tier>"
  },
  "entities": {
    <key-value pairs of ALL entities extracted from the narrative AND evidence images —
     include: insured name, vehicle or property details, VIN or address, policy number,
     incident/report numbers, tow company, repair estimate, contractor, coverage limits,
     officer/badge IDs, fire report numbers, inventory values, or any other identifiers>
  },
  "aiSummary": "<2–3 sentence professional claims analyst summary covering: policy status, loss event validation, fraud risk assessment, and recommended next action>",
  "fraud": [
    "<fraud validation check 1 — prefix with ⚠ ONLY if flagged as a concern>",
    "<fraud validation check 2>",
    "<fraud validation check 3>",
    "<fraud validation check 4>",
    "<fraud validation check 5>",
    "<fraud validation check 6>"
  ],
  "nextSteps": [
    "<recommended action 1>",
    "<recommended action 2>",
    "<recommended action 3>",
    "<recommended action 4>",
    "<recommended action 5>"
  ],
  "timeline": [
    "<pipeline processing event 1 — earliest>",
    "<pipeline processing event 2>",
    "<pipeline processing event 3>",
    "<pipeline processing event 4>",
    "<pipeline processing event 5>",
    "<pipeline processing event 6>",
    "<pipeline processing event 7>",
    "<pipeline processing event 8 — latest>"
  ],
  "insights": {
    "causeOfLoss": "<specific root cause of loss, human-readable>",
    "damageSeverity": "<Low | Moderate | High | Critical>",
    "biRisk": "<None | Minimal | Significant | Severe>",
    "estimatedPropertyDamage": "<total property damage dollar estimate including structure + contents>",
    "estimatedBI": "<business interruption dollar estimate, or N/A if not applicable>",
    "fraudRiskScore": "<Low | Moderate | High>",
    "priority": "<human-readable claim priority label>"
  }
}`;

})(window);
