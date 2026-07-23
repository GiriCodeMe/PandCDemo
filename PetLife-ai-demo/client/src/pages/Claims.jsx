import { useState, useEffect } from 'react';
import { getClaims, getPolicies, parseInvoice, adjudicateClaim } from '../api';

const TABS = [
  { id: 'queue',       icon: '📋', label: 'Claim Queue' },
  { id: 'ingest',      icon: '📥', label: 'Documents' },
  { id: 'extract',     icon: '🤖', label: 'AI Extraction' },
  { id: 'reserves',    icon: '💰', label: 'Reserves' },
  { id: 'fraud',       icon: '🔍', label: 'Fraud Analysis' },
  { id: 'subrogation', icon: '⚖️',  label: 'Subrogation' },
  { id: 'policy',      icon: '👤', label: 'Policy Review' },
  { id: 'triage',      icon: '⚡', label: 'Adjudication' },
  { id: 'compliance',  icon: '📜', label: 'Compliance' },
  { id: 'resolve',     icon: '✅', label: 'Resolution' },
];

const STATUS_CFG = {
  APPROVED:           { cls: 'badge-success', label: 'Approved' },
  PARTIALLY_APPROVED: { cls: 'badge-warning', label: 'Partial' },
  DENIED:             { cls: 'badge-danger',  label: 'Denied' },
  PENDING:            { cls: 'badge-info',    label: 'Pending' },
};

const AUTHORITY_MATRIX = [
  { role: 'Claims_Adjuster_Tier1', maxSingle: 500,    maxAgg: 1500,   currency: 'USD' },
  { role: 'Claims_Adjuster_Tier2', maxSingle: 2500,   maxAgg: 7500,   currency: 'USD' },
  { role: 'Claims_Manager',        maxSingle: 10000,  maxAgg: 25000,  currency: 'USD' },
  { role: 'VP_of_Claims / SIU',    maxSingle: null,   maxAgg: null,   currency: 'USD' },
];

const FRAUD_RULES = [
  { id: 'FRD-001', vector: 'Invoice Tampering',              severity: 'CRITICAL', action: 'Payment frozen — routed to Special Investigations' },
  { id: 'FRD-002', vector: 'Unusual Vet-Owner Pattern',      severity: 'HIGH',     action: 'Automatic payment block — adjudicator warning' },
  { id: 'FRD-003', vector: 'Rapid High-Value Submission',    severity: 'MEDIUM',   action: 'Flagged for medical audit review' },
];

function FileZone({ label, accept, file, onFile, hint }) {
  return (
    <label className={`upload-zone ${file ? 'has-file' : ''}`} style={{ cursor: 'pointer' }}>
      <input type="file" accept={accept} onChange={e => onFile(e.target.files[0])} />
      <div className="upload-icon">{file ? '✅' : '📄'}</div>
      <div className="upload-text">{file ? file.name : label}</div>
      <div className="upload-hint">{file ? `${(file.size / 1024).toFixed(1)} KB · Click to change` : hint}</div>
    </label>
  );
}

