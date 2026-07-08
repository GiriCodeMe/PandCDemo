import { useState } from 'react';
import axios from 'axios';

const EXCEPTION_ROWS = [
  {
    id: 'PET-2026-1192', holder: 'John Miller', holderEmail: 'j.miller@email.com',
    brand: 'Figo US', flag: '🇺🇸', exType: 'Card Expiring / Failed', exCode: 'STRIPE_HARD_DECLINE',
    balance: 45.50, currency: 'USD', daysArrears: 22, dunning: 2,
    trigger: 'Stripe webhook returned hard_decline. 2 automated retry attempts have failed.',
    hasOpenClaim: true, openClaimRef: 'CLM-2026-4471',
    resolution: 'mixed',
    actions: ['Generate Secure Pay-Link', 'Premium/Claims Hold'],
  },
  {
    id: 'PET-2026-8831', holder: 'Sarah Jenkins', holderEmail: 's.jenkins@email.com',
    brand: 'Embrace US', flag: '🇺🇸', exType: 'Bank Return (ACH)', exCode: 'ACH_R01',
    balance: 82.00, currency: 'USD', daysArrears: 8, dunning: 1,
    trigger: 'ACH routing returned code R01 (Insufficient Funds).',
    resolution: 'mixed',
    actions: ['Generate Secure Pay-Link', 'Swap Payment Method'],
  },
  {
    id: 'PET-UK-44912', holder: 'Oliver Smith', holderEmail: 'o.smith@email.co.uk',
    brand: 'Everypaw UK', flag: '🇬🇧', exType: 'BACS Direct Debit Cancelled', exCode: 'ADDACS',
    balance: 38.00, currency: 'GBP', daysArrears: 3, dunning: 1,
    trigger: 'Bank sent ADDACS instruction: "Instruction cancelled by payer."',
    resolution: 'mixed',
    actions: ['Generate Secure Pay-Link', 'Log Dispute'],
  },
  {
    id: 'ACC-992185', holder: 'Unassigned Cash', holderEmail: null,
    brand: 'IPG Corporate', flag: '🏢', exType: 'Unapplied Payment', exCode: 'UNMATCHED_WIRE',
    balance: 250.00, currency: 'USD', daysArrears: 1, dunning: 0,
    trigger: 'Wire transfer ref "PREM WAFFLES J MILLR" matches no active policy or quote record.',
    wireRef: 'PREM WAFFLES J MILLR',
    resolution: 'auto',
    actions: ['Search Policy DB', 'Issue Refund Check'],
  },
  {
    id: 'PET-2026-3301', holder: 'Michael Chen', holderEmail: 'm.chen@email.com',
    brand: 'Figo US', flag: '🇺🇸', exType: 'Fractional Variance', exCode: 'RESIDUAL_BALANCE',
    balance: 3.20, currency: 'USD', daysArrears: 2, dunning: 0,
    trigger: 'Residual balance from currency rounding on annual premium recalculation.',
    resolution: 'auto',
    actions: ['Waive Balance'],
  },
  {
    id: 'GRP-2026-0071', holder: 'Emma Davis (Fiserv Corp)', holderEmail: 'e.davis@fiserv.com',
    brand: 'Nationwide US', flag: '🏢', exType: 'Group Subsidy Mismatch', exCode: 'GROUP_SUBSIDY_MISMATCHED',
    balance: 38.25, currency: 'USD', daysArrears: 5, dunning: 1, employerSubsidy: 38.25,
    trigger: 'Employer payroll deduction file dropped employee ID E-04471. Employer 50% subsidy unreconciled.',
    resolution: 'auto',
    actions: ['Split-Billing: Pivot to Retail Direct'],
  },
  {
    id: 'MIG-2026-0014', holder: 'Robert Walsh', holderEmail: 'r.walsh@email.com',
    brand: 'Hartville US', flag: '🇺🇸', exType: 'Vault Token Unmapped', exCode: 'TOKEN_MIGRATION_FAULT',
    balance: 67.00, currency: 'USD', daysArrears: 0, dunning: 0,
    trigger: 'Legacy platform migration: vault token could not be mapped to Stripe BillingCore. Dunning paused.',
    resolution: 'auto',
    actions: ['Vault Token Quarantine & Batch Refresh'],
  },
  {
    id: 'CHB-2026-0088', holder: 'Lisa Torres', holderEmail: 'l.torres@email.com',
    brand: 'Trupanion US', flag: '🇺🇸', exType: 'Fraud Chargeback', exCode: 'CHARGEBACK_10_4',
    balance: 124.50, currency: 'USD', daysArrears: 1, dunning: 3,
    trigger: 'Chargeback code 10.4 (Other Fraud) received. Claim CLM-2026-7821 pending payout.',
    hasOpenClaim: true, openClaimRef: 'CLM-2026-7821',
    resolution: 'human',
    actions: ['Execute Fraud Lock & Freeze'],
  },
  {
    id: 'FX-2026-0033', holder: 'Sophie Müller', holderEmail: 's.muller@email.de',
    brand: 'Petplan EU', flag: '🇪🇺', exType: 'FX Settlement Variance', exCode: 'FX_VARIANCE',
    balance: 1.87, currency: 'EUR', daysArrears: 0, dunning: 0,
    trigger: 'Mid-day EUR/GBP rate fluctuation: £0.04 fractional settlement mismatch.',
    resolution: 'auto',
    actions: ['FX Variance Tolerance Write-Off'],
  },
  {
    id: 'PET-2026-5517', holder: 'James Okafor', holderEmail: 'j.okafor@email.com',
    brand: 'Embrace US', flag: '🇺🇸', exType: 'Hardship Request', exCode: 'MORATORIUM_REQUESTED',
    balance: 156.00, currency: 'USD', daysArrears: 12, dunning: 1, remainingCycles: 8,
    trigger: 'Policyholder cited major regional economic disruption. Requesting temporary premium freeze.',
    resolution: 'auto',
    actions: ['Apply Regulatory Moratorium / Holiday'],
  },
];

