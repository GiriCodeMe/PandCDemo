const modelTier = (input) => input.fileBuffer ? 'vision' : 'fast';

function buildPrompt({ species = 'canine' }) {
  return `You are a veterinary medical coder. Extract clinical concepts from this note and map to SNOMED-CT and ICD-10-CM codes.

Species context: ${species}

Perform two passes:
Pass 1: Extract all clinical concepts (diagnoses, procedures, medications, observations)
Pass 2: Map each concept to SNOMED-CT and ICD-10-CM codes

Return ONLY a valid JSON object:
{
  "note_summary": "string",
  "primary_diagnosis": "string",
  "coded_findings": [
    {
      "concept": "string",
      "type": "DIAGNOSIS|PROCEDURE|MEDICATION|OBSERVATION",
      "snomed_code": "string",
      "snomed_display": "string",
      "icd10_code": "string",
      "icd10_display": "string",
      "confidence_score": 0.00,
      "confidence_tier": "HIGH|MEDIUM|LOW",
      "is_primary_diagnosis": false,
      "is_pre_existing": false,
      "is_negated": false,
      "body_system": "string"
    }
  ],
  "unmapped_concepts": ["string"]
}`;
}

module.exports = { modelTier, buildPrompt };
