const express = require('express');
const router = express.Router();
const aiFactory = require('../ai-factory/factory');
const underwriterAgent = require('../ai-factory/agents/underwriter');
const riskAssessmentAgent = require('../ai-factory/agents/uw-risk-assessment');
const fraudDetectionAgent = require('../ai-factory/agents/uw-fraud-detection');
const pricingAgent = require('../ai-factory/agents/uw-pricing');
const coverageScopeAgent = require('../ai-factory/agents/uw-coverage-scope');
const finalDecisionAgent = require('../ai-factory/agents/uw-final-decision');

const AGENT_MAP = {
  risk_assessment: riskAssessmentAgent,
  fraud_detection: fraudDetectionAgent,
  pricing: pricingAgent,
  coverage_scope: coverageScopeAgent,
  final_decision: finalDecisionAgent,
};

// Original combined endpoint (kept for backward compatibility)
router.post('/evaluate', async (req, res) => {
  const { application } = req.body;
  if (!application) return res.status(400).json({ error: 'Application data required' });

  try {
    const result = await aiFactory.run(underwriterAgent, { application });
    res.json({ success: true, underwriting: result, source: 'gemini' });
  } catch (err) {
    console.warn('[underwriting] AI unavailable, using fallback:', err.message);
    res.json({ success: true, underwriting: getMockUnderwriting(application), source: 'fallback' });
  }
});

// Individual agent endpoint — each UW agent called separately
router.post('/agent', async (req, res) => {
  const { agentType, application, previousResults } = req.body;
  if (!agentType || !application) {
    return res.status(400).json({ error: 'agentType and application required' });
  }
  const agent = AGENT_MAP[agentType];
  if (!agent) {
    return res.status(400).json({ error: `Unknown agentType: ${agentType}. Valid: ${Object.keys(AGENT_MAP).join(', ')}` });
  }

  try {
    const result = await aiFactory.run(agent, { application, previousResults: previousResults || null });
    res.json({ success: true, agentType, result, source: 'gemini' });
  } catch (err) {
    console.warn(`[uw-agent:${agentType}] AI unavailable, using fallback:`, err.message);
    res.json({ success: true, agentType, result: getMockAgentResult(agentType, application), source: 'fallback' });
  }
});

