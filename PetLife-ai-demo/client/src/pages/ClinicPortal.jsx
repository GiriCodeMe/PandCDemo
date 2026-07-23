import { useState, useEffect } from 'react';
import { clinicEligibility, clinicPreauth, clinicSettlement } from '../api';

const CLINICS = [
  { clinicId: 'CLINIC-NVA-0881', label: 'Metropolitan Veterinary Hospital (Princeton, NJ)' },
  { clinicId: 'CLINIC-NVA-0412', label: 'Sunrise Animal Care Center (Los Angeles, CA)' },
  { clinicId: 'CLINIC-NVA-1204', label: 'Eastside Emergency Vet (New York, NY)' },
  { clinicId: 'CLINIC-PPG-0033', label: 'Pinnacle Pet Clinic London (UK) — No Bank Account' },
];

const TABS = [
  { id: 'eligibility', icon: '🔍', label: 'Eligibility' },
  { id: 'preauth',     icon: '📋', label: 'Pre-Authorization' },
  { id: 'settlement',  icon: '💳', label: 'Settlement' },
];

function emptyLineItem() {
  return { itemCode: '', description: '', unitCharge: '' };
}

export default function ClinicPortal() {
  const [activeTab, setActiveTab]   = useState('eligibility');
  const [clinicId, setClinicId]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  // --- Eligibility state ---
  const [searchQuery, setSearchQuery]         = useState('');
  const [eligibilityResult, setEligibilityResult] = useState(null);

  // --- Pre-Auth state ---
  const [preAuthPolicyNumber, setPreAuthPolicyNumber] = useState('');
  const [policyValidated, setPolicyValidated]         = useState(false);
  const [diagnosisCode, setDiagnosisCode]             = useState('');
  const [diagnosisDesc, setDiagnosisDesc]             = useState('');
  const [lineItems, setLineItems]                     = useState([emptyLineItem()]);
  const [emergencyOverride, setEmergencyOverride]     = useState(false);
  const [preAuthResult, setPreAuthResult]             = useState(null);

  // --- Settlement state ---
  const [settlePolicyNumber, setSettlePolicyNumber]   = useState('');
  const [preAuthToken, setPreAuthToken]               = useState('');
  const [microchipId, setMicrochipId]                 = useState('');
  const [diagCode, setDiagCode]                       = useState('');
  const [diagDesc, setDiagDesc]                       = useState('');
  const [settleLineItems, setSettleLineItems]         = useState([emptyLineItem()]);
  const [grossTotalOverride, setGrossTotalOverride]   = useState(false);
  const [currency, setCurrency]                       = useState('USD');
  const [settlementResult, setSettlementResult]       = useState(null);

  // Sync pre-auth policy number from eligibility result when tab switches
  useEffect(() => {
    if (eligibilityResult && activeTab === 'preauth') {
      setPreAuthPolicyNumber(eligibilityResult.policy?.policyNumber || '');
      setPolicyValidated(true);
    }
  }, [activeTab, eligibilityResult]);

  // Sync clinic ID into settlement settleClinicId tracker (just use clinicId directly)
  // Auto-validate policy when number typed
  useEffect(() => {
    if (preAuthPolicyNumber.length > 5 && eligibilityResult?.policy?.policyNumber === preAuthPolicyNumber) {
      setPolicyValidated(true);
    } else if (preAuthPolicyNumber.length > 0) {
      setPolicyValidated(false);
    }
  }, [preAuthPolicyNumber, eligibilityResult]);

  // --- Computed values ---
  const lineTotal = (items) =>
    items.reduce((sum, row) => sum + (parseFloat(row.unitCharge) || 0), 0);

  const preAuthTotal    = lineTotal(lineItems);
  const settleGrossTotal = lineTotal(settleLineItems);

  // ---- Handlers ----
  async function handleEligibilitySearch() {
    if (!clinicId || searchQuery.length < 6) return;
    setError(null);
    setLoading(true);
    try {
      const res = await clinicEligibility(searchQuery, clinicId);
      setEligibilityResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Eligibility lookup failed.');
    } finally {
      setLoading(false);
    }
  }

  function addLineItem(setter) {
    setter(prev => [...prev, emptyLineItem()]);
  }

  function removeLineItem(setter, idx) {
    setter(prev => prev.filter((_, i) => i !== idx));
  }

  function updateLineItem(setter, idx, field, value) {
    setter(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
  }

  async function handlePreAuth() {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        clinicId,
        policyNumber: preAuthPolicyNumber,
        diagnosisCode,
        diagnosisDescription: diagnosisDesc,
        procedureLineItems: lineItems.map(r => ({
          description: r.description || r.itemCode,
          unitCharge: parseFloat(r.unitCharge) || 0,
        })),
        emergencyOverride,
      };
      const res = await clinicPreauth(payload);
      setPreAuthResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Pre-authorization request failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSettlement() {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        header: { clinicId },
        patientContext: { policyNumber: settlePolicyNumber, microchipId: microchipId || undefined },
        treatmentData: {
          lineItems: settleLineItems.map(r => ({ description: r.description || r.itemCode, unitCharge: parseFloat(r.unitCharge) || 0 })),
          diagnosisCode: diagCode,
          diagnosisDescription: diagDesc,
        },
        financials: { grossInvoiceTotal: settleGrossTotal, currency },
        preAuthToken: preAuthToken || undefined,
      };
      const res = await clinicSettlement(payload);
      setSettlementResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Settlement submission failed.');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  // ---- Species icon ----
  function speciesIcon(species) {
    if (!species) return '🐾';
    return species.toLowerCase().includes('feline') ? '🐈' : '🐕';
  }

  // ---- Status badge classes ----
  function policyStatusBadge(status) {
    if (status === 'ACTIVE') return 'badge badge-success';
    if (status === 'IN_DUNNING') return 'badge badge-warning';
    return 'badge badge-danger';
  }

  function preAuthStatusBadge(status) {
    if (status === 'APPROVED') return 'badge badge-success';
    if (status === 'PARTIAL_APPROVAL') return 'badge badge-warning';
    if (status === 'REFERRED') return 'badge badge-warning';
    return 'badge badge-danger';
  }

  function settleBadge(status) {
    if (status === 'ADJUDICATED_SUCCESS') return 'badge badge-success';
    if (status === 'MANUAL_MEDICAL_REVIEW' || status === 'ESCROW_HOLD') return 'badge badge-warning';
    return 'badge badge-muted';
  }

  // ---- Pre-Auth submit guard ----
  const preAuthCanSubmit =
    clinicId &&
    preAuthPolicyNumber.length > 0 &&
    lineItems.length > 0 &&
    lineItems.some(r => r.itemCode) &&
    (preAuthTotal >= 500 || emergencyOverride);

  // ---- Settlement submit guard ----
  const settleCanSubmit =
    clinicId &&
    settlePolicyNumber.length > 0 &&
    settleLineItems.some(r => r.itemCode);

  // ---- Render helpers ----
  function LineItemsTable({ items, setter }) {
    return (
      <div>
        <table className="data-table" style={{ width: '100%', marginBottom: 8 }}>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Description</th>
              <th>Charge ($)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <input
                    className="form-input"
                    value={row.itemCode}
                    onChange={e => updateLineItem(setter, idx, 'itemCode', e.target.value)}
                    placeholder="e.g. PROC-001"
                    style={{ width: '100%' }}
                  />
                </td>
                <td>
                  <input
                    className="form-input"
                    value={row.description}
                    onChange={e => updateLineItem(setter, idx, 'description', e.target.value)}
                    placeholder="Procedure description"
                    style={{ width: '100%' }}
                  />
                </td>
                <td>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.unitCharge}
                    onChange={e => updateLineItem(setter, idx, 'unitCharge', e.target.value)}
                    placeholder="0.00"
                    style={{ width: 90 }}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '2px 8px', fontSize: 12 }}
                    onClick={() => removeLineItem(setter, idx)}
                    disabled={items.length === 1}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="btn btn-outline"
          style={{ fontSize: 13 }}
          onClick={() => addLineItem(setter)}
        >
          + Add Procedure Item
        </button>
      </div>
    );
  }

  // ============================================================
  // TAB RENDERS
  // ============================================================

  function renderEligibility() {
    const r = eligibilityResult;
    const policy = r?.policy;
    const pet    = r?.patient;
    const holder = r?.holder;
    const isBlocked = policy?.status === 'LAPSED' || policy?.status === 'IN_DUNNING';

    return (
      <div>
        {/* Search row */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span>Patient Eligibility Lookup</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                className="form-input"
                style={{ flex: 1, minWidth: 240 }}
                placeholder="Microchip ID, Policy Number, or Owner Phone"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEligibilitySearch()}
              />
              <button
                className="btn btn-primary"
                onClick={handleEligibilitySearch}
                disabled={loading || !clinicId || searchQuery.length < 6}
              >
                {loading ? 'Searching…' : 'Search'}
              </button>
            </div>
            {!clinicId && (
              <div className="text-muted text-sm" style={{ marginTop: 6 }}>
                Select a Clinic ID above before searching.
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        {r && (
          <div className="result-card">
            <div className="result-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>{speciesIcon(pet?.species)}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{pet?.petName}</div>
                <div className="text-muted text-sm">{pet?.species} · {pet?.breed}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <span className={policyStatusBadge(policy?.status)}>{policy?.status}</span>
              </div>
            </div>

            <div className="result-body">
              {isBlocked && (
                <div className="alert alert-danger" style={{ marginBottom: 12 }}>
                  Coverage not active — patient must pay in full.
                </div>
              )}
              {policy?.inWaitingPeriod && (
                <div className="alert alert-warning" style={{ marginBottom: 12 }}>
                  Waiting period active — illness claims are restricted. Accident claims may still apply.
                </div>
              )}

              <div className="section-label">Coverage Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
                {[
                  { label: 'Deductible Remaining',   value: `$${policy?.deductibleRemaining ?? '—'}` },
                  { label: 'Insurer Pays',            value: `${policy?.insurerReimbursementPct ?? '—'}%` },
                  { label: 'Annual Limit Remaining',  value: `$${policy?.annualLimitRemaining != null ? policy.annualLimitRemaining.toLocaleString() : '—'}` },
                  { label: 'Plan Type',               value: policy?.coverageType ?? '—' },
                  { label: 'Waiting Period',          value: policy?.inWaitingPeriod ? 'Active — illness claims restricted' : 'Cleared' },
                  { label: 'Exclusions',              value: policy?.exclusionRiders?.length ? policy.exclusionRiders.join(', ') : 'None' },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '10px 12px' }}>
                    <div className="text-muted text-sm">{item.label}</div>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="section-label">Policy Holder</div>
              <div className="text-sm" style={{ marginBottom: 16 }}>
                {holder?.holderName} &nbsp;·&nbsp; <span className="font-mono">{holder?.holderEmailMasked}</span>
              </div>

              {!isBlocked && (
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab('preauth')}
                  style={{ marginTop: 4 }}
                >
                  Use in Pre-Auth →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderPreAuth() {
    const r = preAuthResult;

    return (
      <div>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">Request Pre-Authorization</div>
          <div className="card-body">

            {/* Policy number */}
            <div style={{ marginBottom: 14 }}>
              <label className="section-label">Policy Number</label>
              <input
                className="form-input"
                style={{ width: '100%' }}
                value={preAuthPolicyNumber}
                onChange={e => { setPreAuthPolicyNumber(e.target.value); setPolicyValidated(false); }}
                placeholder="e.g. POL-2024-000123"
              />
              {preAuthPolicyNumber.length > 0 && (
                <div className="text-sm" style={{ marginTop: 4, color: policyValidated ? '#10b981' : '#ef4444' }}>
                  {policyValidated ? '✓ Policy validated' : '✗ Not found in current session — run Eligibility first'}
                </div>
              )}
            </div>

            {/* Diagnosis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label className="section-label">Diagnosis Code</label>
                <input
                  className="form-input"
                  style={{ width: '100%' }}
                  value={diagnosisCode}
                  onChange={e => setDiagnosisCode(e.target.value)}
                  placeholder="e.g. ICD-VET-K92.2"
                />
              </div>
              <div>
                <label className="section-label">Diagnosis Description</label>
                <textarea
                  className="form-input"
                  style={{ width: '100%', minHeight: 60, resize: 'vertical' }}
                  value={diagnosisDesc}
                  onChange={e => setDiagnosisDesc(e.target.value)}
                  placeholder="Brief clinical description…"
                />
              </div>
            </div>

            {/* Emergency override */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={emergencyOverride}
                  onChange={e => setEmergencyOverride(e.target.checked)}
                />
                <span className="text-sm">Emergency Override (bypass $500 minimum threshold)</span>
              </label>
            </div>

            {/* Line items */}
            <div style={{ marginBottom: 14 }}>
              <div className="section-label">Procedure Line Items</div>
              <LineItemsTable items={lineItems} setter={setLineItems} />
              <div style={{ marginTop: 8, textAlign: 'right', fontWeight: 600 }}>
                Procedure Total: ${preAuthTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {preAuthTotal < 500 && !emergencyOverride && lineItems.some(r => r.itemCode) && (
                <div className="alert alert-warning" style={{ marginTop: 8 }}>
                  Procedure total below $500 threshold. Check "Emergency Override" to proceed.
                </div>
              )}
            </div>

            <button
              className="btn btn-primary"
              onClick={handlePreAuth}
              disabled={loading || !preAuthCanSubmit}
            >
              {loading ? 'Submitting…' : 'Request Pre-Authorization'}
            </button>
          </div>
        </div>

        {/* Result */}
        {r && (
          <div className="result-card">
            <div className="result-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={preAuthStatusBadge(r.outcome)} style={{ fontSize: 14 }}>{r.outcome?.replace(/_/g, ' ')}</span>
              {r.preAuthToken && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                  <span className="font-mono" style={{ background: 'rgba(16,185,129,0.12)', padding: '3px 10px', borderRadius: 5, fontSize: 13 }}>
                    {r.preAuthToken}
                  </span>
                  <button className="btn btn-outline" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => copyToClipboard(r.preAuthToken)}>Copy</button>
                </div>
              )}
            </div>

            <div className="result-body">
              {r.tokenExpiry && (
                <div className="text-sm text-muted" style={{ marginBottom: 10 }}>
                  Expires: <strong>{r.tokenExpiry}</strong>
                </div>
              )}

              {(r.outcome === 'REFERRED' || r.outcome === 'DECLINED') && (r.referralReason || r.declineReason) && (
                <div className={r.outcome === 'DECLINED' ? 'alert alert-danger' : 'alert alert-warning'} style={{ marginBottom: 10 }}>
                  <strong>{r.outcome === 'DECLINED' ? 'Declined:' : 'Referred:'}</strong> {r.referralReason || r.declineReason}
                  {(r.referralMessage || r.declineMessage) && <div style={{ marginTop: 4 }}>{r.referralMessage || r.declineMessage}</div>}
                </div>
              )}

              {r.outcome === 'PARTIAL_APPROVAL' && r.guaranteedPayoutCeiling && (
                <div className="alert alert-warning" style={{ marginBottom: 10 }}>
                  Approval capped at ${r.guaranteedPayoutCeiling?.netCarrierPayoutToClinic?.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Costs above this cap are patient responsibility.
                </div>
              )}

              {r.lineDecisions && r.lineDecisions.length > 0 && (
                <>
                  <div className="section-label">Line Decisions</div>
                  <table className="data-table" style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Item Code</th>
                        <th>Decision</th>
                        <th>Amount</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.lineDecisions.map((ld, i) => (
                        <tr key={i}>
                          <td className="font-mono">{ld.description}</td>
                          <td>
                            <span className={`badge ${ld.status === 'APPROVED' ? 'badge-success' : ld.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'}`}>
                              {ld.status}
                            </span>
                          </td>
                          <td>${(ld.approvedAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="text-sm text-muted">—</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderSettlement() {
    const r = settlementResult;
    const split = r?.breakdown;

    return (
      <div style={{ display: 'grid', gridTemplateColumns: r ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* Left — form */}
        <div className="card">
          <div className="card-header">Submit Settlement Invoice</div>
          <div className="card-body">

            <div style={{ marginBottom: 12 }}>
              <label className="section-label">Policy Number</label>
              <input className="form-input" style={{ width: '100%' }} value={settlePolicyNumber} onChange={e => setSettlePolicyNumber(e.target.value)} placeholder="POL-2024-000123" />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="section-label">Pre-Auth Token (if issued)</label>
              <input className="form-input" style={{ width: '100%' }} value={preAuthToken} onChange={e => setPreAuthToken(e.target.value)} placeholder="PA-XXXX-XXXX (optional)" />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="section-label">Microchip ID (optional)</label>
              <input className="form-input" style={{ width: '100%' }} value={microchipId} onChange={e => setMicrochipId(e.target.value)} placeholder="e.g. 956000012345678" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label className="section-label">Diagnosis Code</label>
                <input className="form-input" style={{ width: '100%' }} value={diagCode} onChange={e => setDiagCode(e.target.value)} placeholder="ICD-VET-K92.2" />
              </div>
              <div>
                <label className="section-label">Diagnosis Description</label>
                <textarea className="form-input" style={{ width: '100%', minHeight: 56, resize: 'vertical' }} value={diagDesc} onChange={e => setDiagDesc(e.target.value)} placeholder="Clinical description…" />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div className="section-label">Invoice Line Items</div>
              <LineItemsTable items={settleLineItems} setter={setSettleLineItems} />
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <span className="text-muted text-sm">Gross Total: </span>
                <strong>${settleGrossTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={grossTotalOverride} onChange={e => setGrossTotalOverride(e.target.checked)} />
                <span className="text-sm">Override gross total (manual review)</span>
              </label>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="section-label">Currency</label>
              <select className="form-input" value={currency} onChange={e => setCurrency(e.target.value)} style={{ width: 120 }}>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <button className="btn btn-primary" onClick={handleSettlement} disabled={loading || !settleCanSubmit}>
              {loading ? 'Submitting…' : 'Submit Settlement'}
            </button>
          </div>
        </div>

        {/* Right — result */}
        {r && (
          <div>
            <div className="result-card">
              <div className="result-header" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className={settleBadge(r.settlementStatus)} style={{ fontSize: 14 }}>{r.settlementStatus?.replace(/_/g, ' ')}</span>
                {r.claimReferenceNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                    <span className="font-mono" style={{ fontSize: 12 }}>{r.claimReferenceNumber}</span>
                    <button className="btn btn-outline" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => copyToClipboard(r.claimReferenceNumber)}>Copy</button>
                  </div>
                )}
              </div>

              <div className="result-body">
                {(r.settlementStatus === 'MANUAL_MEDICAL_REVIEW' || r.settlementStatus === 'ESCROW_HOLD') && (r.message || r.fallbackInstruction) && (
                  <div className={r.settlementStatus === 'ESCROW_HOLD' ? 'alert alert-danger' : 'alert alert-warning'} style={{ marginBottom: 12 }}>
                    {r.message || r.fallbackInstruction}
                  </div>
                )}

                {split && (
                  <>
                    <div className="section-label">Bill Split</div>
                    <table className="data-table" style={{ width: '100%', marginBottom: 16 }}>
                      <tbody>
                        <tr><td className="text-muted text-sm">Gross Invoice Total</td><td style={{ textAlign: 'right' }}>${(split.grossInvoiceTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
                        <tr><td className="text-muted text-sm">Non-Covered Items</td><td style={{ textAlign: 'right' }}>${(split.nonCoveredItemsAmount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
                        <tr><td className="text-muted text-sm">Applied Deductible</td><td style={{ textAlign: 'right' }}>${(split.appliedDeductible ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
                        <tr><td className="text-muted text-sm">Co-Insurance Customer Share</td><td style={{ textAlign: 'right' }}>${(split.appliedCoInsuranceCustomerShare ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
                        <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)' }}>
                          <td style={{ fontWeight: 700, paddingTop: 8 }}>Customer Pays at Desk</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16, paddingTop: 8 }}>${(split.customerPayAtDesk ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, color: '#10b981' }}>Insurer Direct Payout to Clinic</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16, color: '#10b981' }}>${(split.netCarrierPayoutToClinic ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                {r.paymentInstruction && (
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
                    <div className="section-label">Payment Instruction</div>
                    <div className="text-sm">
                      <div><span className="text-muted">Method:</span> {r.paymentInstruction.clearingMethod}</div>
                      <div><span className="text-muted">Payout Target:</span> {r.paymentInstruction.payoutTimestampTarget}</div>
                      {r.paymentInstruction.recipientBankAccountId && (
                        <div><span className="text-muted">Bank Ref:</span> <span className="font-mono">{r.paymentInstruction.recipientBankAccountId}</span></div>
                      )}
                    </div>
                  </div>
                )}

                <button className="btn btn-outline" onClick={() => window.print()} style={{ marginTop: 4 }}>
                  Print
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Clinic Portal</h1>
          <div className="text-muted text-sm" style={{ marginTop: 4 }}>Veterinary Network Integration — Eligibility, Pre-Authorization &amp; Settlement</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label className="section-label" style={{ marginBottom: 0 }}>Clinic:</label>
          <select
            className="form-input"
            value={clinicId}
            onChange={e => setClinicId(e.target.value)}
            style={{ minWidth: 320 }}
          >
            <option value="">— Select Clinic —</option>
            {CLINICS.map(c => (
              <option key={c.clinicId} value={c.clinicId}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Global error */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          {error}
          <button
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
              color: activeTab === tab.id ? '#6366f1' : 'rgba(255,255,255,0.5)',
              fontWeight: activeTab === tab.id ? 700 : 400,
              cursor: 'pointer',
              padding: '8px 16px',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 0.15s',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'eligibility' && renderEligibility()}
      {activeTab === 'preauth'     && renderPreAuth()}
      {activeTab === 'settlement'  && renderSettlement()}
    </div>
  );
}
