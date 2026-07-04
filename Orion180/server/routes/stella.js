const express = require('express');
const router = express.Router();
const gemini = require('../services/gemini');
const mockClaims = require('../data/mockClaims');

let claims = mockClaims;

/* POST /api/stella/chat */
router.post('/chat', async (req, res) => {
  const { message, context = {}, history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  let claimData = null;
  if (context.claimId) {
    claimData = claims.find(c => c.id === context.claimId) || null;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({
      reply: simulatedReply(message, context, claimData),
      suggestions: claimData?.nextSteps?.nextBestActions?.slice(0, 3) || []
    });
  }

  try {
    const result = await gemini.chat(message, context, claimData, history);
    res.json(result);
  } catch (err) {
    console.error('Stella Gemini error:', err.message);
    res.json({
      reply: `I'm having trouble connecting right now. ${simulatedReply(message, context, claimData)}`,
      suggestions: claimData?.nextSteps?.nextBestActions?.slice(0, 3) || []
    });
  }
});

const TERM_EXPLANATIONS = {
  'missing structural documentation': `"Missing Structural Documentation" is a fraud flag that means the insured has not provided a licensed structural engineer's assessment of the property damage. For fire claims, this is critical because: (1) it's needed to determine if load-bearing elements were compromised, (2) it verifies the true extent of structural damage vs. cosmetic damage, and (3) its absence makes it impossible to confirm the claim amount is accurate. Without it, the claim cannot be settled — a Florida-licensed P.E. report is required before re-occupancy and final settlement.`,
  'structural documentation': `"Missing Structural Documentation" flags that no licensed structural engineer has assessed the property. In a fire or severe storm claim, structural docs prove the damage is real and quantify it accurately. The Miami-Dade Fire Marshal specifically flagged this for claim 2026-102 — the south wall load-bearing status is undetermined, meaning ALE may need to be extended and the settlement amount could change materially once assessed.`,
  'proximity to coastal surge zone': `"Proximity to Coastal Surge Zone" is a fraud risk flag because properties near flood/surge zones have higher rates of fraudulent claims that attempt to combine: (1) standard fire or wind damage with (2) flood damage that is excluded under a standard HO-3 policy. Miami's 33109 zip code (Miami Beach/Coastal) is a FEMA-designated Coastal High Hazard Area (Zone V). Adjusters must verify that the claimed damage is strictly from the covered peril (fire, wind) and not from flood or surge — which requires separate flood insurance under NFIP.`,
  'coastal surge': `The "Coastal Surge Zone" flag means the property at 456 Oak Ave, Miami FL 33109 is located in a FEMA Zone V (coastal high hazard area). Under an HO-3 policy, flood and surge damage is excluded. This flag triggers a review to ensure the fire damage claim does not include any water intrusion that could be attributable to storm surge rather than fire suppression water. The proximity also elevates overall risk scoring since these properties have higher claim frequency and severity.`,
  'ale': `ALE stands for "Additional Living Expense." It's a coverage in homeowners policies (Coverage D) that pays for the extra costs of living away from home when a covered loss makes your home uninhabitable. For claim 2026-102 (Mary Johnson, fire), ALE is active because the property was deemed uninhabitable by Miami-Dade Fire Rescue. ALE covers hotel costs, increased food expenses, and temporary rental costs — but only up to the policy ALE limit and only for the time reasonably needed to repair/rebuild. Carrier has ALE benefits active and the insured is currently in hotel accommodation.`,
  'siu': `SIU stands for "Special Investigation Unit" — an internal insurance fraud investigation team. An SIU referral is triggered when a claim reaches certain fraud risk thresholds (typically 70+ score) or shows multiple concurrent fraud indicators. For claim 2026-102, the SIU review was triggered by: (1) missing structural docs, (2) coastal surge zone proximity, (3) claim amount near policy limit, and (4) a prior claim within 24 months. SIU conducts interviews, reviews records, and may involve external investigators. An SIU referral does NOT mean fraud is confirmed — it means the claim requires enhanced due diligence before settlement.`,
  'claim amount near policy limit': `"Claim Amount Near Policy Limit" flags that the claimed loss ($52,800) is within 90% of the policy's maximum dwelling coverage. This is a known fraud pattern — bad actors often inflate claim amounts to maximize recovery without triggering the suspicion of an "over-limit" claim. Combined with other flags, it's one of the reasons claim 2026-102 has a High fraud risk score of 78/100. The adjuster should ensure all line-item repairs are supported by independent estimates.`,
  'prior claim': `"Prior Claim Within 24 Months" indicates the insured (Mary Johnson) filed a previous claim (2025-003, Water Damage, $14,500) less than 2 years ago. While prior claims alone are not evidence of fraud, multiple claims in a short window — especially for different perils — is a recognized fraud indicator. Combined with the high claim amount and missing documentation, it contributes to the elevated fraud score. The adjuster should review the prior claim file for any inconsistencies or overlapping damage.`
};

function simulatedReply(message, context, claimData) {
  const msg = message.toLowerCase();

  // ── Explanation / "what does this mean" handler ─────────────────────────
  const isExplain = msg.includes('explain') || msg.includes('what does this mean') ||
    msg.includes('what is') || msg.includes('what are') || msg.includes('tell me about') ||
    msg.includes('meaning of') || msg.includes('mean by');

  if (isExplain || msg.length > 10) {
    for (const [term, explanation] of Object.entries(TERM_EXPLANATIONS)) {
      if (msg.includes(term)) return explanation;
    }
  }

  if (!claimData) {
    if (msg.includes('fraud') || msg.includes('risk')) {
      return 'Claim #2026-102 (Mary Johnson) currently has the highest fraud risk score at 78/100 — flagged for missing structural documentation and proximity to a coastal surge zone. Claim #2026-108 (John Smith) is Medium risk at 42/100 due to an address mismatch on the repair invoice.';
    }
    if (msg.includes('next') || msg.includes('action') || msg.includes('do')) {
      return 'On the dashboard, I recommend prioritizing Claim #2026-102 — it has a High fraud risk and is missing critical structural documentation. Claim #2026-108 needs a plumber\'s report to move forward. Both are currently blocking settlement.';
    }
    return 'I can help you manage claims across the Carrier platform. Ask me about a specific claim\'s fraud risk, missing documents, next actions, reserve status, or ask me to explain any insurance term.';
  }

  if (msg.includes('fraud') || msg.includes('risk')) {
    const flags = claimData.fraudAnalysis?.flags || [];
    if (flags.length === 0) return `Claim #${claimData.id} has a Low fraud risk score of ${claimData.fraudAnalysis?.score}/100. No fraud flags detected.`;
    const flagDetails = flags.map(f => {
      const key = Object.keys(TERM_EXPLANATIONS).find(t => f.toLowerCase().includes(t.split(' ')[0]));
      return key ? `• ${f}: ${TERM_EXPLANATIONS[key].split('.')[0]}.` : `• ${f}`;
    }).join('\n');
    return `Claim #${claimData.id} has a ${claimData.fraudRisk} fraud risk score of ${claimData.fraudAnalysis?.score}/100.\n\nFlags:\n${flagDetails}`;
  }
  if (msg.includes('next') || msg.includes('action') || msg.includes('do') || msg.includes('recommend')) {
    const actions = claimData.nextSteps?.nextBestActions || [];
    if (actions.length === 0) return `No next best actions are available yet for claim #${claimData.id}.`;
    return `For claim #${claimData.id}, the recommended next actions are:\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;
  }
  if (msg.includes('document') || msg.includes('missing')) {
    const missing = claimData.missingDocuments || [];
    if (missing.length === 0) return `All required documents have been received for claim #${claimData.id}.`;
    return `Claim #${claimData.id} is missing: ${missing.join(', ')}. These must be collected before advancing to the decision stage.`;
  }
  if (msg.includes('reserve') || msg.includes('amount') || msg.includes('cost')) {
    return `Claim #${claimData.id} has initial reserves set at $${claimData.initialReserves?.toLocaleString()}. The claim amount is $${claimData.claimAmount?.toLocaleString()}.`;
  }
  if (msg.includes('status')) {
    return `Claim #${claimData.id} is currently ${claimData.status} at Step ${claimData.currentStep} of 5. Decision status: ${claimData.nextSteps?.decisionStatus || 'Pending'}.`;
  }
  if (msg.includes('iot') || msg.includes('sensor') || msg.includes('smart home')) {
    if (claimData.iotSensors) {
      const alert = claimData.iotSensors.alertTriggeredAt;
      return `IoT sensor data for claim #${claimData.id} confirms the water leak event at ${new Date(alert).toLocaleTimeString()}. The kitchen water sensor triggered "Leak Detected" and the automatic shut-off valve closed. Humidity spiked to 87%RH and floor moisture reached 94% saturation — all consistent with a sudden plumbing failure. This IoT data corroborates the FNOL narrative and supports the claim.`;
    }
    return `No IoT sensor data is available for claim #${claimData.id}.`;
  }
  if (msg.includes('ale') || msg.includes('hotel') || msg.includes('living expense')) {
    return TERM_EXPLANATIONS.ale;
  }
  if (msg.includes('siu') || msg.includes('investigation')) {
    return TERM_EXPLANATIONS.siu;
  }

  return `Claim #${claimData.id} for ${claimData.insuredName} — ${claimData.causeOfLoss}, $${claimData.claimAmount?.toLocaleString()}, ${claimData.status}, ${claimData.fraudRisk} fraud risk. Ask me about fraud flags, next actions, missing docs, or explain any term.`;
}

module.exports = router;