function getMockAgentResult(agentType, app) {
  const breed = app?.breed || app?.pet?.breed || 'Mixed Breed';
  const isHighRisk = ['French Bulldog', 'Pug', 'English Bulldog', 'Bulldog'].includes(breed);
  const ageYears = app?.age_years || (app?.pet?.dob ? Math.floor((Date.now() - new Date(app.pet.dob)) / (365.25 * 24 * 60 * 60 * 1000)) : 3);
  const basePremium = app?.coverage_type === 'ACCIDENT_ILLNESS' || app?.coverage?.type === 'ACCIDENT_ILLNESS' ? 42 : app?.coverage_type === 'PREMIUM' ? 95 : app?.coverage?.type === 'COMPREHENSIVE' ? 70 : 28;
  const breedLoad = isHighRisk ? 1.20 : 1.05;
  const ageLoad = ageYears > 7 ? 1.15 : ageYears > 4 ? 1.05 : 1.0;
  const quotePremium = app?.quote_monthly_premium || 0;
  // UW premium always >= quote premium — underwriting adds loadings, never discounts
  const finalPremium = parseFloat(Math.max(basePremium * breedLoad * ageLoad, quotePremium).toFixed(2));

  const mocks = {
    risk_assessment: {
      agent: 'Risk Assessment Agent',
      risk_score: isHighRisk ? 0.62 : 0.28,
      risk_tier: isHighRisk ? 'SUBSTANDARD' : 'STANDARD',
      risk_factors: isHighRisk
        ? [`${breed} breed carries elevated respiratory and orthopaedic risk`, `Age ${ageYears} years within standard band`]
        : [`${breed} shows standard actuarial risk profile`, `Age ${ageYears} years — low mortality bracket`],
      breed_loading_pct: isHighRisk ? 20 : 5,
      age_loading_pct: ageYears > 7 ? 15 : ageYears > 4 ? 5 : 0,
      health_loading_pct: 0,
      total_loading_pct: isHighRisk ? (ageYears > 7 ? 35 : 20) : 5,
      findings: `${breed} evaluated at ${isHighRisk ? 'elevated' : 'standard'} risk tier. Age ${ageYears} years within normal band. ${app?.neutered === 'yes' || app?.pet?.neutered === 'yes' ? 'Neutered status reduces behavioural claim risk.' : 'Entire status noted.'}`,
      risk_contribution: isHighRisk ? 0.45 : 0.22,
    },
    fraud_detection: {
      agent: 'Fraud Detection Agent',
      is_suspicious: false,
      fraud_risk_level: 'LOW',
      fraud_indicators: [],
      fraud_score: 0.05,
      cross_references_checked: ['Microchip database', 'Prior claim history', 'Application consistency'],
      findings: 'No application inconsistencies detected. All declared information cross-references consistently. Prior claim history is proportionate to coverage period.',
      risk_contribution: 0.05,
    },
    pricing: {
      agent: 'Pricing Agent',
      base_premium: basePremium,
      breed_loading: parseFloat(((breedLoad - 1) * basePremium).toFixed(2)),
      age_loading: parseFloat(((ageLoad - 1) * basePremium * breedLoad).toFixed(2)),
      health_loading: 0.00,
      fraud_loading: 0.00,
      total_loading_pct: isHighRisk ? 20 : 5,
      final_monthly_premium: finalPremium,
      final_annual_premium: parseFloat((finalPremium * 12).toFixed(2)),
      currency: 'USD',
      pricing_rationale: `Base rate $${basePremium} × breed loading ×${breedLoad} × age loading ×${ageLoad}.`,
      findings: `Base rate $${basePremium}.00 for ${app?.coverage_type || app?.coverage?.type || 'standard'} coverage. Breed loading ×${breedLoad}. Age loading ×${ageLoad}. Recommended monthly premium: $${finalPremium}.`,
      risk_contribution: null,
    },
    coverage_scope: {
      agent: 'Coverage Scoping Agent',
      exclusions: isHighRisk
        ? [`${breed} breed loading applied`, 'BOAS/respiratory conditions — 6-month waiting period']
        : [],
      endorsements: [`${(app?.coverage_type || app?.coverage?.type || 'ACCIDENT_ILLNESS').replace(/_/g, ' ')} coverage`],
      waiting_periods: { accident_days: 0, illness_days: 14, orthopedic_months: 6, cruciate_months: 6 },
      special_conditions: [],
      coverage_notes: isHighRisk
        ? [`${breed}-specific exclusions apply for breed-related respiratory conditions`]
        : ['Standard policy terms apply — no additional restrictions required'],
      findings: isHighRisk
        ? `${breed} breed-specific exclusions applied for BOAS and respiratory conditions. Standard waiting periods plus 6-month orthopaedic waiting period.`
        : `Standard ${app?.coverage_type || app?.coverage?.type || 'Accident & Illness'} coverage appropriate. No additional restrictions required beyond standard policy terms.`,
      risk_contribution: null,
    },
    final_decision: {
      agent: 'Final Decision Agent',
      decision: isHighRisk ? 'ACCEPT_SUBSTANDARD' : 'ACCEPT_STANDARD',
      recommended_premium: finalPremium,
      risk_score: isHighRisk ? 0.62 : 0.28,
      risk_tier: isHighRisk ? 'SUBSTANDARD' : 'STANDARD',
      confidence: isHighRisk ? 0.84 : 0.93,
      referral_required: false,
      exclusions: isHighRisk ? [`${breed} breed loading applied`] : [],
      endorsements: [`${(app?.coverage_type || app?.coverage?.type || 'ACCIDENT_ILLNESS').replace(/_/g, ' ')} coverage`],
      conditions: [],
      explanation: `${app?.pet?.name || app?.pet_name || 'Pet'} is a ${ageYears}-year-old ${app?.pet?.neutered === 'yes' || app?.neutered ? 'neutered' : 'entire'} ${app?.pet?.sex || app?.sex || 'male'} ${breed}. Risk assessment confirms ${isHighRisk ? 'substandard' : 'standard'} tier eligibility. Recommended monthly premium of $${finalPremium} reflects ${isHighRisk ? 'breed-specific loading' : 'standard actuarial rate'}.`,
      findings: isHighRisk
        ? `Application accepted at substandard rates with breed-specific endorsements. Policy can be bound with stated exclusions.`
        : `Application meets all standard underwriting criteria. No referral required. Policy can be bound immediately at quoted premium.`,
      risk_contribution: null,
      policy_bindable: true,
    },
  };

  return mocks[agentType] || { agent: agentType, findings: 'Mock result unavailable', risk_contribution: null };
}

