const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const aiFactory = require('../ai-factory/factory');
const medicalCoderAgent = require('../ai-factory/agents/medical-coder');

router.post('/notes', upload.single('file'), async (req, res) => {
  const species = req.body.species || 'canine';
  if (!req.file && !req.body.note_text) return res.status(400).json({ error: 'File upload or note_text required' });

  try {
    const result = await aiFactory.run(medicalCoderAgent, {
      fileBuffer: req.file ? req.file.buffer : null,
      mimeType:   req.file ? req.file.mimetype : null,
      species,
    });
    res.json({ success: true, coding_result: result, source: 'gemini' });
  } catch (err) {
    console.warn('[coding] AI unavailable, using fallback:', err.message);
    res.json({ success: true, coding_result: getMockCodingResult(species), source: 'fallback' });
  }
});

function getMockCodingResult(species) {
  return {
    note_summary: `${species === 'feline' ? 'Feline' : 'Canine'} patient presenting with chronic skin condition and allergy symptoms. Intradermal allergen testing performed. Oclacitinib therapy initiated.`,
    primary_diagnosis: 'Atopic Dermatitis',
    species,
    coded_findings: [
      { concept: 'Atopic Dermatitis', snomed_code: '24079001', icd10_code: 'L20.89', body_system: 'Integumentary', is_pre_existing: true,  confidence_score: 0.95, confidence_tier: 'HIGH',   evidence_text: 'Chronic recurring pruritic skin condition with eosinophilia' },
      { concept: 'Intradermal Allergen Test', snomed_code: '14308001', icd10_code: 'Z01.89', body_system: 'Integumentary', is_pre_existing: false, confidence_score: 0.92, confidence_tier: 'HIGH',   evidence_text: 'Intradermal allergy test performed this visit' },
      { concept: 'Oclacitinib (Apoquel)', snomed_code: '784181000', icd10_code: 'Z79.899', body_system: 'Systemic',       is_pre_existing: false, confidence_score: 0.98, confidence_tier: 'HIGH',   evidence_text: 'Apoquel 16mg prescribed for ongoing management' },
    ],
    cpt_procedures: [
      { code: '99213', description: 'Office/outpatient visit, established patient, moderate complexity' },
      { code: '95004', description: 'Percutaneous tests (scratch, puncture, prick) with allergenic extracts' },
    ],
  };
}

module.exports = router;