function ConfidenceBar({ value, label }) {
  const tier = value >= 0.85 ? 'high' : value >= 0.60 ? 'medium' : 'low';
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600 }}>{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="confidence-bar">
        <div className={`confidence-fill ${tier}`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}

function ScoreMeter({ score, label }) {
  const color = score >= 80 ? '#dc2626' : score >= 50 ? '#f59e0b' : '#10b981';
  const tier  = score >= 80 ? 'CRITICAL' : score >= 50 ? 'ELEVATED' : 'LOW';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 8px' }}>
        <svg viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${(score / 100) * 213.6} 213.6`} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color }}>{score}</div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color, background: `${color}18`, padding: '2px 8px', borderRadius: 20, display: 'inline-block' }}>{tier}</div>
    </div>
  );
}

// Reserve accumulator pipeline calculation
function calcReserves(invoice, policy) {
  if (!invoice || !policy) return null;
  const gross         = invoice.total_due || 0;
  const annualBenefit = policy.coverage?.annual_benefit_max || 5000;
  const benefitUsed   = policy.financials?.annual_benefit_used || 0;
  const remaining     = Math.max(0, annualBenefit - benefitUsed);
  const initialReserve = Math.min(gross, remaining);

  const deductible       = policy.coverage?.deductible || 0;
  const deductibleMet    = policy.coverage?.deductible_met || false;
  const deductibleApplied = deductibleMet ? 0 : Math.min(deductible, initialReserve);
  const afterDeductible  = initialReserve - deductibleApplied;

  const reimbPct         = (100 - (policy.coverage?.coinsurance_pct || 20)) / 100;
  const afterCoins       = afterDeductible * reimbPct;

  const exclusionDeduct  = 0; // simplified
  const netReserve       = Math.max(0, afterCoins - exclusionDeduct);

  return { gross, remaining, initialReserve, deductibleApplied, afterDeductible, reimbPct, afterCoins, netReserve };
}

// Mock fraud score computation
function calcFraudScore(invoice, selectedClaim) {
  if (!invoice) return { score: 5, triggered: [] };
  const triggers = [];
  let score = 5;

  const dos = invoice.invoice_date ? new Date(invoice.invoice_date) : null;
  const today = new Date();
  const daysSince = dos ? Math.floor((today - dos) / 86400000) : 999;
  if (invoice.total_due > 3500 && daysSince <= 30) {
    score += 40; triggers.push({ id: 'FRD-003', reason: `High-value claim ($${invoice.total_due?.toFixed(2)}) submitted ${daysSince} days after service — pre-existing condition spike pattern.`, severity: 'MEDIUM' });
  }
  if (invoice.clinic_name?.toLowerCase().includes('test') || !invoice.clinic_name) {
    score += 20; triggers.push({ id: 'FRD-002', reason: 'Clinic name absent or flagged — vet identity unverified.', severity: 'HIGH' });
  }
  if (selectedClaim?.source === 'FNOL' && daysSince <= 5) {
    score += 10;
  }
  return { score: Math.min(score, 100), triggered: triggers };
}

// Mock TPL keyword detection
function detectTPL(invoice) {
  const keywords = ['attacked', 'daycare', 'vehicle', 'grooming', 'breeder', 'negligence', 'bit by', 'struck by'];
  const text = JSON.stringify(invoice || '').toLowerCase();
  return keywords.find(k => text.includes(k)) || null;
}

export default function Claims() {
  const [activeTab, setActiveTab] = useState('queue');
  const [claims, setClaims]       = useState([]);
  const [policies, setPolicies]   = useState([]);
  const [selectedClaim, setSelectedClaim]   = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [invoiceFile, setInvoiceFile] = useState(null);
  const [photoFile, setPhotoFile]     = useState(null);

  const [extracting, setExtracting]     = useState(false);
  const [adjudicating, setAdjudicating] = useState(false);
  const [extractResult, setExtractResult] = useState(null);
  const [adjResult, setAdjResult]         = useState(null);
  const [resolution, setResolution]       = useState(null);
  const [notes, setNotes]                 = useState('');
  const [emailText, setEmailText]         = useState('');
  const [cobChecked, setCobChecked]       = useState(false);
  const [recoveryCreated, setRecoveryCreated] = useState(false);
  const [userRole, setUserRole]           = useState('Claims_Adjuster_Tier1');
  const [emailSent, setEmailSent]         = useState(false);
  const [adjFallback, setAdjFallback]     = useState(false);
  const [workflowError, setWorkflowError] = useState(null);
  const [auditTs, setAuditTs] = useState({});

  useEffect(() => {
    const localClaims = JSON.parse(localStorage.getItem('claimsQueue') || '[]');
    getClaims()
      .then(r => {
        const apiClaims = r.data.claims || [];
        const apiIds = new Set(apiClaims.map(c => c.claim_id));
        const merged = [...localClaims.filter(c => !apiIds.has(c.claim_id)), ...apiClaims];
        setClaims(merged);
      })
      .catch(() => setClaims(localClaims));
    getPolicies().then(r => setPolicies(r.data.policies || [])).catch(() => {});
  }, []);

  const selectClaim = (claim) => {
    setSelectedClaim(claim);
    const pol = policies.find(p => p.policy_id === claim.policy_id);
    setSelectedPolicy(pol || null);
    setExtractResult(null); setAdjResult(null); setResolution(null);
    setCobChecked(false); setRecoveryCreated(false); setEmailSent(false); setAdjFallback(false);
    setAuditTs({ claimSelected: new Date().toLocaleTimeString() });
    setActiveTab('ingest');
  };

  const handleExtract = async () => {
    if (!invoiceFile) return;
    setExtracting(true);
    setWorkflowError(null);
    try {
      const res = await parseInvoice(invoiceFile);
      setExtractResult(res.data);
      setAuditTs(t => ({ ...t, extracted: new Date().toLocaleTimeString() }));
      setActiveTab('extract');
    } catch (e) {
      setWorkflowError('AI extraction failed — server unreachable. Please try again.');
      setActiveTab('extract');
    } finally { setExtracting(false); }
  };

  const handleAdjudicate = async () => {
    if (!extractResult?.invoice || !selectedPolicy) return;
    setAdjudicating(true);
    setWorkflowError(null);
    try {
      const res = await adjudicateClaim(extractResult.invoice, selectedPolicy.policy_id);
      setAdjResult(res.data);
      setAdjFallback(res.data.source === 'fallback');
      setAuditTs(t => ({ ...t, adjudicated: new Date().toLocaleTimeString() }));
      setActiveTab('triage');
    } catch (e) {
      setWorkflowError('AI adjudication failed — server unreachable. Please try again.');
      setActiveTab('triage');
    } finally { setAdjudicating(false); }
  };

  const handleResolve = (action) => {
    const templates = {
      APPROVE: `Dear ${selectedPolicy?.holder?.name || 'Policyholder'},\n\nWe are pleased to confirm your claim has been APPROVED.\n\nApproved amount: $${adjResult?.adjudication?.total_approved?.toFixed(2) || 'TBC'}\n\nPayment will be processed within 5 business days.\n\nKind regards,\nPetLife AI Claims Team`,
      DENY: `Dear ${selectedPolicy?.holder?.name || 'Policyholder'},\n\nWe regret to inform you that your claim has been DECLINED.\n\nReason: ${adjResult?.adjudication?.explanation || 'See policy terms.'}\n\nYou have the right to appeal within 30 days.\n\nKind regards,\nPetLife AI Claims Team`,
      INFO: `Dear ${selectedPolicy?.holder?.name || 'Policyholder'},\n\nThank you for your claim submission.\n\nWe require additional information to process your claim:\n- Original veterinary invoice\n- Complete SOAP notes\n- Proof of payment\n\nPlease submit within 14 days.\n\nKind regards,\nPetLife AI Claims Team`,
    };
    setResolution(action);
    setAuditTs(t => ({ ...t, resolved: new Date().toLocaleTimeString() }));
    setEmailText(templates[action] || '');
  };

  const invoice  = extractResult?.invoice;
  const adjData  = adjResult?.adjudication;
  const policy   = selectedPolicy;

  const reserves   = calcReserves(invoice, policy);
  const fraudData  = calcFraudScore(invoice, selectedClaim);
  const tplKeyword = detectTPL(invoice);

  const complexityFlags = [];
  if (adjData?.line_decisions?.some(l => l.status === 'DENIED')) complexityFlags.push({ label: `${adjData.line_decisions.filter(l => l.status === 'DENIED').length} line(s) denied by policy rules`, severity: 'MEDIUM', icon: '🚫' });
  if (invoice?.total_due > 1000) complexityFlags.push({ label: 'High-value claim (>$1,000) — senior review recommended', severity: 'MEDIUM', icon: '💵' });
  const complexityScore = complexityFlags.length === 0 ? 'LOW' : complexityFlags.some(f => f.severity === 'HIGH') ? 'HIGH' : 'MEDIUM';

  const approvedAmount = adjData?.total_approved || 0;
  const authorityRole  = AUTHORITY_MATRIX.find(r => r.role === userRole);
  const exceedsAuthority = authorityRole?.maxSingle != null && approvedAmount > authorityRole.maxSingle;

  const claimDays = selectedClaim?.submitted
    ? Math.floor((new Date() - new Date(selectedClaim.submitted)) / 86400000)
    : 0;
  const slaBreachWarning = claimDays >= 20;

  const ledgerObject = adjData ? {
    financialEvent: 'Claim_Payment_Issued',
    claimReference: selectedClaim?.claim_id,
    currency: 'USD',
    accountingEntries: [
      { ledgerCode: '10100-CashDisbursement',                  type: 'Credit', amount: +(approvedAmount).toFixed(2) },
      { ledgerCode: '50200-PaidLosses-Illness',                type: 'Debit',  amount: +(approvedAmount * 0.9).toFixed(2) },
      { ledgerCode: '50300-AllocatedLossAdjustmentExpense',    type: 'Debit',  amount: +(approvedAmount * 0.1).toFixed(2) },
    ],
  } : null;

  const tabDone = {
    extract:     !!extractResult,
    reserves:    !!reserves,
    fraud:       !!extractResult,
    subrogation: cobChecked,
    policy:      !!extractResult,
    triage:      !!adjData,
    compliance:  !!selectedClaim,
    resolve:     !!resolution,
  };

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Claims Adjudicator Workbench</div>
            <div className="page-subtitle">AI-powered claim review — select a claim from the queue to begin</div>
          </div>
          {selectedClaim && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="badge badge-info">{selectedClaim.claim_id}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedClaim.pet} · {selectedClaim.holder}</span>
              {slaBreachWarning && <span style={{ background: '#dc2626', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>⚠ SLA DAY {claimDays}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="card mb-20" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {TABS.map(tab => {
            const disabled = tab.id !== 'queue' && !selectedClaim;
            const done = tabDone[tab.id] || false;
            return (
              <button key={tab.id} onClick={() => { if (!disabled) { setActiveTab(tab.id); setWorkflowError(null); } }} disabled={disabled}
                style={{
                  padding: '12px 16px', border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #e84040' : '3px solid transparent',
                  background: activeTab === tab.id ? '#fafafa' : 'white',
                  color: disabled ? '#d1d5db' : activeTab === tab.id ? '#1a1d2e' : '#6b7280',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                {done ? '✅' : tab.icon} {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {workflowError && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>{workflowError}</div>
      )}

      {/* ── TAB: Queue ── */}
      {activeTab === 'queue' && (
        <div className="card">
          <div className="card-header">
            <h2>Submitted Claims Queue</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="badge badge-info">{claims.length} claims</span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>Including FNOL submissions</span>
            </div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Claim ID</th><th>Pet / Holder</th><th>Submitted</th><th>Condition</th><th>Billed</th><th>Status</th></tr>
              </thead>
              <tbody>
                {claims.map(c => {
                  const s = STATUS_CFG[c.status] || { cls: 'badge-muted', label: c.status };
                  const isSelected = selectedClaim?.claim_id === c.claim_id;
                  return (
                    <tr key={c.claim_id} onClick={() => selectClaim(c)}
                      style={{ cursor: 'pointer', background: isSelected ? '#e8edff' : '', outline: isSelected ? '2px solid #7c3aed' : '' }}>
                      <td>
                        <span className="td-id" style={{ color: '#7c3aed', textDecoration: 'underline', cursor: 'pointer' }}>{c.claim_id}</span>
                        {c.source === 'FNOL' && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: '#ede9fe', color: '#7c3aed' }}>FNOL</span>}
                      </td>
                      <td><div style={{ fontWeight: 600 }}>{c.pet}</div><div className="text-muted text-sm">{c.holder}</div></td>
                      <td className="text-muted text-sm">{c.submitted}</td>
                      <td>{c.condition}</td>
                      <td style={{ fontWeight: 600 }}>${(c.billed || 0).toFixed(2)}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: Documents ── */}
      {activeTab === 'ingest' && (
        <div>
          <div className="ai-panel mb-20">
            <div className="ai-panel-header"><span className="ai-panel-icon">📥</span><span className="ai-panel-title">Document Ingestion Panel</span></div>
            <p style={{ fontSize: 13, color: '#374151' }}>Upload the unstructured claim documents submitted by the pet parent. Gemini will parse and extract structured data for adjudication.</p>
          </div>

          <div className="grid-2 mb-20">
            <div>
              <div className="section-label mb-8" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Veterinary Invoice
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#dc2626', borderRadius: 4, padding: '1px 6px' }}>Required</span>
              </div>
              <FileZone label="Upload Invoice PDF" accept=".pdf,.png,.jpg,.jpeg" file={invoiceFile} onFile={setInvoiceFile} hint="PDF or image · Max 25MB" />
            </div>
            <div>
              <div className="section-label mb-8" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Pet Photo
                <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', background: '#f3f4f6', borderRadius: 4, padding: '1px 6px' }}>Optional</span>
              </div>
              <FileZone label="Upload Pet Photo" accept=".jpg,.jpeg,.png,.webp" file={photoFile} onFile={setPhotoFile} hint="For breed verification reference" />
            </div>
          </div>

          <div className="card mb-16">
            <div className="card-header"><h3>Policy Lookup</h3></div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Link to Policy</label>
                  <select className="form-select" value={selectedPolicy?.policy_id || ''} onChange={e => {
                    const pol = policies.find(p => p.policy_id === e.target.value);
                    setSelectedPolicy(pol || null);
                  }}>
                    <option value="">Select policy...</option>
                    {policies.map(p => <option key={p.policy_id} value={p.policy_id}>{p.policy_id} — {p.pet.name} ({p.holder.name})</option>)}
                  </select>
                </div>
                {selectedPolicy && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
                    <span style={{ fontSize: 20 }}>🐾</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{selectedPolicy.pet.name} · {selectedPolicy.pet.breed}</div>
                      <div className="text-muted text-sm">{selectedPolicy.holder.name} · {selectedPolicy.coverage.type}</div>
                    </div>
                    <span className={`badge ${selectedPolicy.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{selectedPolicy.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button className="btn btn-ai btn-lg" onClick={handleExtract} disabled={!invoiceFile || extracting}>
            {extracting ? <><span className="spinner" /> Gemini Extracting Data...</> : '✨ Start AI Analysis'}
          </button>
          {extracting && <div className="loading-bar mt-8" />}
        </div>
      )}

      {/* ── TAB: AI Extraction ── */}
      {activeTab === 'extract' && (
        <div>
          <div className="ai-panel mb-20">
            <div className="ai-panel-header"><span className="ai-panel-icon">🤖</span><span className="ai-panel-title">AI Extraction & Data Summary</span><span className="ai-tag">✨ Gemini</span></div>
          </div>

          {!extractResult ? (
            <div className="alert alert-warning">No extraction results yet. Go to Documents and run AI Analysis first.</div>
          ) : (
            <div>
              {invoice && (
                <div className="result-card mb-20">
                  <div className="result-header">
                    <span style={{ fontSize: 18 }}>📄</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>Invoice Extracted Data</div>
                      <div className="text-muted text-sm">{invoice.clinic_name}</div>
                    </div>
                    <span className="badge badge-success ml-auto">✓ Parsed</span>
                    {extractResult.source === 'fallback' && <span title="Sample data" style={{ fontSize: 13, marginLeft: 6, color: '#f59e0b' }}>⚠️</span>}
                  </div>
                  <div className="result-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', fontSize: 13, marginBottom: 14 }}>
                      {[['Invoice #', invoice.invoice_number], ['Date', invoice.invoice_date], ['Patient', invoice.patient_name], ['Species', invoice.species], ['Breed', invoice.breed], ['Owner', invoice.owner_name], ['Currency', invoice.currency || 'USD']].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', gap: 4 }}>
                          <span style={{ color: '#6b7280', minWidth: 70 }}>{k}:</span>
                          <span style={{ fontWeight: 600 }}>{v || '—'}</span>
                        </div>
                      ))}
                    </div>
                    <div className="section-label mb-8">Line Items</div>
                    <table className="data-table" style={{ fontSize: 12 }}>
                      <thead><tr><th>Description</th><th>Category</th><th>Code</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                      <tbody>
                        {invoice.line_items?.map((li, i) => (
                          <tr key={i}>
                            <td>{li.description}</td>
                            <td><span className="badge badge-muted" style={{ fontSize: 10 }}>{li.category}</span></td>
                            <td className="font-mono" style={{ fontSize: 11 }}>{li.procedure_code || li.diagnosis_code || '—'}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>${li.amount?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr><td colSpan={3} style={{ fontWeight: 700, fontSize: 13, padding: '10px 16px' }}>Total Due</td><td style={{ textAlign: 'right', fontWeight: 800, fontSize: 15, padding: '10px 16px' }}>${invoice.total_due?.toFixed(2)}</td></tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('reserves')}>View Reserves →</button>
                <button className="btn btn-outline" onClick={() => setActiveTab('fraud')}>Fraud Analysis →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Reserves ── */}
      {activeTab === 'reserves' && (
        <div>
          <div className="ai-panel mb-20">
            <div className="ai-panel-header">
              <span className="ai-panel-icon">💰</span>
              <span className="ai-panel-title">Financial Reserve Management</span>
            </div>
            <p style={{ fontSize: 13, color: '#374151' }}>The reserve is automatically calculated from the invoice amount and your remaining annual benefit. The pipeline shows how your deductible, co-insurance, and exclusions reduce the initial reserve to the final net payout amount.</p>
          </div>

          {!reserves ? (
            <div className="alert alert-warning">Invoice and policy required. Complete AI Extraction and link a policy first.</div>
          ) : (
            <div>
              {/* Initial Reserve */}
              <div className="card mb-16">
                <div className="card-header">
                  <h2>Initial Reserve</h2>
                  <span className="badge badge-success">Auto-Calculated</span>
                </div>
                <div className="card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                    {[
                      ['Gross Invoice',        `$${reserves.gross.toFixed(2)}`,         '#374151'],
                      ['Remaining Annual Limit',`$${reserves.remaining.toFixed(2)}`,    '#0369a1'],
                      ['Initial Reserve',       `$${reserves.initialReserve.toFixed(2)}`,'#059669'],
                    ].map(([k, v, color]) => (
                      <div key={k} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{k}</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 6, padding: '8px 12px' }}>
                    Formula: <code>Initial Reserve = min(${reserves.gross.toFixed(2)}, ${reserves.remaining.toFixed(2)}) = ${reserves.initialReserve.toFixed(2)}</code>
                  </div>
                </div>
              </div>

              {/* Accumulator Pipeline */}
              <div className="card mb-16">
                <div className="card-header">
                  <h2>Payment Calculation Pipeline</h2>
                  <span className="badge badge-muted">Step-by-Step</span>
                </div>
                <div className="card-body">
                  {[
                    { step: '1', label: 'Gross Extracted Value', amount: reserves.gross,            color: '#6b7280', note: 'From AI invoice extraction' },
                    { step: '2', label: 'After Deductible Ingestion', amount: reserves.afterDeductible, color: '#0369a1', note: `Applied: $${reserves.deductibleApplied.toFixed(2)} deductible` },
                    { step: '3', label: 'After Co-insurance Fraction', amount: reserves.afterCoins,  color: '#7c3aed', note: `${(reserves.reimbPct * 100).toFixed(0)}% reimbursement rate applied` },
                    { step: '4', label: 'After Exclusion Deductions', amount: reserves.afterCoins,   color: '#d97706', note: 'No exclusions applicable' },
                    { step: '5', label: 'Net Reserve (Ledger Entry)', amount: reserves.netReserve,   color: '#059669', note: 'Posted to financial ledger' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px dashed #e5e7eb' : 'none' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.color, color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.step}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1d2e' }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{s.note}</div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>${s.amount.toFixed(2)}</div>
                      {i < 4 && <div style={{ color: '#9ca3af', fontSize: 18 }}>↓</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reserve Status */}
              <div className="card mb-16">
                <div className="card-header">
                  <h2>Reserve Status</h2>
                  <span className="badge badge-info">Live</span>
                </div>
                <div className="card-body">
                  <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>
                    If any line item is denied during adjudication, the reserve is automatically reduced to reflect only approved amounts. Current pending reserve: <strong>${reserves.netReserve.toFixed(2)}</strong>.
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 14px', flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Erosion Latency</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#059669' }}>&lt;500ms</div>
                    </div>
                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 14px', flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Financial Leakage</div>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#0369a1' }}>$0.00</div>
                    </div>
                    <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>Reserve Status</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: '#374151' }}>PROVISIONAL</div>
                    </div>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('fraud')}>Continue to Fraud Analysis →</button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Fraud Analysis ── */}
      {activeTab === 'fraud' && (
        <div>
          <div className="ai-panel mb-20">
            <div className="ai-panel-header">
              <span className="ai-panel-icon">🔍</span>
              <span className="ai-panel-title">Fraud Risk Assessment</span>
            </div>
            <p style={{ fontSize: 13, color: '#374151' }}>Automated fraud checks run on every claim — system-level validation first, then AI behavioural analysis. The score determines whether the claim goes straight-through or requires manual review.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, marginBottom: 16 }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
              <ScoreMeter score={fraudData.score} label="Fraud Score" />
            </div>
            <div className="card">
              <div className="card-header"><h3>Routing Decision</h3></div>
              <div className="card-body">
                {fraudData.score >= 80 ? (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#dc2626', fontSize: 15, marginBottom: 6 }}>🔴 SIU Referral Required</div>
                    <div style={{ fontSize: 13, color: '#991b1b' }}>Fraud score exceeds threshold (≥80). Payment authorization is frozen. File has been routed to Special Investigations Unit. Adjudicator cannot release payment without SIU clearance.</div>
                  </div>
                ) : fraudData.score >= 50 ? (
                  <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#92400e', fontSize: 15, marginBottom: 6 }}>🟡 Adjudicator Review Required</div>
                    <div style={{ fontSize: 13, color: '#b45309' }}>Elevated fraud indicators detected. Manual adjudicator review required before release. STP routing is blocked.</div>
                  </div>
                ) : (
                  <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800, color: '#059669', fontSize: 15, marginBottom: 6 }}>🟢 Straight-Through Auto-Adjudication Gate</div>
                    <div style={{ fontSize: 13, color: '#065f46' }}>Fraud score is within acceptable range. Claim qualifies for straight-through processing (STP). Automated adjudication permitted.</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tier 1 checks */}
          <div className="card mb-16">
            <div className="card-header"><h3>Tier 1 — System Checks</h3><span className="badge badge-muted">Automated</span></div>
            <div className="card-body">
              {[
                { check: 'Duplicate Invoice Detection',   result: 'CLEAR',    note: 'Invoice number not found in prior 90-day window.' },
                { check: 'Vet Clinic ID Validation',     result: invoice?.clinic_name ? 'CLEAR' : 'FLAGGED', note: invoice?.clinic_name ? `Clinic "${invoice?.clinic_name}" validated against registry.` : 'Clinic name absent — cannot validate against known vet registry.' },
                { check: 'Policy Active at Date of Service', result: 'CLEAR', note: 'Policy status ACTIVE on date of service.' },
                { check: 'Claim Amount vs History',      result: invoice?.total_due > 3000 ? 'REVIEW' : 'CLEAR', note: invoice?.total_due > 3000 ? 'Claim amount is in the top 5% for this breed/condition profile.' : 'Claim amount within expected historical range.' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: i < 3 ? '1px solid #f3f4f6' : 'none', gap: 12 }}>
                  <div style={{ fontSize: 13, color: '#374151' }}>{t.check}</div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: t.result === 'CLEAR' ? '#d1fae5' : t.result === 'REVIEW' ? '#fef3c7' : '#fee2e2', color: t.result === 'CLEAR' ? '#065f46' : t.result === 'REVIEW' ? '#92400e' : '#991b1b', display: 'block', marginBottom: 3 }}>{t.result}</span>
                    <div style={{ fontSize: 11, color: '#6b7280', maxWidth: 280 }}>{t.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tier 2 rules */}
          <div className="card mb-16">
            <div className="card-header"><h3>AI Behavioural Checks</h3><span className="ai-tag">✨ AI</span></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Check</th><th>Risk Level</th><th>Status</th><th>Outcome</th></tr></thead>
                <tbody>
                  {FRAUD_RULES.map(rule => {
                    const hit = fraudData.triggered.find(t => t.id === rule.id);
                    return (
                      <tr key={rule.id}>
                        <td style={{ fontSize: 13, fontWeight: 500 }}>{rule.vector}</td>
                        <td><span className={`badge ${rule.severity === 'CRITICAL' ? 'badge-danger' : rule.severity === 'HIGH' ? 'badge-warning' : 'badge-info'}`}>{rule.severity}</span></td>
                        <td><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: hit ? '#fee2e2' : '#d1fae5', color: hit ? '#991b1b' : '#065f46' }}>{hit ? 'TRIGGERED' : 'CLEAR'}</span></td>
                        <td style={{ fontSize: 11, color: '#6b7280' }}>{hit ? hit.reason : rule.action}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('subrogation')}>Continue to Subrogation →</button>
        </div>
      )}

      {/* ── TAB: Subrogation ── */}
      {activeTab === 'subrogation' && (
        <div>
          <div className="ai-panel mb-20">
            <div className="ai-panel-header">
              <span className="ai-panel-icon">⚖️</span>
              <span className="ai-panel-title">Subrogation & Recovery</span>
            </div>
            <p style={{ fontSize: 13, color: '#374151' }}>Check if the pet has dual insurance coverage with another provider, detect if a third party may be responsible for the injury, and open a recovery file if applicable.</p>
          </div>

          {/* COB Cross-Match */}
          <div className="card mb-16">
            <div className="card-header">
              <h2>Dual-Coverage Check</h2>
              <span className="badge badge-muted">Cross-Carrier Lookup</span>
            </div>
            <div className="card-body">
              {!cobChecked ? (
                <div>
                  <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>
                    System will query the corporate data mesh (Figo · Embrace · Everypaw) for concurrent policies by Microchip_ID and Owner_Last_Name.
                  </div>
                  <button className="btn btn-primary" onClick={() => { setCobChecked(true); setAuditTs(t => ({ ...t, cobChecked: new Date().toLocaleTimeString() })); }}>
                    Run COB Cross-Match
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, color: '#059669', fontSize: 13, marginBottom: 4 }}>✓ No concurrent coverage found</div>
                    <div style={{ fontSize: 12, color: '#374151' }}>Microchip ID {policy?.pet?.microchip || 'N/A'} and owner surname cross-referenced across Figo, Embrace, and Everypaw books. No active concurrent pet insurance policy detected. Full liability assigned to this policy.</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Liability Share = 100% (this policy only). No proportional split required.</div>
                </div>
              )}
            </div>
          </div>

          {/* TPL Detection */}
          <div className="card mb-16">
            <div className="card-header">
              <h2>Third-Party Liability Detection</h2>
              <span className="badge badge-muted">Keyword Scan</span>
            </div>
            <div className="card-body">
              {tplKeyword ? (
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: 13, marginBottom: 4 }}>⚠ TPL Keyword Detected: "{tplKeyword}"</div>
                  <div style={{ fontSize: 12, color: '#b45309' }}>The claim narrative contains a keyword indicating potential third-party fault. A recovery sub-file should be opened for subrogation professionals.</div>
                </div>
              ) : (
                <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontWeight: 700, color: '#059669', fontSize: 13, marginBottom: 4 }}>✓ No TPL Keywords Detected</div>
                  <div style={{ fontSize: 12, color: '#374151' }}>Keywords scanned: attacked, daycare, vehicle, grooming, breeder, negligence. No third-party fault indicators found in claim narrative.</div>
                </div>
              )}
            </div>
          </div>

          {/* Recovery File */}
          <div className="card mb-16">
            <div className="card-header">
              <h2>Recovery File</h2>
            </div>
            <div className="card-body">
              {tplKeyword ? (
                !recoveryCreated ? (
                  <div>
                    <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>TPL trigger satisfied. A parallel SUB-RECOVERY file can be initialized for subrogation professionals.</div>
                    <button className="btn btn-accent" onClick={() => setRecoveryCreated(true)}>
                      Generate SUB-RECOVERY-{selectedClaim?.claim_id}
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontWeight: 700, color: '#7c3aed', fontSize: 13, marginBottom: 4 }}>✓ Recovery File Created</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#374151', marginBottom: 6 }}>SUB-RECOVERY-{selectedClaim?.claim_id}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Locked in subrogation workspace. Recovery target: commercial liability carrier / negligent party.</div>
                  </div>
                )
              ) : (
                <div style={{ fontSize: 13, color: '#9ca3af' }}>No TPL keywords detected — recovery file initialization not required for this claim.</div>
              )}
            </div>
          </div>

          <button className="btn btn-primary btn-lg" onClick={() => setActiveTab('policy')}>Continue to Policy Review →</button>
        </div>
      )}

      {/* ── TAB: Policy Dashboard ── */}
      {activeTab === 'policy' && (
        <div>
          {!policy ? (
            <div className="alert alert-warning">No policy selected. Return to Documents and select a policy.</div>
          ) : (
            <div className="grid-2 mb-20">
              <div className="card">
                <div className="card-header" style={{ background: '#0a0f2c' }}>
                  <h3 style={{ color: 'white' }}>Policy Details</h3>
                  <span className={`badge ${policy.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{policy.status}</span>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ fontSize: 32 }}>🐾</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>{policy.pet.name}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{policy.pet.breed} · {policy.pet.species} · {policy.pet.sex}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>DOB: {policy.pet.dob} · Microchip: {policy.pet.microchip}</div>
                    </div>
                  </div>
                  {[['Name', policy.holder.name], ['Email', policy.holder.email], ['Phone', policy.holder.phone], ['Postcode', policy.holder.postcode]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                      <span style={{ color: '#6b7280', width: 70 }}>{k}</span>
                      <span style={{ fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ fontWeight: 700, fontSize: 13, marginTop: 12, marginBottom: 8 }}>Coverage</div>
                  {[
                    ['Policy ID', policy.policy_id], ['Type', policy.coverage.type],
                    ['Annual Benefit', `$${policy.coverage.annual_benefit_max?.toLocaleString()}`],
                    ['Deductible', `$${policy.coverage.deductible}`],
                    ['Reimbursement', `${100 - policy.coverage.coinsurance_pct}%`],
                    ['Policy Start', policy.dates.start], ['Renewal', policy.dates.renewal],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '5px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#6b7280' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="card mb-16">
                  <div className="card-header"><h3>Benefit Utilisation</h3></div>
                  <div className="card-body">
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600 }}>Annual Benefit Used</span>
                        <span>${policy.financials?.annual_benefit_used?.toFixed(2)} / ${policy.coverage.annual_benefit_max?.toLocaleString()}</span>
                      </div>
                      <div className="confidence-bar" style={{ height: 10 }}>
                        <div style={{ height: '100%', borderRadius: 5, background: '#3b82f6', width: `${(policy.financials?.annual_benefit_used / policy.coverage.annual_benefit_max * 100).toFixed(1)}%`, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ background: policy.coverage.deductible_met ? '#f0fdf4' : '#fef2f2', border: `1px solid ${policy.coverage.deductible_met ? '#86efac' : '#fca5a5'}`, borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Deductible</div>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>${policy.coverage.deductible}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: policy.coverage.deductible_met ? '#059669' : '#dc2626' }}>{policy.coverage.deductible_met ? '✓ Met' : '✗ Not Met'}</div>
                      </div>
                      <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>Coinsurance</div>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>{100 - policy.coverage.coinsurance_pct}% / {policy.coverage.coinsurance_pct}%</div>
                        <div style={{ fontSize: 11, color: '#0369a1' }}>Insurer / Owner</div>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="btn btn-ai btn-lg btn-full" onClick={handleAdjudicate} disabled={!extractResult?.invoice || adjudicating}>
                  {adjudicating ? <><span className="spinner" />Adjudicating...</> : '⚡ Run AI Adjudication'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Adjudication ── */}
      {activeTab === 'triage' && (
        <div>
          {adjFallback && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span><strong>Gemini AI unavailable</strong> — adjudication results are estimated from mock data and should not be used for payment decisions.</span>
            </div>
          )}
          {!adjData ? (
            <div className="alert alert-warning">No adjudication results. Go to Policy Review and run AI Adjudication first.</div>
          ) : (
            <div>
              <div className="grid-3 mb-20">
                <div className={`decision-banner ${adjData.decision === 'APPROVED' ? 'approve' : adjData.decision === 'PARTIAL' ? 'partial' : 'denied'}`}>
                  <span className="decision-icon">{adjData.decision === 'APPROVED' ? '✅' : adjData.decision === 'PARTIAL' ? '⚠️' : '❌'}</span>
                  <div>
                    <div className="decision-title">{adjData.decision}</div>
                    <div className="decision-sub">AI recommendation</div>
                    <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>${adjData.total_approved?.toFixed(2)}</div>
                    <div className="decision-sub">of ${adjData.total_billed?.toFixed(2)} billed</div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>Complexity</div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: complexityScore === 'LOW' ? '#10b981' : complexityScore === 'MEDIUM' ? '#f59e0b' : '#ef4444' }}>{complexityScore}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{complexityFlags.length} flag{complexityFlags.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>Financial Summary</div>
                    {[['Total Billed', `$${adjData.total_billed?.toFixed(2)}`], ['Deductible', `$${adjData.deductible_applied?.toFixed(2)}`], ['Coinsurance', `$${adjData.coinsurance_applied?.toFixed(2)}`], ['Approved', `$${adjData.total_approved?.toFixed(2)}`]].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                        <span style={{ color: '#6b7280' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card mb-20">
                <div className="card-header"><h3>Line-by-Line Decision</h3></div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Description</th><th>Billed</th><th>Eligible</th><th>Approved</th><th>Status</th><th>Rules Applied</th></tr></thead>
                    <tbody>
                      {adjData.line_decisions?.map((l, i) => (
                        <tr key={i}>
                          <td>{l.description}</td>
                          <td>${l.billed_amount?.toFixed(2)}</td>
                          <td>${l.eligible_amount?.toFixed(2)}</td>
                          <td style={{ fontWeight: 700 }}>${l.approved_amount?.toFixed(2)}</td>
                          <td><span className={`badge ${l.status === 'APPROVED' ? 'badge-success' : l.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`}>{l.status}</span></td>
                          <td style={{ fontSize: 11 }}>{l.applied_rules?.join(', ')}{l.denial_reason && <div style={{ color: '#ef4444', marginTop: 2 }}>{l.denial_reason}</div>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="ai-panel mb-20">
                <div className="ai-panel-header"><span className="ai-panel-icon">✨</span><span className="ai-panel-title">Gemini Explanation</span></div>
                <p style={{ fontSize: 13, color: '#374151' }}>{adjData.explanation}</p>
              </div>

              <button className="btn btn-accent btn-lg" onClick={() => setActiveTab('compliance')}>Continue to Compliance →</button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Compliance ── */}
      {activeTab === 'compliance' && (
        <div>
          <div className="ai-panel mb-20">
            <div className="ai-panel-header">
              <span className="ai-panel-icon">📜</span>
              <span className="ai-panel-title">Compliance & Authority</span>
            </div>
          </div>

          {/* SLA Timeline */}
          <div className="card mb-16">
            <div className="card-header">
              <h2>SLA Status</h2>
              <span className={`badge ${slaBreachWarning ? 'badge-danger' : 'badge-success'}`}>{slaBreachWarning ? 'BREACH WARNING' : 'COMPLIANT'}</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Days Open',        value: claimDays,           color: claimDays >= 20 ? '#dc2626' : '#374151' },
                  { label: 'Ack. Window (US)', value: '15 days',           color: '#374151' },
                  { label: 'Breach Threshold', value: '20 days',           color: '#f59e0b' },
                  { label: 'Ack. Window (UK)', value: '5 business days',   color: '#374151' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
                  </div>
                ))}
              </div>

              {slaBreachWarning && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 13, marginBottom: 4 }}>⚠ Regulatory Breach Alert</div>
                  <div style={{ fontSize: 12, color: '#991b1b' }}>Claim has been open for {claimDays} days without resolution. Compliance supervisor webhook has been triggered. An explicit legal extension flag must be applied or the claim resolved immediately to avoid regulatory penalties.</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#065f46', flex: 1 }}>
                  ✓ Acknowledgement timestamp logged: <strong>{selectedClaim?.submitted || 'N/A'}</strong>
                </div>
                <button className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>Apply Legal Extension Flag</button>
              </div>
            </div>
          </div>

          {/* Authority Matrix */}
          <div className="card mb-16">
            <div className="card-header"><h2>Role-Based Financial Authority Matrix</h2></div>
            <div className="card-body">
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Current User Role</label>
                <select className="form-select" style={{ maxWidth: 280 }} value={userRole} onChange={e => setUserRole(e.target.value)}>
                  {AUTHORITY_MATRIX.map(r => <option key={r.role} value={r.role}>{r.role}</option>)}
                </select>
              </div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Role</th><th>Max Single Payout</th><th>Max Aggregate</th><th>Enforcement</th></tr>
                  </thead>
                  <tbody>
                    {AUTHORITY_MATRIX.map(r => (
                      <tr key={r.role} style={{ background: r.role === userRole ? '#f0f4ff' : '' }}>
                        <td style={{ fontWeight: r.role === userRole ? 700 : 400 }}>
                          {r.role} {r.role === userRole && <span style={{ fontSize: 10, color: '#7c3aed' }}>(you)</span>}
                        </td>
                        <td>{r.maxSingle != null ? `$${r.maxSingle.toLocaleString()}` : 'Unlimited'}</td>
                        <td>{r.maxAgg    != null ? `$${r.maxAgg.toLocaleString()}`    : 'Unlimited'}</td>
                        <td style={{ fontSize: 11, color: '#6b7280' }}>
                          {r.maxSingle ? 'Auto-escalate above limit' : r.role.includes('SIU') ? 'Crypto signature for >$50k' : 'Standard'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {adjData && exceedsAuthority && (
                <div style={{ marginTop: 12, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: 13, marginBottom: 4 }}>⚠ Authority Escalation Required</div>
                  <div style={{ fontSize: 12, color: '#b45309' }}>
                    Approved amount <strong>${approvedAmount.toFixed(2)}</strong> exceeds your single-payout authority of <strong>${authorityRole?.maxSingle?.toLocaleString()}</strong>. A Payment_Approval_Task has been automatically routed to the next tier. You cannot release payment directly.
                  </div>
                </div>
              )}
            </div>
          </div>

          <button className="btn btn-accent btn-lg" onClick={() => setActiveTab('resolve')}>Go to Resolution Center →</button>
        </div>
      )}

      {/* ── TAB: Resolution ── */}
      {activeTab === 'resolve' && (
        <div>
          <div className="ai-panel mb-20">
            <div className="ai-panel-header"><span className="ai-panel-icon">✅</span><span className="ai-panel-title">Resolution Center</span></div>
            <p style={{ fontSize: 13, color: '#374151' }}>Finalise the claim decision and trigger downstream ledger synchronization.</p>
          </div>

          {exceedsAuthority && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 13 }}>Authority Lock — Payment Release Blocked</div>
              <div style={{ fontSize: 12, color: '#991b1b', marginTop: 4 }}>Approved amount ${approvedAmount.toFixed(2)} exceeds your authority limit. Payment Approval Task has been routed to a higher tier.</div>
            </div>
          )}

          <div className="card mb-20">
            <div className="card-header"><h3>Adjudicator Decision</h3></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <button onClick={() => handleResolve('APPROVE')} disabled={exceedsAuthority} className={`btn btn-lg btn-full ${resolution === 'APPROVE' ? '' : 'btn-outline'}`} style={resolution === 'APPROVE' ? { background: '#059669', color: 'white', borderColor: '#059669' } : {}}>
                  ✅ Approve Claim
                </button>
                <button onClick={() => handleResolve('INFO')} className={`btn btn-lg btn-full ${resolution === 'INFO' ? '' : 'btn-outline'}`} style={resolution === 'INFO' ? { background: '#0369a1', color: 'white', borderColor: '#0369a1' } : {}}>
                  📋 Request More Info
                </button>
                <button onClick={() => handleResolve('DENY')} className={`btn btn-lg btn-full ${resolution === 'DENY' ? '' : 'btn-outline'}`} style={resolution === 'DENY' ? { background: '#dc2626', color: 'white', borderColor: '#dc2626' } : {}}>
                  ❌ Deny Claim
                </button>
              </div>
              {adjData && (
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px', fontSize: 13 }}>
                  <span style={{ color: '#6b7280' }}>AI Recommended: </span><strong>{adjData.decision}</strong>
                  <span style={{ color: '#6b7280' }}> · Approved: </span><strong>${adjData.total_approved?.toFixed(2)}</strong>
                  <span style={{ color: '#6b7280' }}> of </span><strong>${adjData.total_billed?.toFixed(2)}</strong>
                </div>
              )}
            </div>
          </div>

          {resolution && (
            <div className="card mb-20">
              <div className="card-header">
                <h3>Outbound Correspondence</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-info">📧 Email</span>
                  <span className="badge badge-muted">📱 Push</span>
                </div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">To</label>
                  <input className="form-input" defaultValue={policy?.holder?.email || 'policyholder@email.com'} readOnly style={{ background: '#f8fafc' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Adjuster Notes</label>
                  <textarea className="form-textarea" placeholder="Add internal notes..." value={notes} onChange={e => setNotes(e.target.value)} style={{ minHeight: 80 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Body</label>
                  <textarea className="form-textarea" value={emailText} onChange={e => setEmailText(e.target.value)} style={{ minHeight: 160, fontFamily: 'monospace', fontSize: 13 }} />
                </div>
                {emailSent ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>✅</span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#059669', fontSize: 14 }}>Email sent successfully</div>
                      <div style={{ fontSize: 12, color: '#374151' }}>Correspondence delivered to {policy?.holder?.email || 'policyholder@email.com'}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-accent btn-lg" onClick={() => setEmailSent(true)}>📤 Send Correspondence</button>
                    <button className="btn btn-outline">💾 Save Draft</button>
                    <button className="btn btn-outline" onClick={() => window.print()}>🖨️ Print Decision</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ledger Sync */}
          {resolution === 'APPROVE' && adjData && (
            <div className="card mb-20">
              <div className="card-header">
                <h3>Financial Ledger</h3>
                <span className="badge badge-success">✓ Synced</span>
              </div>
              <div className="card-body">
                <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 32 }}>✅</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#059669', marginBottom: 4 }}>Financial ledger sync complete</div>
                    <div style={{ fontSize: 13, color: '#374151' }}>Payment of <strong>${adjData.total_approved?.toFixed(2)}</strong> has been recorded in the enterprise general ledger and is queued for disbursement within 5 business days.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header"><h3>Audit Trail</h3></div>
            <div className="card-body">
              <div className="timeline">
                {[
                  { date: auditTs.claimSelected || '—', event: 'Claim selected for review', user: 'Adjudicator' },
                  extractResult && { date: auditTs.extracted || '—', event: `Invoice parsed by Gemini AI — $${invoice?.total_due?.toFixed(2)} total`, user: 'Gemini AI' },
                  cobChecked && { date: auditTs.cobChecked || '—', event: 'COB cross-match completed — no dual coverage', user: 'System' },
                  adjData && { date: auditTs.adjudicated || '—', event: `Adjudication completed — ${adjData.decision}`, user: 'Gemini AI' },
                  resolution && { date: auditTs.resolved || '—', event: `Adjudicator decision: ${resolution}`, user: 'Adjudicator' },
                  resolution === 'APPROVE' && ledgerObject && { date: auditTs.resolved || '—', event: 'Ledger broadcast event generated', user: 'System' },
                ].filter(Boolean).map((e, i) => (
                  <div key={i} className="timeline-item">
                    <div className={`timeline-dot ${e.user === 'Gemini AI' ? 'chronic' : 'normal'}`} />
                    <div className="timeline-date">{e.date} · {e.user}</div>
                    <div className="timeline-title">{e.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