function getMockUnderwriting(app) {
  const breed       = app?.breed || 'Mixed Breed';
  const isHighRisk  = ['French Bulldog', 'Pug', 'English Bulldog', 'Bulldog'].includes(breed);
  const ageYears    = app?.age_years || 3;
  const basePremium = app?.coverage_type === 'ACCIDENT_ILLNESS' ? 42 : app?.coverage_type === 'WELLNESS' ? 35 : 28;
  const breedLoad   = isHighRisk ? 1.20 : 1.05;
  const ageLoad     = ageYears > 7 ? 1.15 : ageYears > 4 ? 1.05 : 1.0;
  const premium     = parseFloat((basePremium * breedLoad * ageLoad).toFixed(2));
  const riskScore   = isHighRisk ? 0.64 : 0.32;

  return {
    decision:            isHighRisk ? 'ACCEPT_SUBSTANDARD' : 'ACCEPT_STANDARD',
    recommended_premium: premium,
    risk_score:          riskScore,
    risk_tier:           isHighRisk ? 'SUBSTANDARD' : 'STANDARD',
    agent_reports: [
      { agent: 'Risk Assessment Agent', findings: `${breed} evaluated at ${isHighRisk ? 'elevated' : 'standard'} risk tier. Age ${ageYears} years within normal band.`, risk_contribution: isHighRisk ? 0.45 : 0.25 },
      { agent: 'Fraud Detection Agent', findings: 'No application inconsistencies detected. All declared information cross-references consistently.', risk_contribution: 0.05 },
      { agent: 'Pricing Agent', findings: `Base rate $${basePremium}.00. Breed loading ×${breedLoad}. Age loading ×${ageLoad}. Recommended monthly premium: $${premium}.`, risk_contribution: null },
      { agent: 'Coverage Scoping Agent', findings: isHighRisk ? `${breed} coverage with breed-specific exclusions. BOAS 6-month waiting period.` : `Standard coverage appropriate. No additional restrictions.`, risk_contribution: null },
      { agent: 'Final Decision Agent', findings: isHighRisk ? 'Application accepted at substandard rates. Policy bindable with stated exclusions.' : 'Application meets standard criteria. Policy bindable immediately.', risk_contribution: null },
    ],
    conditions:   [],
    exclusions:   isHighRisk ? [`${breed} breed loading applied`, 'BOAS/respiratory — 6-month waiting period'] : [],
    endorsements: [`${app?.coverage_type?.replace(/_/g, ' ') || 'Accident & Illness'} coverage`],
    coverage_terms: { annual_benefit: app?.annual_benefit || 5000, deductible: app?.annual_benefit >= 7500 ? 250 : 200, reimbursement_pct: 80, waiting_period_illness: 14, waiting_period_accident: 0 },
    explanation:      `Risk assessment confirms ${isHighRisk ? 'substandard' : 'standard'} tier eligibility. Recommended monthly premium of $${premium}.`,
    referral_required: false,
    confidence:        isHighRisk ? 0.84 : 0.93,
  };
}

module.exports = router;