const DUNNING_CFG = {
  0: { label: 'Unmatched',         color: '#6b7280', bg: '#f3f4f6' },
  1: { label: 'Dunning L1',        color: '#d97706', bg: '#fef3c7' },
  2: { label: 'Dunning L2',        color: '#dc2626', bg: '#fee2e2' },
  3: { label: 'Dunning L3 · CRIT', color: '#991b1b', bg: '#fecaca' },
};

const RESOLUTION_CFG = {
  auto:   { label: '🤖 AI Auto',        color: '#065f46', bg: '#d1fae5', title: 'Gemini can resolve this automatically' },
  human:  { label: '👤 Human Required', color: '#991b1b', bg: '#fee2e2', title: 'SIU / supervisor action required' },
  mixed:  { label: '⚡ Customer Action', color: '#92400e', bg: '#fef3c7', title: 'Requires customer response' },
};

const WAIVE_THRESHOLD = { USD: 5,    GBP: 4,    EUR: 4    };
const FX_THRESHOLD    = { USD: 2.50, GBP: 2.00, EUR: 2.00 };

const ACTION_STYLES = {
  'Generate Secure Pay-Link':               { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
  'Premium/Claims Hold':                    { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' },
  'Swap Payment Method':                    { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
  'Log Dispute':                            { bg: '#fffbeb', border: '#fcd34d', color: '#92400e' },
  'Search Policy DB':                       { bg: '#f8fafc', border: '#e5e7eb', color: '#374151' },
  'Issue Refund Check':                     { bg: '#f0fdf4', border: '#a7f3d0', color: '#065f46' },
  'Waive Balance':                          { bg: '#f0fdf4', border: '#a7f3d0', color: '#065f46' },
  'Split-Billing: Pivot to Retail Direct':  { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af' },
  'Vault Token Quarantine & Batch Refresh': { bg: '#f5f3ff', border: '#ddd6fe', color: '#7c3aed' },
  'Execute Fraud Lock & Freeze':            { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' },
  'FX Variance Tolerance Write-Off':        { bg: '#f0fdf4', border: '#a7f3d0', color: '#065f46' },
  'Apply Regulatory Moratorium / Holiday':  { bg: '#f5f3ff', border: '#ddd6fe', color: '#7c3aed' },
};

function fmtCcy(amount, currency) {
  if (currency === 'GBP') return `£${amount.toFixed(2)}`;
  if (currency === 'EUR') return `€${amount.toFixed(2)}`;
  return `$${amount.toFixed(2)}`;
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const RC = {
  success: { bg: '#f0fdf4', border: '#a7f3d0', text: '#065f46', icon: '✅' },
  info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af', icon: 'ℹ️' },
  warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', icon: '⚠️' },
  danger:  { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '🔴' },
};

export default function Billing() {
  const [results, setResults]       = useState({});
  const [expanded, setExpanded]     = useState(null);
  const [escalModal, setEscalModal] = useState(null);
  const [morModal, setMorModal]     = useState(null);
  const [morDays, setMorDays]       = useState(60);
  const [aiLoading, setAiLoading]       = useState({});
  const [customResolved, setCustomResolved] = useState({});

  const totalAtRisk = EXCEPTION_ROWS.filter(r => r.dunning >= 1)
    .reduce((s, r) => s + (r.currency === 'USD' ? r.balance : r.balance * 1.26), 0);
  const pendingCancellations = EXCEPTION_ROWS.filter(r => r.dunning >= 2 || r.daysArrears >= 20).length;
  const unappliedCash = EXCEPTION_ROWS.filter(r => r.exCode === 'UNMATCHED_WIRE').reduce((s, r) => s + r.balance, 0);
  const autoCount   = EXCEPTION_ROWS.filter(r => r.resolution === 'auto').length;
  const humanCount  = EXCEPTION_ROWS.filter(r => r.resolution === 'human').length;

  const fire = (id, payload) => setResults(p => ({ ...p, [id]: payload }));

  const handleAutoResolve = async (row) => {
    setAiLoading(p => ({ ...p, [row.id]: true }));
    setExpanded(row.id);
    try {
      const res = await axios.post('/api/billing/auto-resolve', {
        rowId: row.id, exCode: row.exCode, exType: row.exType, balance: row.balance,
        currency: row.currency, holder: row.holder, holderEmail: row.holderEmail,
        trigger: row.trigger, wireRef: row.wireRef, employerSubsidy: row.employerSubsidy,
        remainingCycles: row.remainingCycles,
      });
      const d = res.data;
      const isFallback = d.source === 'fallback';
      const isResolved = d.resolution_type === 'auto_resolved';
      fire(row.id, {
        type: isResolved ? 'success' : 'warning',
        title: isResolved ? 'AI Auto-Resolved' : 'AI Escalation Required',
        status: d.status_after,
        lines: [...(d.lines || []), ...(isFallback ? ['⚠️ Gemini unavailable — result from mock resolver'] : [])],
        broadcast: row.exCode === 'CHARGEBACK_10_4',
        aiResolved: true,
        toolCalls: d.tool_calls || [],
        auditTrail: d.audit_trail,
        confidence: d.confidence,
        fallback: isFallback,
      });
    } catch {
      fire(row.id, { type: 'warning', title: 'AI Resolver Error', lines: ['Could not reach auto-resolve service. Use manual actions above.'] });
    } finally {
      setAiLoading(p => ({ ...p, [row.id]: false }));
    }
  };

  const handleAction = (row, action) => {
    const { id, balance, currency, holder, holderEmail, openClaimRef, employerSubsidy, remainingCycles } = row;
    setCustomResolved(p => ({ ...p, [id]: true }));
    switch (action) {
      case 'Generate Secure Pay-Link': {
        return fire(id, { type: 'info', title: 'Outbound Payment Link', status: 'Pending_Customer_Action',
          lines: [`Tokenized endpoint: ${uid('PLK')}`, `Pay-link dispatched via SMS + Email to ${holderEmail || 'policyholder'}.`, 'Lapse countdown paused · Link expires in 48 hours.', 'Row clears on successful payment webhook.'] });
      }
      case 'Premium/Claims Hold':
        return fire(id, { type: 'danger', title: 'Financial Suspension & Claims Freeze', status: 'In_Dunning | Claims: FROZEN',
          lines: [`Premium/Claims Hold executed on ${id}.`, `Open claim ${openClaimRef} — outbound distribution locked.`, `Payout frozen until ${fmtCcy(balance, currency)} cleared.`, 'Claims Workbench will display hold badge.'] });

      case 'Waive Balance': {
        const thr = WAIVE_THRESHOLD[currency] || 5;
        if (balance > thr) { setEscalModal({ rowId: id, action, balance, currency }); return; }
        return fire(id, { type: 'success', title: 'Manual Write-Off & Debt Dismissal', status: 'Current',
          lines: [`${fmtCcy(balance, currency)} written off for ${holder}.`, 'Exception flag cleared · Policy status → Current.', `ALAE ledger debit: ${uid('ALAE')}`, 'No further collection action required.'] });
      }
      case 'Split-Billing: Pivot to Retail Direct':
        return fire(id, { type: 'info', title: 'Corporate Group Subsidy Pivot', status: 'Pending_Employee_Card_Input',
          lines: [`Employer portion (${fmtCcy(employerSubsidy || balance, currency)}) frozen — payroll file mismatch confirmed.`, 'Billing restructured: Group Subscribed → D2C Individual Retail.', `Notification dispatched to ${holderEmail}.`, `Ref: ${uid('NOTIF')} · Coverage uninterrupted.`] });

      case 'Vault Token Quarantine & Batch Refresh':
        return fire(id, { type: 'warning', title: 'Vault Token Quarantine & Batch Refresh', status: 'Token_Refresh_In_Progress',
          lines: [`${id} flagged as soft exception — not a customer default.`, 'Dunning countdown paused · No lapse risk triggered.', `Visa/MC Account Updater API request queued: ${uid('BATCH')}`, 'Updated token will map to Stripe BillingCore on retrieval.'] });

      case 'Execute Fraud Lock & Freeze':
        return fire(id, { type: 'danger', title: 'Fraud Chargeback Containment', status: 'Critical_Fraud_Lock', broadcast: true,
          lines: [`Chargeback 10.4 — synchronous ecosystem broadcast triggered.`, `PolicyCore: Contract ${id} suspended.`, `ClaimCore: ${openClaimRef} distribution halted.`, 'BillingCore: Dunning retries halted · Dispute file compiled.'] });

      case 'FX Variance Tolerance Write-Off': {
        const fxThr = FX_THRESHOLD[currency] || 2.50;
        if (balance > fxThr) { setEscalModal({ rowId: id, action, balance, currency }); return; }
        return fire(id, { type: 'success', title: 'FX Variance Tolerance Write-Off', status: 'Current',
          lines: [`Variance ${fmtCcy(balance, currency)} within tolerance (${fmtCcy(fxThr, currency)}).`, 'Customer dunning bypassed · Clearing credit executed.', `FX At-Risk Expense Ledger: ${uid('FXAL')}`, 'Policy returned to Current.'] });
      }
      case 'Apply Regulatory Moratorium / Holiday':
        setMorModal({ rowId: id, balance, currency, holder, remainingCycles: remainingCycles || 8 });
        return;

      case 'Swap Payment Method':
        return fire(id, { type: 'info', title: 'Payment Method Update', lines: [`Method-swap link dispatched to ${holderEmail || 'policyholder'}.`, 'New mandate activates on next billing cycle.'] });
      case 'Log Dispute':
        return fire(id, { type: 'warning', title: 'Dispute Logged', lines: [`ADDACS case #DC-2026-${id.slice(-4)} opened.`, 'Bank notified. Resolution: 5 business days.'] });
      case 'Search Policy DB':
        return fire(id, { type: 'info', title: 'Policy DB Search', lines: ['No matching policy for wire ref "IPG-CORP-July".', 'Routed to manual reconciliation queue.'] });
      case 'Issue Refund Check':
        return fire(id, { type: 'success', title: 'Refund Check Issued', lines: [`Check #RC-${id.slice(-4)} issued for ${fmtCcy(balance, currency)}.`, 'Expected clearance: 5 business days.'] });
      default:
        return fire(id, { type: 'info', title: action, lines: [`${action} recorded.`] });
    }
  };

  const applyMoratorium = () => {
    const { rowId, balance, currency, holder, remainingCycles } = morModal;
    const spread = (balance / remainingCycles).toFixed(2);
    fire(rowId, { type: 'warning', title: 'Hardship Moratorium Applied', status: 'Monitored_Moratorium',
      lines: [`${morDays}-day moratorium granted for ${holder}.`, `Balance (${fmtCcy(balance, currency)}) spread across ${remainingCycles} remaining cycles.`, `Monthly spread: ${fmtCcy(parseFloat(spread), currency)} / cycle`, 'PolicyCore ACTIVE · Coverage uninterrupted.', `Ref: ${uid('MOR')}`] });
    setMorModal(null);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Billing Exception Dashboard</div>
            <div className="page-subtitle">EIS BillingCore · Stripe / BACS Orchestration · {EXCEPTION_ROWS.length} accounts require attention</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#d1fae5', color: '#065f46' }}>🤖 {autoCount} AI Auto</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#fee2e2', color: '#991b1b' }}>👤 {humanCount} Human</span>
            <span className="badge badge-danger" style={{ fontSize: 12, padding: '4px 10px' }}>🔴 {EXCEPTION_ROWS.filter(r => r.dunning >= 2).length} Critical</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid mb-20" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon">💰</span><span className="badge badge-danger">At Risk</span></div>
          <div className="kpi-value" style={{ color: '#dc2626' }}>${totalAtRisk.toFixed(2)}</div>
          <div className="kpi-label">Total Premium at Risk</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Accounts in active dunning states</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon">📅</span><span className="badge badge-warning">7-Day Window</span></div>
          <div className="kpi-value" style={{ color: '#d97706' }}>{pendingCancellations}</div>
          <div className="kpi-label">Pending Cancellations</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Policies reaching non-payment threshold</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon">🏦</span><span className="badge badge-info">Suspense</span></div>
          <div className="kpi-value" style={{ color: '#3b82f6' }}>${unappliedCash.toFixed(2)}</div>
          <div className="kpi-label">Unapplied Cash Balance</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Unmatched wire / check receipts</div>
        </div>
      </div>

      {/* Exception Grid */}
      <div className="card mb-20">
        <div className="card-header">
          <h2>Actionable Exception Grid</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge badge-muted" style={{ fontSize: 11 }}>Healthy accounts omitted</span>
            <span className="ai-tag">⚡ Live Webhook Feed</span>
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Policy / Account</th>
                <th>Brand</th>
                <th>Exception</th>
                <th>Balance</th>
                <th>Arrears</th>
                <th>State</th>
                <th>Resolution</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {EXCEPTION_ROWS.map(row => {
                const dunCfg = DUNNING_CFG[row.dunning] || DUNNING_CFG[0];
                const result = results[row.id];
                const rc     = result ? RC[result.type] : null;
                const resCfg = customResolved[row.id] && row.resolution === 'auto'
                  ? { label: '⚡ Custom Action', color: '#6b7280', bg: '#f3f4f6', title: 'Manual action applied' }
                  : RESOLUTION_CFG[row.resolution];
                const isHeld = result?.broadcast || result?.status?.includes('FROZEN');
                const loading = aiLoading[row.id];

                return [
                  <tr key={row.id}
                    style={{ background: row.dunning >= 3 ? '#fff0f0' : row.dunning === 2 ? '#fff8f8' : row.dunning === 1 ? '#fffdf4' : 'white', cursor: 'pointer' }}
                    onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1a2148', fontFamily: 'monospace' }}>{row.id}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{row.holder}</div>
                      {row.hasOpenClaim && (
                        <div style={{ fontSize: 10, fontWeight: 700, marginTop: 3, color: isHeld ? '#991b1b' : '#d97706' }}>
                          {isHeld ? '🔒 CLAIMS FROZEN' : `⚠️ Open: ${row.openClaimRef}`}
                        </div>
                      )}
                    </td>
                    <td><span>{row.flag}</span><span style={{ fontSize: 12, fontWeight: 600, marginLeft: 5 }}>{row.brand}</span></td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600, color: row.dunning >= 2 ? '#dc2626' : '#374151' }}>{row.exType}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace', marginTop: 1 }}>{row.exCode}</div>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: 14, color: row.dunning >= 2 ? '#dc2626' : '#374151' }}>{fmtCcy(row.balance, row.currency)}</td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: 13, color: row.daysArrears >= 20 ? '#dc2626' : row.daysArrears >= 7 ? '#d97706' : '#374151' }}>
                        {row.daysArrears}d
                      </span>
                    </td>
                    <td>
                      {result?.status ? (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: rc.bg, color: rc.text }}>{result.status}</span>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: dunCfg.bg, color: dunCfg.color }}>{dunCfg.label}</span>
                      )}
                    </td>
                    <td>
                      <span title={resCfg.title} style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: resCfg.bg, color: resCfg.color, cursor: 'default', whiteSpace: 'nowrap' }}>
                        {resCfg.label}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {/* AI Auto-Resolve button for eligible rows */}
                        {row.resolution === 'auto' && !result && (
                          <button onClick={() => handleAutoResolve(row)} disabled={loading}
                            style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, fontWeight: 800, cursor: loading ? 'wait' : 'pointer',
                              border: '1px solid #6ee7b7', background: loading ? '#f0fdf4' : '#d1fae5', color: '#065f46',
                              display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}>
                            {loading ? <><span style={{ fontSize: 13 }}>⏳</span> Resolving…</> : <><span>🤖</span> Auto-Resolve</>}
                          </button>
                        )}
                        {row.actions.map(a => {
                          const s = ACTION_STYLES[a] || {};
                          return (
                            <button key={a} onClick={() => handleAction(row, a)} style={{
                              fontSize: 11, padding: '5px 10px', borderRadius: 6, fontWeight: 700,
                              border: `1px solid ${s.border || '#e5e7eb'}`,
                              background: s.bg || '#f8fafc', color: s.color || '#374151',
                              cursor: 'pointer', whiteSpace: 'nowrap',
                            }}>{a}</button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>,

                  expanded === row.id && (
                    <tr key={`${row.id}-exp`}>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <div style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px dashed #e5e7eb', borderBottom: '1px dashed #e5e7eb' }}>
                          {/* Loading state */}
                          {loading && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                              <span style={{ fontSize: 20 }}>🤖</span>
                              <div>
                                <div style={{ fontWeight: 700, color: '#065f46', fontSize: 13 }}>Gemini is analyzing this exception…</div>
                                <div style={{ fontSize: 12, color: '#059669' }}>Parsing trigger data, calling PolicyCore, executing resolution tools</div>
                              </div>
                            </div>
                          )}
                          <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 20 }}>
                            {/* Dunning timeline */}
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10 }}>Dunning Timeline</div>
                              {[
                                { day: 0,  label: 'Initial Payment Failure' },
                                { day: 3,  label: 'Automated Retry 1' },
                                { day: 7,  label: 'Automated Retry 2 + Email Notice' },
                                { day: 14, label: 'SMS Warning — Account At Risk' },
                                { day: 20, label: 'Final Notice — Manual Review Required' },
                                { day: 30, label: 'Non-Payment Cancellation' },
                              ].map((step, i) => {
                                const past = row.daysArrears >= step.day && step.day < 30;
                                return (
                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                    <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                                      background: step.day === 30 ? '#f3f4f6' : past ? '#dc2626' : '#e5e7eb',
                                      color: step.day === 30 ? '#9ca3af' : past ? 'white' : '#9ca3af',
                                    }}>{past ? '✓' : step.day}</div>
                                    <div style={{ fontSize: 12, color: past ? '#374151' : '#9ca3af', fontWeight: past ? 600 : 400 }}>
                                      Day {step.day} — {step.label}
                                    </div>
                                  </div>
                                );
                              })}
                              <div style={{ marginTop: 10, padding: '8px 10px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 11, color: '#6b7280' }}>
                                {row.currency === 'GBP' ? '🇬🇧 FCA (UK): 14-day notice before cancellation.'
                                  : row.currency === 'EUR' ? '🇪🇺 EIOPA (EU): 30-day notice · FX disputes within 10 business days.'
                                  : '🇺🇸 NAIC (US): 30-day grace period · Cancellation notice ≥ 10 days in advance.'}
                              </div>
                            </div>

                            {/* Action / AI result */}
                            {result && rc && (
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10 }}>
                                  {result.aiResolved ? 'AI Resolution Result' : 'Action Result'}
                                </div>
                                <div style={{ background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 10, padding: '14px 16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                                    <span style={{ fontSize: 20, flexShrink: 0 }}>{result.aiResolved ? '🤖' : rc.icon}</span>
                                    <div>
                                      <div style={{ fontWeight: 800, fontSize: 13, color: rc.text }}>{result.title}</div>
                                      {result.confidence != null && (
                                        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 3 }}>
                                          Gemini confidence: <strong>{Math.round(result.confidence * 100)}%</strong>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Fraud broadcast visualization */}
                                  {result.broadcast && (
                                    <div style={{ marginBottom: 12, background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: '10px 12px', fontSize: 11 }}>
                                      {[
                                        { icon: '🏦', label: 'BillingCore', action: 'Dunning retries halted' },
                                        { icon: '📋', label: 'PolicyCore',  action: 'Contract suspended' },
                                        { icon: '⚖️', label: 'ClaimCore',   action: 'All payouts frozen' },
                                      ].map((t, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 2 ? 6 : 0 }}>
                                          <span style={{ fontSize: 14 }}>{t.icon}</span>
                                          <span style={{ fontWeight: 700, color: rc.text, width: 90 }}>{t.label}</span>
                                          <span style={{ color: '#991b1b' }}>→ {t.action}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {result.lines.map((line, i) => (
                                    <div key={i} style={{ fontSize: 12, color: rc.text, display: 'flex', gap: 6, marginBottom: 5 }}>
                                      <span style={{ flexShrink: 0 }}>→</span><span>{line}</span>
                                    </div>
                                  ))}

                                  {/* AI tool calls */}
                                  {result.toolCalls?.length > 0 && (
                                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${rc.border}` }}>
                                      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>API Calls Executed</div>
                                      {result.toolCalls.map((tc, i) => (
                                        <div key={i} style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace', marginBottom: 3 }}>
                                          <span style={{ color: '#7c3aed', fontWeight: 700 }}>{tc.tool}</span> → {tc.result}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {result.status && (
                                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${rc.border}`, fontSize: 11, color: rc.text }}>
                                      New status: <strong>{result.status}</strong>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BIL-E01 Escalation Modal */}
      {escalModal && (
        <>
          <div onClick={() => setEscalModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 12, padding: 28, width: 460, zIndex: 1000, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔒</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#dc2626' }}>Escalation Required — BIL-E01</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Balance exceeds self-service write-off authority</div>
              </div>
            </div>
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#991b1b', marginBottom: 16, lineHeight: 1.6 }}>
              <strong>{fmtCcy(escalModal.balance, escalModal.currency)}</strong> exceeds the write-off limit ({escalModal.currency === 'GBP' ? '£4' : escalModal.currency === 'EUR' ? '€4' : '$5'}). Approval token routed to Billing Supervisor queue.
            </div>
            <div style={{ fontSize: 13, color: '#374151', marginBottom: 20, lineHeight: 1.8 }}>
              <strong>Escalation token:</strong> <span style={{ fontFamily: 'monospace', color: '#7c3aed' }}>ESC-BIL-{escalModal.rowId.replace(/-/g, '')}</span><br />
              <strong>Action:</strong> {escalModal.action} · <strong>Balance:</strong> {fmtCcy(escalModal.balance, escalModal.currency)}
            </div>
            <button className="btn btn-primary" onClick={() => setEscalModal(null)}>Acknowledge &amp; Close</button>
          </div>
        </>
      )}

      {/* Moratorium Modal */}
      {morModal && (
        <>
          <div onClick={() => setMorModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 12, padding: 28, width: 500, zIndex: 1000, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛡️</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#7c3aed' }}>Hardship Moratorium</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{morModal.holder} · {fmtCcy(morModal.balance, morModal.currency)} outstanding</div>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Select Moratorium Window</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[30, 60, 90].map(d => (
                  <button key={d} onClick={() => setMorDays(d)} style={{
                    flex: 1, padding: '12px 0', borderRadius: 8, fontWeight: 700, fontSize: 14,
                    border: `2px solid ${morDays === d ? '#7c3aed' : '#e5e7eb'}`,
                    background: morDays === d ? '#f5f3ff' : 'white',
                    color: morDays === d ? '#7c3aed' : '#374151', cursor: 'pointer',
                  }}>{d} Days</button>
                ))}
              </div>
            </div>
            <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: '#6d28d9', marginBottom: 20, lineHeight: 1.8 }}>
              Balance <strong>{fmtCcy(morModal.balance, morModal.currency)}</strong> spread across <strong>{morModal.remainingCycles} remaining cycles</strong>.<br />
              Monthly spread: <strong>{fmtCcy(morModal.balance / morModal.remainingCycles, morModal.currency)} / cycle</strong> · PolicyCore: ACTIVE
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setMorModal(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={applyMoratorium}>Apply {morDays}-Day Moratorium</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
