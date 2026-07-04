const { GoogleGenerativeAI } = require('@google/generative-ai');

const PAGE_DESCRIPTIONS = {
  dashboard: 'The Claims Dashboard — shows KPI summary cards (new claims, fraud alerts, cycle times), a filterable claims table, an AI risk insight panel, and a regional claim distribution chart.',
  claims: 'The Claims list page — a full paginated table of all 121 claims with search and status/risk filters.',
  'report-claim': 'The Report New Claim form — a 4-section FNOL intake form where adjusters enter policyholder info, property address, incident details, and upload documents.',
  'claim-submission': 'Step 1: Claim Submission Review — read-only review of all submitted FNOL data with an AI-generated narrative, primary peril classification, and initial reserve amount.',
  'claim-validation': 'Step 2: Claim Validation — AI policy verification result, coverage eligibility badges, uploaded document review, and the Carrier Documents Insight panel flagging missing documents and data inconsistencies.',
  'insights-review': 'Step 3: Insights & Review — visual before/after damage analysis, fraud risk gauge, field adjuster assignment, external analysis recommendations, insured history, and comparative analysis.',
  'communication-log': 'Step 4: Communications Log — threaded communication history (calls, SMS, portal), AI-generated communication templates, and a smart insight on which template drives fastest resolution.',
  'next-steps': 'Step 5: Next Steps — AI final decision status, decision rationale, and Next Best Actions panel with prioritized recommendations for the adjuster.',
  reports: 'The Reports page — claim analytics and insights dashboard.'
};

const STEP_NAMES = {
  1: 'claim-submission',
  2: 'claim-validation',
  3: 'insights-review',
  4: 'communication-log',
  5: 'next-steps'
};

function buildSystemPrompt(context, claimData) {
  const pageKey = context.step ? STEP_NAMES[context.step] : (context.page || 'dashboard');
  const pageDesc = PAGE_DESCRIPTIONS[pageKey] || PAGE_DESCRIPTIONS[context.page] || 'the Carrier claims platform';

  let prompt = `You are Stella, an intelligent AI claims assistant for Carrier Insurance. You assist claims adjusters in managing homeowners insurance claims efficiently and accurately.

Your personality: Professional, concise, and proactive. You anticipate what adjusters need and surface the most relevant information immediately.

Current context: The adjuster is on ${pageDesc}
`;

  if (claimData) {
    const addr = claimData.address;
    const addrStr = [addr?.line1, addr?.line2, addr?.city, addr?.state, addr?.zip].filter(s => s && s.trim()).join(', ');
    const iotStr = claimData.iotSensors
      ? `Alert at ${claimData.iotSensors.alertTriggeredAt} — ${(claimData.iotSensors.sensors || []).filter(s => s.status === 'ALERT' || s.status === 'HIGH').map(s => s.name + ': ' + s.value + ' ' + s.unit).join(', ')}`
      : 'None';
    const historyStr = (claimData.insuredHistory || []).length === 0
      ? 'No prior claims'
      : claimData.insuredHistory.map(h => `${h.claimId} (${h.date}): ${h.cause} $${h.amount.toLocaleString()} — ${h.status}`).join('; ');
    const docStr = (claimData.documents || []).map(d => d.name).join(', ') || 'None';

    prompt += `
Active claim in context:
- Claim #: ${claimData.id}
- Insured: ${claimData.insuredName} (${claimData.insuredSegmentation}, sentiment: ${claimData.aiSentiment})
- Policy: ${claimData.policyNumber}
- Primary Peril: ${claimData.primaryPeril} | Cause of Loss: ${claimData.causeOfLoss}
- Property Address: ${addrStr}
- Region: ${claimData.region || '—'} | Adjuster: ${claimData.adjuster || '—'}
- Claim Amount: $${claimData.claimAmount?.toLocaleString()} | Date of Loss: ${claimData.dateOfLoss}
- Status: ${claimData.status} | Current Step: ${claimData.currentStep} of 5
- Initial Reserves: $${claimData.initialReserves?.toLocaleString()}
- Is Home Livable: ${claimData.isHomeLivable ? 'Yes' : 'No'}
- Coverage: ${(claimData.coverageVerification?.coverages || []).join(', ')}
- Coverage Rationale: ${claimData.coverageVerification?.rationale || '—'}
- Missing Documents: ${claimData.missingDocuments?.length > 0 ? claimData.missingDocuments.join(', ') : 'None'}
- Data Inconsistencies: ${claimData.dataInconsistencies?.length > 0 ? claimData.dataInconsistencies.join('; ') : 'None'}
- Document Addresses (from files): ${(claimData.documentAddresses || []).map(d => d.source + ': ' + d.address).join('; ') || 'None'}
- Fraud Risk: ${claimData.fraudRisk} (score: ${claimData.fraudAnalysis?.score}/100)
- Fraud Flags: ${claimData.fraudAnalysis?.flags?.length > 0 ? claimData.fraudAnalysis.flags.join('; ') : 'None'}
- IoT Sensor Data: ${iotStr}
- Prior Claims History: ${historyStr}
- Uploaded Documents: ${docStr}
- Decision Status: ${claimData.nextSteps?.decisionStatus || 'Pending'}
- Next Best Actions: ${claimData.nextSteps?.nextBestActions?.join(' | ') || 'None yet'}
- FNOL Narrative: ${claimData.fnolNarrative}
`;
  }

  prompt += `
Instructions:
- Answer questions about this claim using only the data provided above. Never invent policy details or claim facts.
- When asked about next actions, return them as a numbered list matching the Next Best Actions above, with brief rationale for each.
- For fraud risk questions, explain the specific flags driving the score.
- Keep responses concise — 3-5 sentences max unless a list is appropriate.
- If asked something outside your claim data context, say so honestly rather than guessing.
- Always end action suggestions with a confidence note (e.g. "Based on current claim data").
`;

  return prompt;
}

async function chat(message, context, claimData, history = []) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: buildSystemPrompt(context, claimData),
    generationConfig: { temperature: 0.3, maxOutputTokens: 512 }
  });

  // Convert our message history format to Gemini's {role, parts} format
  const geminiHistory = history
    .filter(msg => msg.role === 'user' || msg.role === 'stella')
    .map(msg => ({
      role: msg.role === 'stella' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

  const chatSession = model.startChat({ history: geminiHistory });
  const result = await chatSession.sendMessage(message);
  const reply = result.response.text();
  const suggestions = extractSuggestions(reply, claimData);
  return { reply, suggestions };
}

function extractSuggestions(reply, claimData) {
  if (!claimData) return [];
  const actions = claimData.nextSteps?.nextBestActions || [];
  return actions.slice(0, 3).map(a => a.replace(/^[0-9]+\.\s*/, ''));
}

module.exports = { chat };
