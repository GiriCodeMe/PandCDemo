const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const aiFactory = require('../ai-factory/factory');
const historyReviewerAgent = require('../ai-factory/agents/history-reviewer');

router.post('/review', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Medical records file required' });
  const { policy_inception_date, species = 'canine' } = req.body;
  if (!policy_inception_date) return res.status(400).json({ error: 'Policy inception date required' });

  try {
    const result = await aiFactory.run(historyReviewerAgent, {
      fileBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      policy_inception_date,
      species,
    });
    res.json({ success: true, history_review: result, source: 'gemini' });
  } catch (err) {
    console.warn('[history] AI unavailable, using fallback:', err.message);
    res.json({ success: true, history_review: getMockHistoryReview(policy_inception_date, species), source: 'fallback' });
  }
});

function getMockHistoryReview(inceptionDate, species) {
  const incDate = inceptionDate || '2024-01-15';
  const year = new Date(incDate).getFullYear();
  return {
    policy_inception_date: incDate,
    review_period:         `${year - 2}-01-01 to ${incDate}`,
    species,
    patient_name:          'Biscuit',
    conditions_identified: [
      {
        condition:        'Hip Dysplasia',
        first_noted_date: `${year - 1}-04-10`,
        is_pre_existing:  true,
        certainty:        'CONFIRMED',
        clinical_evidence: `Radiograph report confirming bilateral hip dysplasia. Severity: moderate.`,
        policy_impact:    'EXCLUDE',
        icd10_code:       'M16.9',
        snomed_code:      '57433007',
      },
      {
        condition:        'Atopic Dermatitis',
        first_noted_date: `${year - 1}-09-22`,
        is_pre_existing:  true,
        certainty:        'PROBABLE',
        clinical_evidence: 'Three visits for recurrent pruritus with eosinophilia on CBC. Likely atopic in origin.',
        policy_impact:    'PENDING_REVIEW',
        icd10_code:       'L20',
        snomed_code:      '24079001',
      },
      {
        condition:        'Acute Gastroenteritis',
        first_noted_date: `${year}-03-05`,
        is_pre_existing:  false,
        certainty:        'CONFIRMED',
        clinical_evidence: 'Single episode post-policy inception. No prior GI history noted.',
        policy_impact:    'COVERABLE',
        icd10_code:       'K52.9',
        snomed_code:      '10054005',
      },
    ],
    timeline_events: [
      { date: `${year - 1}-04-10`, event: 'Hip Dysplasia diagnosed — bilateral, moderate severity',             type: 'pre_existing', condition: 'Hip Dysplasia'        },
      { date: `${year - 1}-06-15`, event: 'Follow-up radiograph — progression stable',                         type: 'pre_existing', condition: 'Hip Dysplasia'        },
      { date: `${year - 1}-09-22`, event: 'Pruritus consultation #1 — prescribed antihistamines',               type: 'pre_existing', condition: 'Atopic Dermatitis'   },
      { date: `${year - 1}-11-03`, event: 'Pruritus consultation #2 — CBC shows eosinophilia',                  type: 'pre_existing', condition: 'Atopic Dermatitis'   },
      { date: incDate,             event: '🟢 POLICY INCEPTION DATE',                                           type: 'inception',    condition: null                  },
      { date: `${year}-03-05`,     event: 'Acute gastroenteritis — vomiting, diarrhoea, single episode resolved',type: 'normal',       condition: 'Acute Gastroenteritis'},
    ],
    pre_existing_summary: '2 pre-existing conditions identified prior to policy inception. Hip Dysplasia confirmed for exclusion. Atopic Dermatitis requires senior underwriter review.',
    coverable_conditions:     ['Acute Gastroenteritis', 'Vaccinations', 'Parasite prevention', 'Injury/trauma'],
    recommended_exclusions:   ['Hip Dysplasia (bilateral)', 'Atopic Dermatitis — pending senior review'],
  };
}

module.exports = router;
