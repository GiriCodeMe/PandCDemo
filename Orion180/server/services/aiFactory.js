const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const CLIENT_PUBLIC = path.join(__dirname, '..', '..', 'client', 'public');

// ─── helpers ──────────────────────────────────────────────────────────────────

function getModel(visionRequired = false) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { temperature: 0.2, maxOutputTokens: 800 }
  });
}

function claimSummary(claim) {
  return `Claim #${claim.id} | ${claim.insuredName} | ${claim.causeOfLoss} | $${claim.claimAmount?.toLocaleString()} | ${claim.status} | Fraud Risk: ${claim.fraudRisk} (${claim.fraudAnalysis?.score}/100)`;
}

async function loadImageParts(imagePaths) {
  return imagePaths.map(relPath => {
    const absPath = path.join(CLIENT_PUBLIC, relPath.replace(/^\//, ''));
    if (!fs.existsSync(absPath)) return null;
    const data = fs.readFileSync(absPath).toString('base64');
    const ext = path.extname(absPath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    return { inlineData: { data, mimeType } };
  }).filter(Boolean);
}

// ─── PHOTO REVIEW ─────────────────────────────────────────────────────────────

const PHOTO_REVIEW_PROMPT = (claim) => `You are a professional insurance damage assessor and fraud analyst for Carrier Insurance. Analyze the attached damage assessment photo(s) for claim #${claim.id}.

CLAIM CONTEXT:
${claimSummary(claim)}
Property: ${[claim.address?.line1, claim.address?.city, claim.address?.state, claim.address?.zip].filter(Boolean).join(', ')}
Cause of Loss: ${claim.causeOfLoss} — ${claim.primaryPeril}
Date of Loss: ${claim.dateOfLoss}
Is Home Livable: ${claim.isHomeLivable ? 'Yes' : 'No'}
Existing Fraud Flags: ${(claim.fraudAnalysis?.flags || []).join('; ') || 'None'}

ANALYSIS TASKS:
1. Identify all visible damage zones and classify their severity (Critical / High / Medium / Low)
2. Assess whether the visual damage is CONSISTENT or INCONSISTENT with the reported cause of loss ("${claim.causeOfLoss}")
3. Identify any visual fraud indicators (staged damage, pre-existing damage, inconsistent burn/water patterns, suspicious access points)
4. Note any structural concerns requiring immediate specialist assessment
5. Compare visible damage extent against the claimed amount of $${claim.claimAmount?.toLocaleString()}

Respond ONLY with valid JSON in this exact structure:
{
  "overallConsistency": "CONSISTENT | INCONSISTENT | UNCERTAIN",
  "consistencyReason": "one sentence explanation",
  "damageSeverity": "CRITICAL | HIGH | MEDIUM | LOW",
  "damageZones": [
    { "zone": "Zone description", "severity": "HIGH", "finding": "What was observed" }
  ],
  "fraudIndicators": [
    { "indicator": "Description of concern", "severity": "HIGH | MEDIUM | LOW", "recommendation": "Action to take" }
  ],
  "structuralConcerns": ["concern 1", "concern 2"],
  "estimateValidation": "SUPPORTS_CLAIM | OVERSTATED | UNDERSTATED | INSUFFICIENT_EVIDENCE",
  "estimateNote": "Brief note on whether visible damage supports the claimed amount",
  "nextActions": ["Recommended action 1", "Recommended action 2"]
}`;

const PHOTO_REVIEW_SIMULATED = {
  '2026-108': {
    overallConsistency: 'CONSISTENT',
    consistencyReason: 'Visible water pooling, cupped hardwood, and swollen cabinet bases are all consistent with a sudden supply-line discharge event as reported.',
    damageSeverity: 'HIGH',
    damageZones: [
      { zone: 'Zone 1 — Kitchen Floor (120 sq ft)', severity: 'HIGH', finding: 'Hardwood cupping 8–12mm across the full zone; subfloor saturation visible at board edges' },
      { zone: 'Zone 2 — Cabinet Base (lower cabinets)', severity: 'MEDIUM', finding: 'MDF base panels swollen and delaminating — water migrated from under-sink area' }
    ],
    fraudIndicators: [
      { indicator: 'Invoice address (98 Commerce Dr) differs from loss address (123 Main St)', severity: 'MEDIUM', recommendation: 'Verify Restoration Pro billing address vs. service address — request confirmation letter' }
    ],
    structuralConcerns: ['Subfloor moisture at 94% saturation — risk of mold within 48-72h if drying not initiated', 'Verify floor joist integrity under kitchen'],
    estimateValidation: 'SUPPORTS_CLAIM',
    estimateNote: 'Visible damage scope (120 sq ft hardwood, full cabinet base replacement, subfloor drying) is consistent with the $50,000 claim amount for the 32801 region.',
    nextActions: ['Confirm Restoration Pro invoice address discrepancy', 'Order independent plumbing inspection to validate supply-line failure', 'Schedule mold assessment within 48 hours']
  },
  '2026-102': {
    overallConsistency: 'CONSISTENT',
    consistencyReason: 'V-shaped char pattern at appliance location is consistent with accidental ignition, and smoke spread pattern matches the FNOL narrative of a kitchen-origin fire.',
    damageSeverity: 'CRITICAL',
    damageZones: [
      { zone: 'Zone 1 — Fire Origin (kitchen counter, south side)', severity: 'CRITICAL', finding: 'Char concentration and V-pattern consistent with countertop appliance ignition — origin clearly visible' },
      { zone: 'Zone 2 — South Wall / Structural Exposure', severity: 'HIGH', finding: 'Wall stud exposure visible — load-bearing status unknown without structural assessment' }
    ],
    fraudIndicators: [
      { indicator: 'No pour pattern or accelerant indicators visible in photos', severity: 'LOW', finding: 'Photo evidence does not support arson — consistent with accidental classification' },
      { indicator: 'Claim amount ($52,800) very close to policy limit — warrants independent estimate', severity: 'HIGH', recommendation: 'Commission independent Xactimate estimate before final settlement' }
    ],
    structuralConcerns: ['South wall load-bearing status undetermined — structural engineer required before re-occupancy', 'Exposed roof decking risk — emergency tarping status must be verified'],
    estimateValidation: 'INSUFFICIENT_EVIDENCE',
    estimateNote: 'Visible damage is significant, but without the structural engineer assessment, it is impossible to confirm whether $52,800 accurately represents the full scope.',
    nextActions: ['Commission structural engineer assessment immediately', 'Request independent Xactimate estimate', 'Verify fire marshal determination of accidental cause in ADF report']
  },
  '2026-093': {
    overallConsistency: 'CONSISTENT',
    consistencyReason: 'Missing shingles, hail bruising pattern, and exposed decking are all consistent with the NWS-confirmed 67 mph wind and 0.9-inch hail event on March 8, 2026.',
    damageSeverity: 'HIGH',
    damageZones: [
      { zone: 'Zone 1 — Missing Shingles / Exposed Decking (18 sq ft)', severity: 'HIGH', finding: 'Clean shingle displacement consistent with wind uplift — no evidence of pre-existing damage at the tear line' },
      { zone: 'Zone 2 — Hail Impact Field (approx 40% of roof)', severity: 'MEDIUM', finding: 'Bruising and granule loss on 40% of field shingles — hail diameter consistent with 0.9 inch NWS report' }
    ],
    fraudIndicators: [],
    structuralConcerns: ['Monitor for interior water intrusion through exposed decking area', 'Verify emergency tarp installation is watertight'],
    estimateValidation: 'SUPPORTS_CLAIM',
    estimateNote: 'Contractor estimate of $18,450 is within 6% of Xactimate benchmark for 77001 region — visible damage scope supports the amount.',
    nextActions: ['Approve contractor estimate — all evidence is consistent', 'Verify emergency tarp is protecting the exposed section', 'Schedule 30-day follow-up inspection after repair completion']
  }
};

async function photoReview(claim) {
  const model = getModel(true);
  const imagePaths = claim.damageImages || [];

  if (!model || imagePaths.length === 0) {
    return PHOTO_REVIEW_SIMULATED[claim.id] || {
      overallConsistency: 'UNCERTAIN',
      consistencyReason: 'No images available for analysis.',
      damageSeverity: 'UNKNOWN',
      damageZones: [],
      fraudIndicators: [],
      structuralConcerns: [],
      estimateValidation: 'INSUFFICIENT_EVIDENCE',
      estimateNote: 'No images provided.',
      nextActions: ['Upload damage photos to enable AI visual analysis']
    };
  }

  try {
    const imageParts = await loadImageParts(imagePaths);
    if (imageParts.length === 0) return PHOTO_REVIEW_SIMULATED[claim.id] || {};

    const result = await model.generateContent([
      { text: PHOTO_REVIEW_PROMPT(claim) },
      ...imageParts
    ]);

    const raw = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(raw);
  } catch (err) {
    console.error('photoReview Gemini error:', err.message);
    return PHOTO_REVIEW_SIMULATED[claim.id] || {};
  }
}

// ─── ADDRESS COMPARE ──────────────────────────────────────────────────────────

const ADDRESS_COMPARE_PROMPT = (claim) => `You are a claims fraud analyst for Carrier Insurance. Compare the registered property addresses across all sources for claim #${claim.id}.

REGISTERED ADDRESSES:
1. Policy Address (SOR): ${[claim.address?.line1, claim.address?.line2, claim.address?.city, claim.address?.state, claim.address?.zip].filter(s => s && s.trim()).join(', ')}
2. CRM Insured Address: ${[claim.address?.line1, claim.address?.city, claim.address?.state, claim.address?.zip].filter(Boolean).join(', ')} (from insured profile for ${claim.insuredName})

DOCUMENT ADDRESSES FOUND:
${(claim.documentAddresses || []).map((d, i) => `${i + 1}. ${d.source}: "${d.address}" — ${d.note}`).join('\n')}

CLAIM CONTEXT:
${claimSummary(claim)}
Existing inconsistency flags: ${(claim.dataInconsistencies || []).join('; ') || 'None'}

ANALYSIS TASK:
For each document address, determine:
1. Does it match the registered loss property address? (MATCH / MISMATCH / PARTIAL)
2. If mismatch, what is the likely explanation and fraud risk level?
3. Overall address consistency verdict for this claim
4. Recommended actions

Respond ONLY with valid JSON:
{
  "overallVerdict": "ADDRESSES_CONSISTENT | MINOR_DISCREPANCY | SIGNIFICANT_MISMATCH",
  "riskLevel": "LOW | MEDIUM | HIGH",
  "summary": "One sentence summary of the address analysis",
  "comparisons": [
    {
      "source": "document filename",
      "documentAddress": "address found in document",
      "registeredAddress": "address on policy/CRM",
      "result": "MATCH | MISMATCH | PARTIAL",
      "explanation": "Why this result",
      "fraudRisk": "LOW | MEDIUM | HIGH"
    }
  ],
  "fraudConcerns": ["concern 1", "concern 2"],
  "recommendedActions": ["action 1", "action 2"]
}`;

const ADDRESS_COMPARE_SIMULATED = {
  '2026-108': {
    overallVerdict: 'SIGNIFICANT_MISMATCH',
    riskLevel: 'MEDIUM',
    summary: 'The repair invoice lists a commercial address (98 Commerce Drive) instead of the loss property — likely a contractor billing address, but requires confirmation.',
    comparisons: [
      { source: 'repair_invoice.pdf', documentAddress: '98 Commerce Drive, Orlando FL 32803', registeredAddress: '123 Main St, Orlando FL 32801', result: 'MISMATCH', explanation: 'Contractor billing address used instead of service/loss address — common for larger restoration companies but must be verified', fraudRisk: 'MEDIUM' },
      { source: 'damaged_flooring.jpg', documentAddress: '123 Main St, Orlando FL 32801', registeredAddress: '123 Main St, Orlando FL 32801', result: 'MATCH', explanation: 'Photo metadata and file header confirm loss property address', fraudRisk: 'LOW' }
    ],
    fraudConcerns: ['Invoice address mismatch could indicate services were performed at a different location', 'Address on policy (32801) vs. invoice ZIP (32803) — different postal zones within Orlando'],
    recommendedActions: ['Contact Restoration Pro to confirm service was performed at 123 Main St, not 98 Commerce Drive', 'Request a corrected invoice listing the service address (123 Main St) separately from billing address', 'Cross-check with plumber\'s report address when received']
  },
  '2026-102': {
    overallVerdict: 'ADDRESSES_CONSISTENT',
    riskLevel: 'LOW',
    summary: 'All submitted documents reference the correct loss property address — no address discrepancy detected for claim 2026-102.',
    comparisons: [
      { source: 'fire_report.pdf', documentAddress: '456 Oak Avenue, Miami FL 33109', registeredAddress: '456 Oak Avenue, Miami FL 33109', result: 'MATCH', explanation: 'Miami-Dade Fire Rescue ADF report explicitly references the loss address — verified by responding officer', fraudRisk: 'LOW' },
      { source: 'fire_damage_photos.jpg', documentAddress: '456 Oak Avenue, Miami FL 33109', registeredAddress: '456 Oak Avenue, Miami FL 33109', result: 'MATCH', explanation: 'Photo metadata and street-visible address matches policy record', fraudRisk: 'LOW' }
    ],
    fraudConcerns: [],
    recommendedActions: ['No address remediation needed — proceed with structural documentation collection']
  },
  '2026-093': {
    overallVerdict: 'ADDRESSES_CONSISTENT',
    riskLevel: 'LOW',
    summary: 'All submitted documents are consistent with the registered loss address — no discrepancies detected for claim 2026-093.',
    comparisons: [
      { source: 'roof_damage_photos.jpg', documentAddress: '789 Pine Circle, Houston TX 77001', registeredAddress: '789 Pine Circle, Houston TX 77001', result: 'MATCH', explanation: 'Photo metadata confirms loss address', fraudRisk: 'LOW' },
      { source: 'contractor_estimate.pdf', documentAddress: '789 Pine Circle Unit 4, Houston TX 77001', registeredAddress: '789 Pine Circle, Houston TX 77001', result: 'PARTIAL', explanation: 'Contractor included unit number (Unit 4) which matches policy Line 2 — consistent with multi-family property', fraudRisk: 'LOW' },
      { source: 'nws_storm_report.pdf', documentAddress: 'ZIP 77001 coverage area', registeredAddress: '789 Pine Circle, Houston TX 77001', result: 'MATCH', explanation: 'NWS report covers ZIP 77001 which is the loss location — storm event verified', fraudRisk: 'LOW' }
    ],
    fraudConcerns: [],
    recommendedActions: ['No address remediation needed — claim can advance to final payment authorization']
  }
};

async function addressCompare(claim) {
  const model = getModel(false);

  if (!model) {
    return ADDRESS_COMPARE_SIMULATED[claim.id] || {
      overallVerdict: 'ADDRESSES_CONSISTENT',
      riskLevel: 'LOW',
      summary: 'No Gemini key configured — using simulated address analysis.',
      comparisons: [],
      fraudConcerns: [],
      recommendedActions: []
    };
  }

  try {
    const result = await model.generateContent([{ text: ADDRESS_COMPARE_PROMPT(claim) }]);
    const raw = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(raw);
  } catch (err) {
    console.error('addressCompare Gemini error:', err.message);
    return ADDRESS_COMPARE_SIMULATED[claim.id] || {};
  }
}

// ─── FRAUD VECTOR ANALYSIS ────────────────────────────────────────────────────

const FRAUD_VECTOR_PROMPT = (claim) => `You are a senior fraud analyst for Carrier Insurance. Conduct a comprehensive multi-vector fraud analysis for claim #${claim.id} using ALL available evidence: visual photo analysis, address records, IoT sensor data, claims history, and policy data.

CLAIM OVERVIEW:
${claimSummary(claim)}
Property: ${[claim.address?.line1, claim.address?.city, claim.address?.state, claim.address?.zip].filter(Boolean).join(', ')}
Region: ${claim.region || '—'} | Adjuster: ${claim.adjuster || '—'}
Cause of Loss: ${claim.causeOfLoss} — ${claim.primaryPeril}
Date of Loss: ${claim.dateOfLoss}
Is Home Livable: ${claim.isHomeLivable ? 'Yes' : 'No'}

POLICY CONTEXT:
Coverage: ${(claim.coverageVerification?.coverages || []).join(', ')}
Coverage Rationale: ${claim.coverageVerification?.rationale || '—'}

FRAUD SCORE (existing): ${claim.fraudAnalysis?.score}/100 (${claim.fraudRisk} Risk)
Existing Flags: ${(claim.fraudAnalysis?.flags || []).join('; ') || 'None'}

IoT SENSOR DATA: ${claim.iotSensors ? `Alert at ${claim.iotSensors.alertTriggeredAt} — ${(claim.iotSensors.sensors || []).filter(s => s.status === 'ALERT' || s.status === 'HIGH').map(s => s.name + ': ' + s.value + ' ' + s.unit).join(', ')}` : 'Not available'}

PRIOR CLAIMS: ${(claim.insuredHistory || []).length === 0 ? 'None' : claim.insuredHistory.map(h => `${h.claimId} (${h.date}): ${h.cause} — $${h.amount.toLocaleString()} — ${h.status}`).join('; ')}

ADDRESS CONSISTENCY: ${(claim.dataInconsistencies || []).length === 0 ? 'All addresses consistent' : claim.dataInconsistencies.join('; ')}

ANALYSIS TASK: Evaluate all fraud vectors below and provide a comprehensive verdict:
- Vector A: Cause-of-Loss consistency (does claimed cause match evidence?)
- Vector B: Financial motivation (is amount near limit, is timing suspicious?)
- Vector C: Documentation integrity (missing docs, address mismatches)
- Vector D: Technology corroboration (does IoT/sensor data support the FNOL?)
- Vector E: Historical pattern (prior claims frequency, intervals, amounts)
- Vector F: Visual evidence integrity (does photo damage match the claim narrative?)

Respond ONLY with valid JSON:
{
  "overallFraudRisk": "LOW | MEDIUM | HIGH | CRITICAL",
  "confidenceScore": 0-100,
  "recommendation": "APPROVE | FURTHER_INVESTIGATION | SIU_REFERRAL | DENY",
  "executiveSummary": "2-3 sentence summary for the adjuster",
  "vectors": [
    {
      "vector": "A",
      "name": "Cause-of-Loss Consistency",
      "verdict": "PASS | FLAG | FAIL",
      "finding": "Detailed finding",
      "weight": "HIGH | MEDIUM | LOW"
    }
  ],
  "topRisks": [
    { "risk": "Description", "severity": "HIGH | MEDIUM | LOW", "mitigationAction": "Recommended action" }
  ],
  "mitigatingFactors": ["factor 1", "factor 2"],
  "settlementGuidance": "Guidance on whether to proceed, hold, or escalate"
}`;

const FRAUD_VECTOR_SIMULATED = {
  '2026-108': {
    overallFraudRisk: 'MEDIUM',
    confidenceScore: 68,
    recommendation: 'FURTHER_INVESTIGATION',
    executiveSummary: 'Claim 2026-108 (Water Damage) is largely consistent with the reported plumbing failure. IoT sensor data strongly corroborates the FNOL narrative with a timestamped leak alert. The primary concern is the invoice address mismatch and the above-average claim amount — both require resolution before settlement.',
    vectors: [
      { vector: 'A', name: 'Cause-of-Loss Consistency', verdict: 'PASS', finding: 'Water sensor alert, auto shut-off valve activation, and humidity spike all timestamped at 08:29 — perfectly consistent with a sudden supply-line burst. Damage pattern in photos supports this.', weight: 'HIGH' },
      { vector: 'B', name: 'Financial Motivation', verdict: 'FLAG', finding: 'Claim amount ($50,000) exceeds regional average for equivalent Orlando water damage claims by 15%. Independent estimate recommended.', weight: 'HIGH' },
      { vector: 'C', name: 'Documentation Integrity', verdict: 'FLAG', finding: 'Repair invoice lists a different address (98 Commerce Drive vs. 123 Main St). Plumber\'s report and Damaged Goods list are still missing.', weight: 'HIGH' },
      { vector: 'D', name: 'Technology Corroboration', verdict: 'PASS', finding: 'IoT data is the strongest corroborating evidence: 6 sensors, auto-close valve activation, humidity 87%RH, floor moisture 94%. Timeline is consistent and tamper-free.', weight: 'HIGH' },
      { vector: 'E', name: 'Historical Pattern', verdict: 'PASS', finding: '1 prior claim (2024-055 Roof Damage, $8,200) — different peril, 2 years ago. No pattern of repeated claims.', weight: 'MEDIUM' },
      { vector: 'F', name: 'Visual Evidence Integrity', verdict: 'FLAG', finding: 'Photos show genuine water damage consistent with the event. However, the invoice address discrepancy creates uncertainty about whether all billed work occurred at the loss address.', weight: 'MEDIUM' }
    ],
    topRisks: [
      { risk: 'Invoice address mismatch — services may not have been performed at the loss property', severity: 'MEDIUM', mitigationAction: 'Request corrected invoice with service address confirmed as 123 Main St' },
      { risk: 'Claim amount 15% above regional average — potential over-estimation', severity: 'MEDIUM', mitigationAction: 'Order independent Xactimate estimate before settlement authorization' }
    ],
    mitigatingFactors: ['IoT sensor data provides strong objective corroboration', 'Single prior claim of different type — no fraud pattern', 'Immediate emergency mitigation taken — good faith behavior'],
    settlementGuidance: 'Hold settlement pending: (1) corrected invoice with service address, (2) plumber\'s report confirming supply-line failure. Once resolved, approve at validated amount.'
  },
  '2026-102': {
    overallFraudRisk: 'HIGH',
    confidenceScore: 78,
    recommendation: 'SIU_REFERRAL',
    executiveSummary: 'Claim 2026-102 (Fire Damage) presents multiple concurrent fraud vectors that collectively elevate risk to HIGH. While the fire cause appears accidental per photo and fire marshal evidence, the missing structural assessment, near-policy-limit amount, prior claim within 12 months, and coastal surge zone exposure create a pattern requiring SIU review before settlement.',
    vectors: [
      { vector: 'A', name: 'Cause-of-Loss Consistency', verdict: 'PASS', finding: 'V-shaped char pattern at appliance location is consistent with accidental ignition. No pour patterns or accelerant indicators in photos. Fire Marshal classified as ACCIDENTAL.', weight: 'HIGH' },
      { vector: 'B', name: 'Financial Motivation', verdict: 'FAIL', finding: 'Claim amount ($52,800) is within 97% of policy dwelling limit — a classic over-limit-avoidance pattern. Independent estimate is critical.', weight: 'HIGH' },
      { vector: 'C', name: 'Documentation Integrity', verdict: 'FAIL', finding: 'Structural engineer assessment is missing. Without it, the actual structural damage scope is unknown — the claim amount cannot be independently verified.', weight: 'HIGH' },
      { vector: 'D', name: 'Technology Corroboration', verdict: 'PASS', finding: 'IoT data confirms fire event: smoke detector ALERT, heat at 312°F, CO at 142ppm, fire suppression activation — all timestamped consistently with FNOL.', weight: 'HIGH' },
      { vector: 'E', name: 'Historical Pattern', verdict: 'FLAG', finding: 'Prior claim 2025-003 (Water Damage, $14,500) filed only 14 months ago — two different perils within 2 years. Pattern warrants review.', weight: 'MEDIUM' },
      { vector: 'F', name: 'Visual Evidence Integrity', verdict: 'FLAG', finding: 'Photos are consistent with fire but Zone 2 structural exposure is unquantified. ALE is active ($0/day cap not confirmed) — potential for prolonged ALE exploitation.', weight: 'MEDIUM' }
    ],
    topRisks: [
      { risk: 'Missing structural documentation — true scope of damage unknown, amount unverifiable', severity: 'HIGH', mitigationAction: 'Commission structural engineer within 48 hours — do not settle until received' },
      { risk: 'Claim amount at 97% of policy limit — deliberate under-ceiling pattern', severity: 'HIGH', mitigationAction: 'Independent Xactimate estimate required before any payment authorization' },
      { risk: 'Prior claim within 14 months for different peril — combined loss rate anomaly', severity: 'MEDIUM', mitigationAction: 'Review 2025-003 claim file for any overlap or inconsistency with current damage' }
    ],
    mitigatingFactors: ['IoT sensor data confirms fire event objectively', 'Fire Marshal determined ACCIDENTAL — no evidence of arson in photo or report', 'Insured immediately evacuated and notified authorities — appropriate behavior'],
    settlementGuidance: 'Do NOT settle until: (1) structural engineer assessment received, (2) independent Xactimate estimate completed, (3) SIU preliminary review completed. ALE authorization can proceed at approved daily rate during investigation.'
  },
  '2026-093': {
    overallFraudRisk: 'LOW',
    confidenceScore: 92,
    recommendation: 'APPROVE',
    executiveSummary: 'Claim 2026-093 (Roof Damage) passes all fraud vectors. The NWS storm event is confirmed, the contractor estimate aligns with regional benchmarks, and all photos are consistent with wind/hail damage. No prior claims on record. This claim is low-risk and can proceed to settlement.',
    vectors: [
      { vector: 'A', name: 'Cause-of-Loss Consistency', verdict: 'PASS', finding: 'Shingle displacement pattern, hail bruising, and exposed decking are all consistent with a 67 mph wind event with 0.9-inch hail — exactly matching NWS report for ZIP 77001 on March 8, 2026.', weight: 'HIGH' },
      { vector: 'B', name: 'Financial Motivation', verdict: 'PASS', finding: 'Claim amount ($18,450) is well within policy limits and within 6% of Xactimate regional benchmark for Houston roof repair. No financial pressure indicators.', weight: 'HIGH' },
      { vector: 'C', name: 'Documentation Integrity', verdict: 'PASS', finding: 'All documents received: photos, contractor estimate, and NWS storm verification. All addresses consistent. No missing documents.', weight: 'HIGH' },
      { vector: 'D', name: 'Technology Corroboration', verdict: 'PASS', finding: 'NWS NEXRAD radar data, ASOS surface observations, and storm spotter network all confirm the severe thunderstorm event in the 77001 area — objective third-party corroboration.', weight: 'HIGH' },
      { vector: 'E', name: 'Historical Pattern', verdict: 'PASS', finding: 'No prior claims on record for this insured. Clean history.', weight: 'MEDIUM' },
      { vector: 'F', name: 'Visual Evidence Integrity', verdict: 'PASS', finding: 'Photos show clean displacement (no evidence of pre-existing damage), hail impact pattern consistent with 0.9-inch diameter, and emergency tarp properly installed.', weight: 'MEDIUM' }
    ],
    topRisks: [],
    mitigatingFactors: ['NWS independently confirmed severe storm event', 'No prior claims — clean insured history', 'Contractor estimate within Xactimate benchmark', 'Emergency mitigation taken promptly', 'All documents complete and addresses consistent'],
    settlementGuidance: 'Approve claim and issue payment authorization. Schedule 30-day follow-up inspection to verify repair completion. Low risk — no holds required.'
  }
};

async function fraudVector(claim) {
  const model = getModel(true);
  const imagePaths = claim.damageImages || [];

  if (!model) {
    return FRAUD_VECTOR_SIMULATED[claim.id] || {
      overallFraudRisk: 'MEDIUM',
      confidenceScore: 50,
      recommendation: 'FURTHER_INVESTIGATION',
      executiveSummary: 'Gemini API not configured — using simulated fraud vector analysis.',
      vectors: [],
      topRisks: [],
      mitigatingFactors: [],
      settlementGuidance: 'Configure GEMINI_API_KEY for live analysis.'
    };
  }

  try {
    const imageParts = await loadImageParts(imagePaths);
    const contents = [{ text: FRAUD_VECTOR_PROMPT(claim) }, ...imageParts];
    const result = await model.generateContent(contents);
    const raw = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(raw);
  } catch (err) {
    console.error('fraudVector Gemini error:', err.message);
    return FRAUD_VECTOR_SIMULATED[claim.id] || {};
  }
}

module.exports = { photoReview, addressCompare, fraudVector };
