const express = require('express');
const router = express.Router();
const { billingRecords, dashboardStats } = require('../services/mockData');
const aiFactory = require('../ai-factory/factory');
const billingResolverAgent = require('../ai-factory/agents/billing-resolver');

router.get('/', (req, res) => {
  const { policy_id, status } = req.query;
  let result = [...billingRecords];
  if (policy_id) result = result.filter(b => b.policy_id === policy_id);
  if (status)    result = result.filter(b => b.status === status.toUpperCase());

  const summary = {
    total_billed:     result.filter(b => b.amount > 0).reduce((s, b) => s + b.amount, 0),
    total_reimbursed: Math.abs(result.filter(b => b.amount < 0).reduce((s, b) => s + b.amount, 0)),
    collected:        result.filter(b => b.status === 'PAID'    && b.amount > 0).reduce((s, b) => s + b.amount, 0),
    outstanding:      result.filter(b => b.status === 'PENDING' && b.amount > 0).reduce((s, b) => s + b.amount, 0),
    overdue:          result.filter(b => b.status === 'OVERDUE').reduce((s, b) => s + b.amount, 0),
  };
  res.json({ records: result, summary, total: result.length });
});

router.get('/stats/dashboard', (req, res) => {
  res.json(dashboardStats);
});

router.post('/auto-resolve', async (req, res) => {
  const { rowId, exCode, exType, balance, currency, holder, holderEmail, trigger,
          wireRef, employerSubsidy, hardshipText, remainingCycles } = req.body;

  if (!rowId || !exCode) {
    return res.status(400).json({ error: 'rowId and exCode are required' });
  }

  try {
    const result = await aiFactory.run(billingResolverAgent, {
      rowId, exCode, exType, balance, currency, holder, holderEmail, trigger,
      wireRef, employerSubsidy, hardshipText, remainingCycles,
    });
    res.json({ ...result, source: 'gemini' });
  } catch (err) {
    console.warn('[billing/auto-resolve] AI unavailable, using fallback:', err.message);
    res.json({ ...getMockResolution(exCode, { rowId, balance, currency, holder, holderEmail }), source: 'fallback' });
  }
});

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function getMockResolution(exCode, ctx) {
  const { rowId, balance, currency, holder, holderEmail } = ctx;
  const sym = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';

  const MAP = {
    UNMATCHED_WIRE: {
      resolution_type: 'auto_resolved', confidence: 0.92, status_after: 'Current',
      actions_taken: ['PolicyCore.Search(name:"J Miller", pet:"Waffles")', `BillingCore.ApplyPayment(policy:${rowId}, amount:${sym}${balance})`],
      lines: ['Wire memo parsed: "PREM WAFFLES J MILLR" → Owner: J. Miller, Pet: Waffles.', `PolicyCore match confirmed: Policy #PET-2026-1192 (confidence 92%).`, `${sym}${balance} applied to policy ledger · Balance cleared.`, `Audit ref: ${uid('AUDIT')}`],
      tool_calls: [{ tool: 'PolicyCore.Search()', result: 'Match: PET-2026-1192, John Miller, confidence: 0.92' }, { tool: 'BillingCore.ApplyPayment()', result: 'Payment applied · status → Current' }],
      audit_trail: `Gemini parsed the garbled wire memo and identified "WAFFLES" as a pet name and "J MILLR" as a truncated owner. PolicyCore search returned a single high-confidence match. Cash applied automatically and ledger balanced.`,
    },
    GROUP_SUBSIDY_MISMATCHED: {
      resolution_type: 'auto_resolved', confidence: 0.95, status_after: 'D2C_Individual_Retail',
      actions_taken: ['BillingCore.FreezeSubsidyPortion()', 'BillingCore.PivotToDirect()', `NotificationService.Send(to:${holderEmail})`],
      lines: [`Employer payroll deduction file mismatch confirmed for ${holder}.`, 'Account restructured: Group Subscribed → D2C Individual Retail.', `Employee notification dispatched to ${holderEmail}.`, `Transition ref: ${uid('PIVOT')}`],
      tool_calls: [{ tool: 'BillingCore.PivotToDirect()', result: 'Account type updated: D2C_Individual_Retail' }, { tool: 'NotificationService.Send()', result: `Email + SMS dispatched to ${holderEmail}` }],
      audit_trail: `Gemini identified the payroll file drop and confirmed no active retail fallback token. Account was restructured to D2C Individual Retail and a notification was sent explaining the subsidy disconnection and requesting backup card capture.`,
    },
    FX_VARIANCE: {
      resolution_type: 'auto_resolved', confidence: 0.99, status_after: 'Current',
      actions_taken: ['BillingCore.WriteOff()', `Ledger.PostFXVariance(ref:${uid('FXAL')})`],
      lines: [`FX variance ${sym}${balance} confirmed within corporate tolerance.`, 'Dunning bypassed · Clearing credit executed immediately.', `Balance posted to FX At-Risk Expense Ledger: ${uid('FXAL')}`, 'Policy returned to Current · No customer contact required.'],
      tool_calls: [{ tool: 'BillingCore.WriteOff()', result: 'Write-off executed · balance cleared' }, { tool: 'Ledger.PostFXVariance()', result: 'Ledger entry posted: FX_AT_RISK_EXPENSE' }],
      audit_trail: `Gemini evaluated the EUR/GBP variance and confirmed the ${sym}${balance} discrepancy is a standard currency rounding artefact well within the corporate tolerance limit. No customer dunning was warranted. Ledger entry posted automatically.`,
    },
    MORATORIUM_REQUESTED: {
      resolution_type: 'auto_resolved', confidence: 0.88, status_after: 'Monitored_Moratorium',
      actions_taken: ['PolicyCore.GetJurisdiction()', 'BillingCore.ApplyHoliday(days:60)', `NotificationService.Send(to:${holderEmail})`],
      lines: [`Hardship classification: Major Regional Economic Disruption (US NAIC eligible).`, '60-day moratorium applied per regulatory guidelines.', `Unpaid balance spread across ${8} remaining billing cycles.`, `Moratorium ref: ${uid('MOR')} · Coverage remains ACTIVE.`],
      tool_calls: [{ tool: 'PolicyCore.GetJurisdiction()', result: 'US/NAIC — 60-day moratorium permitted' }, { tool: 'BillingCore.ApplyHoliday()', result: 'Payment holiday applied · status → Monitored_Moratorium' }],
      audit_trail: `Gemini read the hardship statement and classified it as a qualifying regional economic event under US NAIC guidelines. A 60-day payment holiday was applied, the outstanding balance spread across remaining cycles, and a confirmation email sent to the policyholder.`,
    },
    RESIDUAL_BALANCE: {
      resolution_type: 'auto_resolved', confidence: 0.99, status_after: 'Current',
      actions_taken: [`BillingCore.WriteOff(amount:${sym}${balance})`, `Ledger.RouteToALAE(ref:${uid('ALAE')})`],
      lines: [`Residual balance ${sym}${balance} confirmed below write-off threshold.`, `Debt dismissed · debit routed to ALAE cost ledger.`, 'Policy exception flag cleared · no collection action required.'],
      tool_calls: [{ tool: 'BillingCore.WriteOff()', result: 'Write-off executed · balance cleared' }],
      audit_trail: `Gemini confirmed the ${sym}${balance} residual is a currency rounding artefact from annual premium recalculation. As it falls below the automated collection threshold, the amount was written off to the ALAE ledger.`,
    },
    TOKEN_MIGRATION_FAULT: {
      resolution_type: 'auto_resolved', confidence: 0.96, status_after: 'Token_Refresh_In_Progress',
      actions_taken: ['BillingCore.PauseDunning()', `VaultService.QuarantineToken(policy:${rowId})`, `CardNetwork.AccountUpdaterAPI(batch:${uid('BATCH')})`],
      lines: [`Token vault quarantine executed — legacy token flagged as migration fault (not customer default).`, 'Automated dunning countdown paused · no lapse risk triggered.', `Batch request queued in Visa/MC Account Updater API: ${uid('BATCH')}`, 'Updated token will map to Stripe BillingCore on retrieval.'],
      tool_calls: [{ tool: 'VaultService.QuarantineToken()', result: 'Token quarantined · dunning paused' }, { tool: 'CardNetwork.AccountUpdaterAPI()', result: 'Batch queued for token refresh' }],
      audit_trail: `Gemini identified this as a platform migration artefact, not a policyholder default. The legacy vault token was quarantined, dunning paused, and a token refresh batch submitted to the card network Account Updater API. No customer-facing action required.`,
    },
  };

  return MAP[exCode] || {
    resolution_type: 'escalated', confidence: 0.5, status_after: 'Escalated',
    lines: ['Exception type requires manual review.', 'Routed to billing supervisor queue.'],
    tool_calls: [], audit_trail: 'Exception type not eligible for automated resolution.',
  };
}

module.exports = router;
