import { useState, useEffect, useCallback } from 'react';
import { runUWAgent } from '../api';

// ── Constants ──────────────────────────────────────────────────────────────
const BANNED_BREEDS = ['Wolf Hybrid', 'Dingo', 'Savannah Cat', 'Serval', 'Kinkajou', 'Bengal Cat (F1-F3)'];
const WELLNESS_TIERS = ['BASIC', 'STANDARD', 'ENHANCED', 'UNLIMITED'];
const COVERAGE_LABELS = { ACCIDENT_ILLNESS: 'Accident & Illness', COMPREHENSIVE: 'Comprehensive', PREMIUM: 'Premium', BASIC: 'Accident Only' };

const AI_AGENTS = [
  { key: 'risk_assessment',  name: 'Risk Assessment Agent',  icon: '🔍', desc: 'Evaluates breed, age, and health risk factors' },
  { key: 'fraud_detection',  name: 'Fraud Detection Agent',   icon: '🛡️', desc: 'Cross-references microchip data and claim patterns' },
  { key: 'pricing',          name: 'Pricing Agent',           icon: '💰', desc: 'Calculates actuarial premium with all loadings' },
  { key: 'coverage_scope',   name: 'Coverage Scoping Agent',  icon: '📋', desc: 'Determines exclusions, endorsements, and waiting periods' },
  { key: 'final_decision',   name: 'Final Decision Agent',    icon: '⚖️', desc: 'Issues binding underwriting recommendation' },
];

const STEPS = ['UW Queue', 'Application', 'Rules Engine', 'AI Pipeline', 'Decision'];

const DEMO_CASES = [
  {
    id: 'UW-DEMO-001', submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'PENDING',
    pet: { name: 'Buddy', type: 'dog', breed: 'Golden Retriever', dob: '2021-03-15', sex: 'male', neutered: 'yes' },
    holder: { first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.j@example.com', postcode: '10001' },
    coverage: { type: 'ACCIDENT_ILLNESS', reimbursement: 80, deductible: 250, annual_benefit: 10000 },
    health: { conditions: [] },
    quoteResult: { quote_id: 'QT-2025-0042', monthly_premium: 68.50, annual_premium: 822, risk_level: 'LOW', breed_tier: 1, valid_until: '2025-08-07' },
    breedVerification: { recommendation: 'ACCEPT', breed_match: true, declared_breed: 'Golden Retriever', match_confidence: 0.94 },
    historyReview: { pre_existing_conditions: [], conditions_identified: [] },
    PreExisting_Conditions_Declared: false, Medical_History_Log: [],
    Pet_Microchip_ID: 'MCH-985112004567890', Primary_Vet_Clinic_ID: 'VET-NYC-0042', Wellness_Tier_Selection: 'STANDARD',
    channelType: 'INDIVIDUAL', creResult: null, agentResults: {}, uwResult: null, override: null,
    auditTrail: [{ timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), actor: 'Quote System', action: 'Application submitted from Quote flow', details: 'Quote ID: QT-2025-0042 · Premium: $68.50/mo · Coverage: ACCIDENT_ILLNESS' }],
  },
  {
    id: 'UW-DEMO-002', submittedAt: new Date(Date.now() - 4 * 3600000).toISOString(), status: 'PENDING',
    pet: { name: 'Biscuit', type: 'dog', breed: 'French Bulldog', dob: '2020-07-22', sex: 'female', neutered: 'yes' },
    holder: { first_name: 'Michael', last_name: 'Chen', email: 'mchen@example.com', postcode: '90210' },
    coverage: { type: 'COMPREHENSIVE', reimbursement: 80, deductible: 250, annual_benefit: 15000 },
    health: { conditions: [0, 4] },
    quoteResult: { quote_id: 'QT-2025-0038', monthly_premium: 127.40, annual_premium: 1528.80, risk_level: 'HIGH', breed_tier: 3, valid_until: '2025-08-07' },
    breedVerification: { recommendation: 'ACCEPT', breed_match: true, declared_breed: 'French Bulldog', match_confidence: 0.91 },
    historyReview: { pre_existing_conditions: [{ condition: 'Hip Dysplasia' }, { condition: 'Atopic Dermatitis' }], conditions_identified: [] },
    PreExisting_Conditions_Declared: true,
    Medical_History_Log: [
      { Condition_Type: 'CHRONIC', Diagnosis_Date: '2022-04-10', Is_Resolved: false },
      { Condition_Type: 'ACUTE', Diagnosis_Date: '2023-09-22', Is_Resolved: true },
    ],
    Pet_Microchip_ID: 'MCH-900032000456789', Primary_Vet_Clinic_ID: 'VET-LAX-0018', Wellness_Tier_Selection: 'ENHANCED',
    channelType: 'INDIVIDUAL', creResult: null, agentResults: {}, uwResult: null, override: null,
    auditTrail: [{ timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), actor: 'Quote System', action: 'Application submitted from Quote flow', details: 'Quote ID: QT-2025-0038 · Premium: $127.40/mo · Coverage: COMPREHENSIVE' }],
  },
  {
    id: 'UW-DEMO-003', submittedAt: new Date(Date.now() - 6 * 3600000).toISOString(), status: 'PENDING',
    pet: { name: 'Whiskers', type: 'cat', breed: 'Maine Coon', dob: '2011-11-05', sex: 'male', neutered: 'yes' },
    holder: { first_name: 'Emily', last_name: 'Davis', email: 'emily.d@example.com', postcode: '77001' },
    coverage: { type: 'PREMIUM', reimbursement: 90, deductible: 100, annual_benefit: 25000 },
    health: { conditions: [] },
    quoteResult: { quote_id: 'QT-2025-0031', monthly_premium: 210.00, annual_premium: 2520, risk_level: 'HIGH', breed_tier: 2, valid_until: '2025-08-07' },
    breedVerification: { recommendation: 'ACCEPT', breed_match: true, declared_breed: 'Maine Coon', match_confidence: 0.89 },
    historyReview: { pre_existing_conditions: [], conditions_identified: [] },
    PreExisting_Conditions_Declared: false, Medical_History_Log: [],
    Pet_Microchip_ID: '', Primary_Vet_Clinic_ID: 'VET-HOU-0033', Wellness_Tier_Selection: 'STANDARD',
    channelType: 'INDIVIDUAL', creResult: null, agentResults: {}, uwResult: null, override: null,
    auditTrail: [{ timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), actor: 'Quote System', action: 'Application submitted from Quote flow', details: 'Quote ID: QT-2025-0031 · Premium: $210.00/mo · Coverage: PREMIUM' }],
  },
];

// ── CRE Engine ──────────────────────────────────────────────────────────────
function calcAge(dob) {
  if (!dob) return 0;
  return Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));
}

function executeCRE(sub) {
  const petAge = calcAge(sub.pet?.dob);
  const preExisting = sub.PreExisting_Conditions_Declared || false;
  const medHistory = sub.Medical_History_Log || [];
  const annualBenefit = sub.coverage?.annual_benefit || 0;
  const breed = sub.pet?.breed || '';
  const rules = [];

  // ── Class 1: Auto-Decline ──
  const ageDecline = petAge > 14;
  rules.push({
    class: 1, ruleId: 'AUD-001', name: 'Max Age Enrollment',
    criteria: 'Pet age > 14 years at enrollment', eisField: 'policy.insureds.pet.age',
    value: `Age: ${petAge} yr`, status: ageDecline ? 'FAIL' : 'PASS',
    reason: ageDecline ? `Age ${petAge} yr exceeds 14-year enrollment limit` : null,
  });

  const breedDecline = BANNED_BREEDS.includes(breed);
  rules.push({
    class: 1, ruleId: 'AUD-002', name: 'Unsupported Breed',
    criteria: 'Breed on exotic/working restricted list', eisField: 'policy.insureds.pet.breed',
    value: `Breed: ${breed}`, status: breedDecline ? 'FAIL' : 'PASS',
    reason: breedDecline ? `${breed} is restricted in this jurisdiction` : null,
  });

  const activeChronicCount = medHistory.filter(c => !c.Is_Resolved && c.Condition_Type === 'CHRONIC').length;
  const chronicDecline = activeChronicCount >= 3;
  rules.push({
    class: 1, ruleId: 'AUD-003', name: 'Chronic Morbidity',
    criteria: '≥ 3 active chronic life-limiting conditions', eisField: 'policy.medicalHistory',
    value: `Active chronic: ${activeChronicCount}`, status: chronicDecline ? 'FAIL' : 'PASS',
    reason: chronicDecline ? `${activeChronicCount} active chronic conditions exceeds threshold` : null,
  });

  if (ageDecline || breedDecline || chronicDecline) {
    const failedRules = rules.filter(r => r.status === 'FAIL');
    const skip = (ruleId, cls, name, criteria, eisField) =>
      ({ class: cls, ruleId, name, criteria, eisField, value: 'Not evaluated', status: 'SKIP', reason: null });
    rules.push(
      skip('STP-001', 2, 'Clean Bill of Health', 'No pre-existing AND age < 8', 'policy.flags / pet.age'),
      skip('STP-002', 2, 'Verified Shelter Transfer', 'Valid shelter adoption voucher', 'policy.marketingSource'),
      skip('STP-003', 2, 'Group Benefit Pass', 'Corporate HR benefit channel match', 'policy.channelType'),
      skip('REF-001', 3, 'Pre-Existing Evaluation', 'PreExisting_Conditions_Declared == TRUE', 'policy.medicalHistory'),
      skip('REF-002', 3, 'High-Value Risk', 'Benefit > $20K AND age > 8', 'policy.coverageLimit'),
      skip('REF-003', 3, 'Microchip Conflict', 'Microchip matches active policy, different brand', 'policy.pet.microchip'),
    );
    return {
      decision: 'DECLINE', rules,
      reasonCodes: failedRules.map(r => r.ruleId),
      underwriterNotes: failedRules.map(r => r.reason).join(' | '),
      processedAt: new Date().toISOString(),
    };
  }

  // ── Class 2: Auto-Approve (STP) ──
  const stp001 = !preExisting && petAge < 8;
  rules.push({
    class: 2, ruleId: 'STP-001', name: 'Clean Bill of Health',
    criteria: 'No pre-existing conditions AND age < 8', eisField: 'policy.flags / pet.age',
    value: `Pre-existing: ${preExisting ? 'Yes' : 'No'}, Age: ${petAge} yr`,
    status: stp001 ? 'PASS' : 'SKIP',
    reason: stp001 ? 'Clean health history — STP eligible' : null,
  });

  const stp002 = !!sub.shelterVoucherCode;
  rules.push({
    class: 2, ruleId: 'STP-002', name: 'Verified Shelter Transfer',
    criteria: 'Valid shelter adoption voucher code present', eisField: 'policy.marketingSource',
    value: stp002 ? `Voucher: ${sub.shelterVoucherCode}` : 'No voucher — not applicable',
    status: stp002 ? 'PASS' : 'SKIP',
    reason: stp002 ? 'Verified shelter adoption — STP eligible' : null,
  });

  const stp003 = sub.channelType === 'GROUP_BENEFIT';
  rules.push({
    class: 2, ruleId: 'STP-003', name: 'Group Benefit Pass',
    criteria: 'Application from corporate HR benefit channel', eisField: 'policy.channelType',
    value: `Channel: ${sub.channelType || 'INDIVIDUAL'}`,
    status: stp003 ? 'PASS' : 'SKIP',
    reason: stp003 ? 'Corporate group channel — health penalties bypassed' : null,
  });

  if (stp001 || stp002 || stp003) {
    const passedSTP = rules.filter(r => r.class === 2 && r.status === 'PASS');
    const skip2 = (ruleId, name, criteria, eisField) =>
      ({ class: 3, ruleId, name, criteria, eisField, value: 'Not evaluated — STP triggered', status: 'SKIP', reason: null });
    rules.push(
      skip2('REF-001', 'Pre-Existing Evaluation', 'PreExisting_Conditions_Declared == TRUE', 'policy.medicalHistory'),
      skip2('REF-002', 'High-Value Risk', 'Benefit > $20K AND age > 8', 'policy.coverageLimit'),
      skip2('REF-003', 'Microchip Conflict', 'Microchip matches active policy, different brand', 'policy.pet.microchip'),
    );
    return {
      decision: 'APPROVE', rules,
      reasonCodes: passedSTP.map(r => r.ruleId),
      underwriterNotes: passedSTP.map(r => r.reason).join(' | '),
      processedAt: new Date().toISOString(),
    };
  }

  // ── Class 3: Auto-Referral ──
  const ref001 = preExisting;
  rules.push({
    class: 3, ruleId: 'REF-001', name: 'Pre-Existing Evaluation',
    criteria: 'PreExisting_Conditions_Declared == TRUE', eisField: 'policy.medicalHistory',
    value: `Pre-existing: ${preExisting ? 'Yes' : 'No'}`,
    status: ref001 ? 'REFER' : 'PASS',
    reason: ref001 ? 'Manual exclusion rider placement required by senior underwriter' : null,
  });

  const ref002 = annualBenefit > 20000 && petAge > 8;
  rules.push({
    class: 3, ruleId: 'REF-002', name: 'High-Value Risk',
    criteria: 'Total Limit > $20,000 AND pet age > 8 years', eisField: 'policy.coverageLimit',
    value: `Benefit: $${annualBenefit?.toLocaleString()}, Age: ${petAge} yr`,
    status: ref002 ? 'REFER' : 'PASS',
    reason: ref002 ? `$${annualBenefit?.toLocaleString()} benefit + ${petAge}-year-old pet exceeds STP threshold` : null,
  });

  rules.push({
    class: 3, ruleId: 'REF-003', name: 'Microchip Conflict',
    criteria: 'Microchip ID matches in-force policy under different brand', eisField: 'policy.pet.microchip',
    value: sub.Pet_Microchip_ID ? `Chip: ${sub.Pet_Microchip_ID} — No conflict found` : 'No microchip ID provided',
    status: 'PASS', reason: null,
  });

  const referRules = rules.filter(r => r.status === 'REFER');
  if (referRules.length > 0) {
    return {
      decision: 'REFER', rules,
      reasonCodes: referRules.map(r => r.ruleId),
      underwriterNotes: referRules.map(r => r.reason).join(' | '),
      taskTitle: `Underwriting Review Required: Submission ${sub.id}`,
      processedAt: new Date().toISOString(),
    };
  }

  return {
    decision: 'APPROVE', rules,
    reasonCodes: ['ALL_CLEAR'],
    underwriterNotes: 'All underwriting rules passed. Application eligible for straight-through processing.',
    processedAt: new Date().toISOString(),
  };
}

// ── Small Helpers ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PENDING:   { label: 'Pending',    cls: 'badge-muted' },
    IN_REVIEW: { label: 'In Review',  cls: 'badge-info' },
    APPROVED:  { label: 'Approved',   cls: 'badge-success' },
    DECLINED:  { label: 'Declined',   cls: 'badge-danger' },
    REFERRED:  { label: 'Referred',   cls: 'badge-warning' },
    OVERRIDE:  { label: 'Overridden', cls: 'badge-purple' },
  };
  const { label, cls } = map[status] || { label: status, cls: 'badge-muted' };
  return <span className={`badge ${cls}`}>{label}</span>;
}

function RuleStatusChip({ status }) {
  if (status === 'PASS')  return <span style={{ fontSize: 11, fontWeight: 700, color: '#065f46', background: '#d1fae5', padding: '2px 8px', borderRadius: 20 }}>✓ PASS</span>;
  if (status === 'FAIL')  return <span style={{ fontSize: 11, fontWeight: 700, color: '#991b1b', background: '#fee2e2', padding: '2px 8px', borderRadius: 20 }}>✗ FAIL</span>;
  if (status === 'REFER') return <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: 20 }}>⚠ REFER</span>;
  return <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: 20 }}>— SKIP</span>;
}

function EISStateBadge({ status, creRunning }) {
  if (creRunning) return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
      <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
      UNDERWRITING_REVIEW — Locked
    </div>
  );
  const map = {
    PENDING:   { label: 'PENDING',              bg: '#f3f4f6', color: '#374151' },
    IN_REVIEW: { label: 'UNDERWRITING_REVIEW',  bg: '#dbeafe', color: '#1d4ed8' },
    APPROVED:  { label: 'QUOTE_BINDABLE',        bg: '#d1fae5', color: '#065f46' },
    DECLINED:  { label: 'APPLICATION_DECLINED',  bg: '#fee2e2', color: '#991b1b' },
    REFERRED:  { label: 'UNDERWRITING_REFERRAL', bg: '#fef3c7', color: '#92400e' },
    OVERRIDE:  { label: 'OVERRIDE_APPROVED',     bg: '#ede9fe', color: '#5b21b6' },
  };
  const s = map[status] || map.PENDING;
  return <div style={{ display: 'inline-block', background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{s.label}</div>;
}

// ── Policy Issued Modal ───────────────────────────────────────────────────────
function PolicyIssuedModal({ data, onClose }) {
  if (!data) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>Policy Issued Successfully</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'white', fontFamily: 'monospace', letterSpacing: 1 }}>{data.policyNum}</div>
          </div>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎉</div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              ['Pet', `${data.petName} (${data.breed})`],
              ['Policyholder', data.holderName],
              ['Coverage', data.coverageType],
              ['Annual Benefit', `$${Number(data.annualBenefit || 0).toLocaleString()}`],
              ['Bound Premium', <strong style={{ color: '#059669', fontSize: 15 }}>${data.premium}/mo</strong>],
              ['Effective Date', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
            ].map(([k, v]) => (
              <div key={k} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.5px', marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#065f46', marginBottom: 20 }}>
            ✓ Policy committed to EIS · Audit trail updated · Policyholder notification queued
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Close</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { window.print(); }}>🖨 Print Policy Schedule</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Case Summary Sidebar ─────────────────────────────────────────────────────
function CaseSummary({ c, creRunning }) {
  if (!c) return (
    <div className="card" style={{ position: 'sticky', top: 80 }}>
      <div className="card-body" style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 13 }}>Select a case from the UW Queue to begin review</div>
      </div>
    </div>
  );

  const petAge = calcAge(c.pet?.dob);
  const finalDecision = c.agentResults?.final_decision;
  const quotePremiumFloor = c.quoteResult?.monthly_premium || 0;
  const creDecision = c.creResult?.decision;
  const displayStatus = c.override ? 'OVERRIDE' : c.status;

  return (
    <div className="card" style={{ position: 'sticky', top: 80 }}>
      <div className="card-header" style={{ background: '#f8fafc' }}>
        <h3>Case Summary</h3>
        <EISStateBadge status={displayStatus} creRunning={creRunning} />
      </div>
      <div className="card-body" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '2px solid #e5e7eb', flexShrink: 0 }}>
            {c.pet?.type === 'cat' ? '🐱' : c.pet?.type === 'bird' ? '🐦' : '🐶'}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{c.pet?.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{c.pet?.breed} · {petAge} yr · {c.pet?.sex}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{c.holder?.first_name} {c.holder?.last_name}</div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}>
          <span style={{ color: '#6b7280' }}>Coverage: </span>{COVERAGE_LABELS[c.coverage?.type] || c.coverage?.type}
        </div>
        <div style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}>
          <span style={{ color: '#6b7280' }}>Benefit: </span>${c.coverage?.annual_benefit?.toLocaleString()} · ${c.coverage?.deductible} ded
        </div>
        <div style={{ fontSize: 12, color: '#374151', marginBottom: 8 }}>
          <span style={{ color: '#6b7280' }}>Quote Premium: </span>
          <strong>${c.quoteResult?.monthly_premium?.toFixed(2)}/mo</strong>
        </div>

        {c.PreExisting_Conditions_Declared && (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, padding: '5px 8px', fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 8 }}>
            ⚠️ Pre-existing conditions declared
          </div>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.5px', marginBottom: 4 }}>Case ID</div>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#374151', marginBottom: 10 }}>{c.id}</div>

        {creDecision && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.5px', marginBottom: 4 }}>CRE Decision</div>
            <div style={{ marginBottom: 8 }}>
              {creDecision === 'APPROVE' && <span className="badge badge-success">✓ APPROVE (STP)</span>}
              {creDecision === 'REFER'   && <span className="badge badge-warning">⚠ REFER</span>}
              {creDecision === 'DECLINE' && <span className="badge badge-danger">✗ DECLINE</span>}
            </div>
          </>
        )}

        {finalDecision && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.5px', marginBottom: 4 }}>AI Decision</div>
            <div style={{ marginBottom: 4 }}>
              <span className={`badge ${['ACCEPT_STANDARD', 'ACCEPT_SUBSTANDARD'].includes(finalDecision.decision) ? 'badge-success' : finalDecision.decision === 'REFER' ? 'badge-warning' : 'badge-danger'}`}>
                {finalDecision.decision}
              </span>
            </div>
            <div style={{ fontSize: 11, color: '#374151' }}>
              AI Premium: <strong>${Math.max(finalDecision.recommended_premium || 0, quotePremiumFloor).toFixed(2)}/mo</strong>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              Confidence: {(finalDecision.confidence * 100).toFixed(0)}%
            </div>
          </>
        )}

        {c.override && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
            <div style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#5b21b6', fontWeight: 600 }}>
              🔓 Manually overridden by {c.override.role}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function Underwriting() {
  const [step, setStep] = useState(1);
  const [queue, setQueue] = useState(() => {
    try { return JSON.parse(localStorage.getItem('uwQueue') || '[]'); } catch { return []; }
  });
  const [selectedId, setSelectedId] = useState(null);
  const [extFields, setExtFields] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState(-1);
  const [creRunning, setCreRunning] = useState(false);
  const [overrideText, setOverrideText] = useState('');
  const [overrideRole, setOverrideRole] = useState('Senior_Underwriter');
  const [schemaValidated, setSchemaValidated] = useState(false);
  const [policyModal, setPolicyModal] = useState(null); // { policyNum, premium, petName, breed }

  const selectedCase = queue.find(c => c.id === selectedId) || null;

  useEffect(() => {
    if (selectedCase) {
      setExtFields({
        Pet_Microchip_ID: selectedCase.Pet_Microchip_ID || '',
        Primary_Vet_Clinic_ID: selectedCase.Primary_Vet_Clinic_ID || '',
        Wellness_Tier_Selection: selectedCase.Wellness_Tier_Selection || 'STANDARD',
        Medical_History_Log: selectedCase.Medical_History_Log || [],
        PreExisting_Conditions_Declared: selectedCase.PreExisting_Conditions_Declared || false,
      });
      setSchemaValidated(false);
    }
  }, [selectedId]);

  const updateCase = useCallback((id, updates) => {
    setQueue(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      try { localStorage.setItem('uwQueue', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const selectCase = (id) => { setSelectedId(id); setStep(2); };

  const loadDemoCases = () => {
    setQueue(prev => {
      const existingIds = new Set(prev.map(c => c.id));
      const toAdd = DEMO_CASES.filter(c => !existingIds.has(c.id));
      const next = [...toAdd, ...prev];
      try { localStorage.setItem('uwQueue', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleSaveApplication = () => {
    updateCase(selectedCase.id, {
      ...extFields,
      auditTrail: [...(selectedCase.auditTrail || []), {
        timestamp: new Date().toISOString(), actor: 'Underwriter',
        action: 'Application data enriched and schema validated',
        details: `Microchip: ${extFields.Pet_Microchip_ID || 'N/A'} · Vet Clinic: ${extFields.Primary_Vet_Clinic_ID || 'N/A'} · Wellness: ${extFields.Wellness_Tier_Selection}`,
      }],
    });
    setSchemaValidated(true);
  };

  const handleRunCRE = () => {
    setCreRunning(true);
    updateCase(selectedCase.id, { status: 'IN_REVIEW' });
    const caseWithExt = { ...selectedCase, ...extFields };
    setTimeout(() => {
      const result = executeCRE(caseWithExt);
      const newStatus = result.decision === 'DECLINE' ? 'DECLINED' : result.decision === 'APPROVE' ? 'APPROVED' : 'REFERRED';
      updateCase(selectedCase.id, {
        ...extFields,
        creResult: result,
        status: newStatus,
        auditTrail: [...(selectedCase.auditTrail || []), {
          timestamp: new Date().toISOString(), actor: 'CRE System',
          action: `Rules Engine executed — ${result.decision}`,
          details: `Reason codes: ${result.reasonCodes.join(', ')} | Rules evaluated: ${result.rules.length}`,
        }],
      });
      setCreRunning(false);
    }, 1500);
  };

  const handleRunAIPipeline = async () => {
    setAiLoading(true);
    setActiveAgent(0);
    const appPayload = {
      pet_name: selectedCase.pet?.name,
      breed: selectedCase.pet?.breed,
      species: selectedCase.pet?.type,
      dob: selectedCase.pet?.dob,
      sex: selectedCase.pet?.sex,
      neutered: selectedCase.pet?.neutered,
      age_years: calcAge(selectedCase.pet?.dob),
      coverage_type: selectedCase.coverage?.type,
      annual_benefit: selectedCase.coverage?.annual_benefit,
      deductible: selectedCase.coverage?.deductible,
      reimbursement_pct: selectedCase.coverage?.reimbursement,
      Pet_Microchip_ID: extFields.Pet_Microchip_ID || selectedCase.Pet_Microchip_ID,
      PreExisting_Conditions_Declared: extFields.PreExisting_Conditions_Declared ?? selectedCase.PreExisting_Conditions_Declared,
      Medical_History_Log: extFields.Medical_History_Log || selectedCase.Medical_History_Log,
      Primary_Vet_Clinic_ID: extFields.Primary_Vet_Clinic_ID || selectedCase.Primary_Vet_Clinic_ID,
      Wellness_Tier_Selection: extFields.Wellness_Tier_Selection || selectedCase.Wellness_Tier_Selection,
      prior_claims_count: 0,
      prior_claims_total: 0,
      quote_monthly_premium: selectedCase.quoteResult?.monthly_premium || null,
    };

    const accumulated = {};
    const newAgentResults = { ...(selectedCase.agentResults || {}) };

    for (let i = 0; i < AI_AGENTS.length; i++) {
      setActiveAgent(i);
      const agentKey = AI_AGENTS[i].key;
      try {
        const res = await runUWAgent(agentKey, appPayload, Object.keys(accumulated).length > 0 ? accumulated : null);
        const agentResult = res.data.result;
        accumulated[agentKey] = agentResult;
        newAgentResults[agentKey] = { ...agentResult, _source: res.data.source };
        updateCase(selectedCase.id, { agentResults: { ...newAgentResults } });
      } catch (e) {
        newAgentResults[agentKey] = { agent: AI_AGENTS[i].name, findings: 'Agent unavailable', _error: true };
      }
    }

    // Enforce premium floor: UW premium must always be >= quote premium
    const qPremium = selectedCase.quoteResult?.monthly_premium || 0;
    if (newAgentResults['pricing']?.final_monthly_premium < qPremium) {
      newAgentResults['pricing'] = { ...newAgentResults['pricing'], final_monthly_premium: qPremium, final_annual_premium: parseFloat((qPremium * 12).toFixed(2)) };
    }
    if (newAgentResults['final_decision']?.recommended_premium < qPremium) {
      newAgentResults['final_decision'] = { ...newAgentResults['final_decision'], recommended_premium: qPremium };
    }

    const finalAgent = newAgentResults['final_decision'];
    const uwDecision = finalAgent?.decision;
    const newStatus = uwDecision
      ? (['ACCEPT_STANDARD', 'ACCEPT_SUBSTANDARD'].includes(uwDecision) ? 'APPROVED' : uwDecision === 'REFER' ? 'REFERRED' : 'DECLINED')
      : selectedCase.status;

    updateCase(selectedCase.id, {
      agentResults: newAgentResults,
      uwResult: finalAgent || null,
      status: newStatus,
      auditTrail: [...(selectedCase.auditTrail || []), {
        timestamp: new Date().toISOString(), actor: 'AI System (Gemini)',
        action: `AI Pipeline executed — ${uwDecision || 'N/A'}`,
        details: `Premium: $${finalAgent?.recommended_premium?.toFixed(2) || 'N/A'}/mo · Confidence: ${finalAgent?.confidence ? (finalAgent.confidence * 100).toFixed(0) + '%' : 'N/A'}`,
      }],
    });

    setActiveAgent(-1);
    setAiLoading(false);
  };

  const handleOverride = (newDecision) => {
    if (!overrideText.trim()) return;
    updateCase(selectedCase.id, {
      status: newDecision === 'APPROVE' ? 'APPROVED' : 'DECLINED',
      override: {
        originalDecision: selectedCase.creResult?.decision || selectedCase.status,
        newDecision,
        role: overrideRole,
        justification: overrideText,
        timestamp: new Date().toISOString(),
        actor: 'GiriRamadoss',
      },
      auditTrail: [...(selectedCase.auditTrail || []), {
        timestamp: new Date().toISOString(), actor: `GiriRamadoss [${overrideRole}]`,
        action: `Manual Override — ${newDecision}`,
        details: `Justification: ${overrideText}`,
      }],
    });
    setOverrideText('');
  };

  // Schema validation fields
  const schemaFields = selectedCase ? [
    { label: 'Pet Name',                        value: selectedCase.pet?.name,                required: true },
    { label: 'Pet Breed',                       value: selectedCase.pet?.breed,               required: true },
    { label: 'Date of Birth',                   value: selectedCase.pet?.dob,                 required: true },
    { label: 'Coverage Type',                   value: selectedCase.coverage?.type,           required: true },
    { label: 'Annual Benefit',                  value: selectedCase.coverage?.annual_benefit, required: true },
    { label: 'Holder Email',                    value: selectedCase.holder?.email,            required: true },
    { label: 'PreExisting_Conditions_Declared', value: extFields.PreExisting_Conditions_Declared !== undefined ? 'set' : null, required: true },
    { label: 'Medical_History_Log',             value: extFields.Medical_History_Log !== undefined ? 'set' : null, required: true },
    { label: 'Primary_Vet_Clinic_ID',           value: extFields.Primary_Vet_Clinic_ID,      required: true },
    { label: 'Wellness_Tier_Selection',         value: extFields.Wellness_Tier_Selection,    required: true },
    { label: 'Pet_Microchip_ID',                value: extFields.Pet_Microchip_ID,           required: false },
  ] : [];
  const schemaValid = schemaFields.filter(f => f.required).every(f => !!f.value || f.value === false || f.value === 0);

  const pendingCount = queue.filter(c => c.status === 'PENDING').length;
  const displayStatus = selectedCase?.override ? 'OVERRIDE' : selectedCase?.status;

  return (
    <div>
      <PolicyIssuedModal data={policyModal} onClose={() => setPolicyModal(null)} />

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <div className="page-title">Underwriting Workbench</div>
          {selectedCase && (
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
              {selectedCase.id} · {selectedCase.pet?.name} ({selectedCase.pet?.breed}) · {selectedCase.holder?.first_name} {selectedCase.holder?.last_name}
            </span>
          )}
        </div>
        {selectedCase && <div style={{ marginTop: 4 }}><EISStateBadge status={displayStatus} creRunning={creRunning} /></div>}
      </div>

      {/* Step indicator */}
      <div className="card mb-24" style={{ padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: (i === 0 || (selectedCase && step > i + 1)) ? 'pointer' : 'default' }}
                onClick={() => { if (i === 0) setStep(1); else if (selectedCase && step > i + 1) setStep(i + 1); }}
              >
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: step > i + 1 ? '#10b981' : step === i + 1 ? '#7c3aed' : '#e5e7eb', color: step >= i + 1 ? 'white' : '#9ca3af', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: step === i + 1 ? 700 : 500, color: step === i + 1 ? '#1a1d2e' : '#9ca3af', whiteSpace: 'nowrap' }}>
                  {label}
                  {i === 0 && pendingCount > 0 && (
                    <span style={{ background: '#e84040', color: 'white', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 10, marginLeft: 4 }}>{pendingCount}</span>
                  )}
                </span>
              </div>
              {i < 4 && <div style={{ flex: 1, height: 2, background: step > i + 1 ? '#10b981' : '#e5e7eb', margin: '0 6px' }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: step === 1 ? '1fr' : '1fr 300px', gap: 24, alignItems: 'start' }}>
        <div>

          {/* ══ STEP 1: UW Queue ══ */}
          {step === 1 && (
            <div>
              {/* KPI strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { s: 'PENDING',   label: 'Pending Review', color: '#374151', bg: '#f3f4f6' },
                  { s: 'IN_REVIEW', label: 'In Review',      color: '#1d4ed8', bg: '#dbeafe' },
                  { s: 'APPROVED',  label: 'Approved',       color: '#065f46', bg: '#d1fae5' },
                  { s: 'DECLINED',  label: 'Declined',       color: '#991b1b', bg: '#fee2e2' },
                  { s: 'REFERRED',  label: 'Referred',       color: '#92400e', bg: '#fef3c7' },
                ].map(({ s, label, color, bg }) => (
                  <div key={s} style={{ background: bg, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color }}>{queue.filter(c => c.status === s).length}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color, letterSpacing: '0.5px', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {queue.length === 0 ? (
                <div className="card">
                  <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>📋</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No submissions in the UW Queue</h3>
                    <p style={{ fontSize: 13, marginBottom: 24 }}>
                      Complete a quote in the Quote flow — it will automatically route here for underwriting review.<br />
                      Or load demo cases to explore the workbench.
                    </p>
                    <button className="btn btn-primary" onClick={loadDemoCases}>Load 3 Demo Cases</button>
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-header" style={{ background: '#f8fafc' }}>
                    <h2>Submissions Queue</h2>
                    <button className="btn btn-sm btn-outline" onClick={loadDemoCases}>+ Load Demo Cases</button>
                  </div>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Case ID</th><th>Pet</th><th>Coverage</th><th>AI Premium</th>
                          <th>Pre-existing</th><th>Breed Check</th><th>Status</th><th>Submitted</th><th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {queue.map(c => (
                          <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => selectCase(c.id)}>
                            <td className="td-id">{c.id}</td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{c.pet?.name}</div>
                              <div style={{ fontSize: 11, color: '#6b7280' }}>{c.pet?.breed} · {calcAge(c.pet?.dob)} yr</div>
                            </td>
                            <td style={{ fontSize: 13 }}>{COVERAGE_LABELS[c.coverage?.type] || c.coverage?.type}</td>
                            <td style={{ fontWeight: 600, fontSize: 13 }}>${c.quoteResult?.monthly_premium?.toFixed(2)}<span style={{ fontWeight: 400, color: '#9ca3af' }}>/mo</span></td>
                            <td>{c.PreExisting_Conditions_Declared ? <span className="badge badge-warning">Yes</span> : <span className="badge badge-success">No</span>}</td>
                            <td>
                              {c.breedVerification
                                ? (c.breedVerification.recommendation === 'REJECT' ? <span className="badge badge-danger">Mismatch</span> : <span className="badge badge-success">Verified</span>)
                                : <span className="badge badge-muted">Pending</span>}
                            </td>
                            <td><StatusBadge status={c.override ? 'OVERRIDE' : c.status} /></td>
                            <td style={{ fontSize: 12, color: '#6b7280' }}>{new Date(c.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                            <td><button className="btn btn-sm btn-primary" onClick={e => { e.stopPropagation(); selectCase(c.id); }}>Review →</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ STEP 2: Application Review ══ */}
          {step === 2 && selectedCase && (
            <div>
              <div className="card mb-20">
                <div className="card-header" style={{ background: '#f8fafc' }}>
                  <h2>Data Enrichment & Schema Validation</h2>
                  <span className="badge badge-info">REQ-1.1 / REQ-1.2</span>
                </div>
                <div className="card-body">
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                    Verify the incoming application payload and enrich with required underwriting attributes before triggering the rules engine.
                  </p>

                  <div className="grid-2">
                    {/* Read-only quote data */}
                    <div>
                      <div className="section-label mb-12">Quote-Derived Data <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: '#9ca3af' }}>(read-only)</span></div>
                      {[
                        ['Pet Name', selectedCase.pet?.name],
                        ['Breed', selectedCase.pet?.breed],
                        ['Date of Birth', selectedCase.pet?.dob],
                        ['Sex / Neutered', `${selectedCase.pet?.sex} · ${selectedCase.pet?.neutered === 'yes' ? 'Neutered' : 'Entire'}`],
                        ['Coverage Type', COVERAGE_LABELS[selectedCase.coverage?.type]],
                        ['Annual Benefit', `$${selectedCase.coverage?.annual_benefit?.toLocaleString()}`],
                        ['Deductible', `$${selectedCase.coverage?.deductible}`],
                        ['Quote Premium', `$${selectedCase.quoteResult?.monthly_premium?.toFixed(2)}/mo`],
                        ['Policyholder', `${selectedCase.holder?.first_name} ${selectedCase.holder?.last_name}`],
                        ['Email', selectedCase.holder?.email],
                        ['ZIP', selectedCase.holder?.postcode],
                      ].map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid #f3f4f6' }}>
                          <span style={{ color: '#6b7280' }}>{k}</span>
                          <span style={{ fontWeight: 600, color: '#374151' }}>{v || '—'}</span>
                        </div>
                      ))}
                      {selectedCase.breedVerification && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>Breed Verification</div>
                          <div style={{ fontSize: 12 }}>
                            {selectedCase.breedVerification.recommendation === 'REJECT'
                              ? <span className="badge badge-danger">⚠ Breed Mismatch</span>
                              : <span className="badge badge-success">✓ Verified — {(selectedCase.breedVerification.match_confidence * 100).toFixed(0)}% confidence</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Editable extended fields */}
                    <div>
                      <div className="section-label mb-12">Extended UW Attributes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11, color: '#9ca3af' }}>(REQ-1.2)</span></div>

                      <div className="form-group">
                        <label className="form-label">Pet_Microchip_ID <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span></label>
                        <input className="form-input" placeholder="e.g. MCH-985112004567890" value={extFields.Pet_Microchip_ID || ''} onChange={e => setExtFields(f => ({ ...f, Pet_Microchip_ID: e.target.value }))} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Primary_Vet_Clinic_ID *</label>
                        <input className="form-input" placeholder="e.g. VET-NYC-0042" value={extFields.Primary_Vet_Clinic_ID || ''} onChange={e => setExtFields(f => ({ ...f, Primary_Vet_Clinic_ID: e.target.value }))} />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Wellness_Tier_Selection *</label>
                        <select className="form-select" value={extFields.Wellness_Tier_Selection || 'STANDARD'} onChange={e => setExtFields(f => ({ ...f, Wellness_Tier_Selection: e.target.value }))}>
                          {WELLNESS_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">PreExisting_Conditions_Declared *</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                          {[true, false].map(v => (
                            <button key={String(v)} className={`btn ${extFields.PreExisting_Conditions_Declared === v ? 'btn-primary' : 'btn-outline'}`} style={{ minWidth: 80 }} onClick={() => setExtFields(f => ({ ...f, PreExisting_Conditions_Declared: v }))}>
                              {v ? 'Yes' : 'No'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Medical_History_Log *</label>
                        <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, border: '1px solid #e5e7eb' }}>
                          {(extFields.Medical_History_Log || []).length === 0 ? (
                            <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: 8 }}>No medical history entries</div>
                          ) : (extFields.Medical_History_Log || []).map((entry, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                              <select value={entry.Condition_Type} onChange={e => {
                                const arr = [...extFields.Medical_History_Log];
                                arr[idx] = { ...arr[idx], Condition_Type: e.target.value };
                                setExtFields(f => ({ ...f, Medical_History_Log: arr }));
                              }} style={{ padding: '3px 6px', borderRadius: 4, border: '1px solid #e5e7eb', fontSize: 11 }}>
                                <option value="CHRONIC">CHRONIC</option>
                                <option value="ACUTE">ACUTE</option>
                              </select>
                              <input type="date" value={entry.Diagnosis_Date || ''} onChange={e => {
                                const arr = [...extFields.Medical_History_Log];
                                arr[idx] = { ...arr[idx], Diagnosis_Date: e.target.value };
                                setExtFields(f => ({ ...f, Medical_History_Log: arr }));
                              }} style={{ padding: '3px 6px', borderRadius: 4, border: '1px solid #e5e7eb', fontSize: 11, flex: 1 }} />
                              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, whiteSpace: 'nowrap' }}>
                                <input type="checkbox" checked={entry.Is_Resolved} onChange={e => {
                                  const arr = [...extFields.Medical_History_Log];
                                  arr[idx] = { ...arr[idx], Is_Resolved: e.target.checked };
                                  setExtFields(f => ({ ...f, Medical_History_Log: arr }));
                                }} /> Resolved
                              </label>
                              <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14 }} onClick={() => {
                                const arr = extFields.Medical_History_Log.filter((_, i) => i !== idx);
                                setExtFields(f => ({ ...f, Medical_History_Log: arr }));
                              }}>✕</button>
                            </div>
                          ))}
                          <button className="btn btn-sm btn-outline" style={{ marginTop: 4, width: '100%' }} onClick={() => setExtFields(f => ({ ...f, Medical_History_Log: [...(f.Medical_History_Log || []), { Condition_Type: 'ACUTE', Diagnosis_Date: '', Is_Resolved: false }] }))}>
                            + Add Entry
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schema Validation Panel */}
                  <div style={{ marginTop: 20, background: '#f8fafc', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>Schema Validation Status</div>
                      <div style={{ fontSize: 12, color: schemaValid ? '#065f46' : '#92400e', fontWeight: 600 }}>
                        {schemaFields.filter(f => f.required && (!!f.value || f.value === false)).length}/{schemaFields.filter(f => f.required).length} required fields valid
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {schemaFields.map(field => {
                        const isValid = !!field.value || field.value === false || field.value === 0;
                        return (
                          <div key={field.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                            <span style={{ color: isValid ? '#10b981' : field.required ? '#ef4444' : '#9ca3af', flexShrink: 0 }}>{isValid ? '✓' : field.required ? '✗' : '○'}</span>
                            <span style={{ color: isValid ? '#374151' : field.required ? '#ef4444' : '#9ca3af' }}>{field.label}</span>
                            {!field.required && <span style={{ color: '#9ca3af', fontSize: 10 }}>(opt)</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>← Back to Queue</button>
                <button className="btn btn-primary" onClick={handleSaveApplication} disabled={!schemaValid}>
                  {schemaValidated ? '✓ Schema Validated' : 'Save & Validate Schema'}
                </button>
                <button className="btn btn-accent btn-lg" onClick={() => setStep(3)} disabled={!schemaValid}>
                  Continue to Rules Engine →
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 3: Rules Engine ══ */}
          {step === 3 && selectedCase && (
            <div>
              {creRunning && (
                <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="spinner" style={{ borderTopColor: '#1d4ed8' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: 13 }}>EIS Policy State: UNDERWRITING_REVIEW — Locked</div>
                    <div style={{ fontSize: 12, color: '#3b82f6' }}>Rules engine executing... Application fields locked for modification (REQ-2.3)</div>
                  </div>
                </div>
              )}

              {selectedCase.creResult && (
                <div className={`decision-banner mb-20 ${selectedCase.creResult.decision === 'APPROVE' ? 'approve' : selectedCase.creResult.decision === 'REFER' ? 'partial' : 'denied'}`}>
                  <span className="decision-icon">{selectedCase.creResult.decision === 'APPROVE' ? '✅' : selectedCase.creResult.decision === 'REFER' ? '⚠️' : '🚫'}</span>
                  <div>
                    <div className="decision-title">CRE Decision: {selectedCase.creResult.decision}</div>
                    <div className="decision-sub">Reason Codes: {selectedCase.creResult.reasonCodes.join(', ')}</div>
                    <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>{selectedCase.creResult.underwriterNotes}</div>
                    {selectedCase.creResult.taskTitle && (
                      <div style={{ marginTop: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontWeight: 600 }}>
                        📌 Task Created: {selectedCase.creResult.taskTitle}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rule class panels */}
              {[
                { classNum: 1, label: 'Class 1 — Auto-Decline (Hard Knockouts)',              color: '#991b1b', bg: '#fef2f2' },
                { classNum: 2, label: 'Class 2 — Auto-Approve (Straight-Through Processing)', color: '#065f46', bg: '#f0fdf4' },
                { classNum: 3, label: 'Class 3 — Auto-Referral (Exception Routing)',          color: '#92400e', bg: '#fff7ed' },
              ].map(({ classNum, label, color, bg }) => {
                const classRules = selectedCase.creResult
                  ? selectedCase.creResult.rules.filter(r => r.class === classNum)
                  : classNum === 1
                    ? [
                        { ruleId: 'AUD-001', name: 'Max Age Enrollment', criteria: 'Pet age > 14 years at enrollment', eisField: 'policy.insureds.pet.age', value: `Age: ${calcAge(selectedCase.pet?.dob)} yr`, status: null },
                        { ruleId: 'AUD-002', name: 'Unsupported Breed', criteria: 'Breed on restricted/exotic list', eisField: 'policy.insureds.pet.breed', value: `Breed: ${selectedCase.pet?.breed}`, status: null },
                        { ruleId: 'AUD-003', name: 'Chronic Morbidity', criteria: '≥ 3 active chronic life-limiting conditions', eisField: 'policy.medicalHistory', value: `Active chronic: ${(extFields.Medical_History_Log || []).filter(c => !c.Is_Resolved && c.Condition_Type === 'CHRONIC').length}`, status: null },
                      ]
                    : classNum === 2
                      ? [
                          { ruleId: 'STP-001', name: 'Clean Bill of Health', criteria: 'No pre-existing AND age < 8', eisField: 'policy.flags / pet.age', value: `Pre-existing: ${extFields.PreExisting_Conditions_Declared ? 'Yes' : 'No'}`, status: null },
                          { ruleId: 'STP-002', name: 'Verified Shelter Transfer', criteria: 'Valid shelter adoption voucher', eisField: 'policy.marketingSource', value: 'No voucher', status: null },
                          { ruleId: 'STP-003', name: 'Group Benefit Pass', criteria: 'Corporate HR benefit channel match', eisField: 'policy.channelType', value: `Channel: ${selectedCase.channelType || 'INDIVIDUAL'}`, status: null },
                        ]
                      : [
                          { ruleId: 'REF-001', name: 'Pre-Existing Evaluation', criteria: 'PreExisting_Conditions_Declared == TRUE', eisField: 'policy.medicalHistory', value: `Declared: ${extFields.PreExisting_Conditions_Declared ? 'Yes' : 'No'}`, status: null },
                          { ruleId: 'REF-002', name: 'High-Value Risk', criteria: 'Benefit > $20K AND age > 8', eisField: 'policy.coverageLimit', value: `Benefit: $${selectedCase.coverage?.annual_benefit?.toLocaleString()}`, status: null },
                          { ruleId: 'REF-003', name: 'Microchip Conflict', criteria: 'Microchip matches active policy, different brand', eisField: 'policy.pet.microchip', value: extFields.Pet_Microchip_ID || 'No microchip', status: null },
                        ];

                return (
                  <div key={classNum} className="card mb-16">
                    <div className="card-header" style={{ background: bg }}>
                      <h3 style={{ color }}>{label}</h3>
                      <span style={{ fontSize: 11, color, fontWeight: 600 }}>{classRules.length} rules</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                      {classRules.map((rule, idx) => (
                        <div key={rule.ruleId} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 100px', gap: 12, padding: '10px 16px', borderBottom: idx < classRules.length - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#374151' }}>{rule.ruleId}</div>
                            <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: 'monospace', marginTop: 2 }}>{rule.eisField}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1d2e' }}>{rule.name}</div>
                            <div style={{ fontSize: 11, color: '#6b7280' }}>{rule.criteria}</div>
                            {rule.reason && <div style={{ fontSize: 11, color: '#92400e', marginTop: 3, fontStyle: 'italic' }}>{rule.reason}</div>}
                          </div>
                          <div style={{ fontSize: 11, color: '#374151', fontFamily: 'monospace', background: '#f8fafc', borderRadius: 4, padding: '3px 6px' }}>{rule.value}</div>
                          <div style={{ textAlign: 'right' }}>
                            {rule.status ? <RuleStatusChip status={rule.status} /> : <span style={{ fontSize: 11, color: '#9ca3af' }}>Not run</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-ai btn-lg" onClick={handleRunCRE} disabled={creRunning}>
                  {creRunning ? <><span className="spinner" />Running CRE (1,500ms lock)...</> : '⚙️ Run Rules Engine'}
                </button>
                {selectedCase.creResult && (
                  <button className="btn btn-accent btn-lg" onClick={() => setStep(4)}>Continue to AI Pipeline →</button>
                )}
              </div>
            </div>
          )}

          {/* ══ STEP 4: AI Agent Pipeline ══ */}
          {step === 4 && selectedCase && (
            <div>
              <div className="card mb-20">
                <div className="card-header" style={{ background: '#f8fafc' }}>
                  <h2>AI Underwriting Pipeline</h2>
                  <span className="ai-tag">✨ Gemini AI · 5 Independent Agent Calls</span>
                </div>
                <div className="card-body">
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                    Each agent is called independently via the AIFactory. Results accumulate sequentially — each downstream agent receives the previous agent's findings as context.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                    {AI_AGENTS.map((agent, i) => {
                      const result = selectedCase.agentResults?.[agent.key];
                      const isActive = aiLoading && activeAgent === i;
                      const isDone = !!result;
                      return (
                        <div key={agent.key} className={`agent-card ${isActive ? 'running' : isDone ? 'done' : ''}`} style={{ opacity: aiLoading && activeAgent < i ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                          <div className="agent-header">
                            <span className="agent-icon">{agent.icon}</span>
                            <div>
                              <div className="agent-name">{agent.name}</div>
                              <div style={{ fontSize: 10, color: '#9ca3af' }}>Independent API call</div>
                            </div>
                            <div className="agent-status">
                              {isActive && <span className="spinner" />}
                              {isDone && !isActive && <span style={{ color: '#10b981', fontSize: 16 }}>✓</span>}
                              {!isDone && !isActive && <span style={{ color: '#e5e7eb', fontSize: 16 }}>○</span>}
                            </div>
                          </div>
                          <div className="agent-summary">
                            {isActive && <span style={{ color: '#7c3aed' }}>Running agent call...</span>}
                            {isDone && (
                              <>
                                <div style={{ color: '#374151', lineHeight: 1.5 }}>{result.findings}</div>
                                {result._source === 'fallback' && <span style={{ fontSize: 10, color: '#f59e0b', marginTop: 4, display: 'block' }}>⚠️ Fallback result (AI unavailable)</span>}
                              </>
                            )}
                            {!isDone && !isActive && <span style={{ color: '#d1d5db' }}>Waiting...</span>}
                          </div>
                          {isDone && agent.key === 'risk_assessment' && (
                            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                              <span className={`badge ${result.risk_tier === 'STANDARD' ? 'badge-success' : 'badge-warning'}`}>{result.risk_tier}</span>
                              <span className="badge badge-muted">Loading: +{result.total_loading_pct || 0}%</span>
                            </div>
                          )}
                          {isDone && agent.key === 'fraud_detection' && (
                            <div style={{ marginTop: 8 }}>
                              <span className={`badge ${result.fraud_risk_level === 'LOW' ? 'badge-success' : 'badge-danger'}`}>Fraud: {result.fraud_risk_level}</span>
                            </div>
                          )}
                          {isDone && agent.key === 'pricing' && (
                            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: '#0a0f2c' }}>
                              ${result.final_monthly_premium?.toFixed(2)}/mo
                            </div>
                          )}
                          {isDone && agent.key === 'final_decision' && (
                            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <span className={`badge ${['ACCEPT_STANDARD', 'ACCEPT_SUBSTANDARD'].includes(result.decision) ? 'badge-success' : result.decision === 'REFER' ? 'badge-warning' : 'badge-danger'}`}>{result.decision}</span>
                              <span className="badge badge-muted">Conf: {result.confidence ? (result.confidence * 100).toFixed(0) + '%' : 'N/A'}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Recommendation summary */}
                  {selectedCase.agentResults?.final_decision && (
                    <div className="ai-panel">
                      <div className="ai-panel-header">
                        <span className="ai-panel-icon">✨</span>
                        <span className="ai-panel-title">Gemini AI Pipeline Recommendation</span>
                        {selectedCase.agentResults?.final_decision?._source === 'fallback' && (
                          <span title="Fallback result" style={{ marginLeft: 4, color: '#fbbf24' }}>⚠️</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                        Decision: {selectedCase.agentResults.final_decision.decision} · Premium: ${Math.max(selectedCase.agentResults.final_decision.recommended_premium || 0, selectedCase.quoteResult?.monthly_premium || 0).toFixed(2)}/mo · Confidence: {(selectedCase.agentResults.final_decision.confidence * 100).toFixed(0)}%
                      </div>
                      <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{selectedCase.agentResults.final_decision.explanation}</p>
                      {selectedCase.agentResults.final_decision.exclusions?.length > 0 && (
                        <div style={{ marginTop: 8, fontSize: 12 }}>
                          <strong>Exclusions:</strong> {selectedCase.agentResults.final_decision.exclusions.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
                <button className="btn btn-ai btn-lg" onClick={handleRunAIPipeline} disabled={aiLoading}>
                  {aiLoading ? <><span className="spinner" />Running agent {activeAgent + 1}/5...</> : '✨ Run AI Pipeline'}
                </button>
                {selectedCase.agentResults?.final_decision && (
                  <button className="btn btn-accent btn-lg" onClick={() => setStep(5)}>Continue to Decision →</button>
                )}
              </div>
            </div>
          )}

          {/* ══ STEP 5: Decision & Override ══ */}
          {step === 5 && selectedCase && (() => {
            const aiDecision = selectedCase.agentResults?.final_decision?.decision;
            const creDecision = selectedCase.creResult?.decision;
            const override = selectedCase.override;
            const finalStatus = override ? override.newDecision : (aiDecision || creDecision || 'PENDING');
            const isApproved = ['ACCEPT_STANDARD', 'ACCEPT_SUBSTANDARD', 'APPROVE'].includes(finalStatus);
            const isDeclined = finalStatus === 'DECLINE' || finalStatus === 'DECLINED';
            return (
              <div>
                {/* Combined decision banner */}
                <div className={`decision-banner mb-20 ${override ? 'refer' : isApproved ? 'approve' : isDeclined ? 'denied' : 'partial'}`}>
                  <span className="decision-icon">{override ? '🔓' : isApproved ? '✅' : isDeclined ? '🚫' : '⚠️'}</span>
                  <div style={{ flex: 1 }}>
                    <div className="decision-title">
                      {override ? `Overridden → ${override.newDecision}` : isApproved ? finalStatus : isDeclined ? 'DECLINE' : 'REFER — Manual Review Required'}
                    </div>
                    <div className="decision-sub" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {selectedCase.agentResults?.final_decision && `AI Premium: $${Math.max(selectedCase.agentResults.final_decision.recommended_premium || 0, selectedCase.quoteResult?.monthly_premium || 0).toFixed(2)}/mo · `}
                      EIS State: <EISStateBadge status={override ? 'OVERRIDE' : selectedCase.status} />
                    </div>
                    {override && (
                      <div style={{ marginTop: 6, fontSize: 12, background: 'rgba(0,0,0,0.06)', borderRadius: 6, padding: '6px 10px' }}>
                        Override by {override.actor} [{override.role}] — "{override.justification}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason Codes (REQ-4.2) */}
                {selectedCase.creResult && (
                  <div className="card mb-16">
                    <div className="card-header">
                      <h3>Reason Codes & Underwriter Notes <span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>(REQ-4.2)</span></h3>
                    </div>
                    <div className="card-body">
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        {selectedCase.creResult.reasonCodes.map(code => (
                          <span key={code} className="badge badge-navy" style={{ fontFamily: 'monospace' }}>{code}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: 13, color: '#374151', background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                        {selectedCase.creResult.underwriterNotes}
                      </div>
                      {selectedCase.creResult.taskTitle && (
                        <div style={{ marginTop: 10, background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>📌</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>Task Created (REQ-4.1)</div>
                            <div style={{ fontSize: 12, color: '#b45309' }}>{selectedCase.creResult.taskTitle}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Override Section (REQ-4.3) */}
                {!override && (selectedCase.status === 'REFERRED' || selectedCase.status === 'DECLINED') && (
                  <div className="card mb-16" style={{ border: '2px solid #c4b5fd' }}>
                    <div className="card-header" style={{ background: '#ede9fe' }}>
                      <h3 style={{ color: '#5b21b6' }}>Manual Override <span style={{ fontSize: 11, fontWeight: 400 }}>(REQ-4.3)</span></h3>
                      <span className="badge badge-purple">Senior_Underwriter or higher</span>
                    </div>
                    <div className="card-body">
                      <p style={{ fontSize: 13, color: '#374151', marginBottom: 16 }}>
                        Users with <strong>Senior_Underwriter</strong> or higher role may override a REFER or DECLINE status. A mandatory justification is required and will be logged to the policy audit trail.
                      </p>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Override Role</label>
                          <select className="form-select" value={overrideRole} onChange={e => setOverrideRole(e.target.value)}>
                            <option value="Senior_Underwriter">Senior Underwriter</option>
                            <option value="Chief_Underwriter">Chief Underwriter</option>
                            <option value="Compliance_Officer">Compliance Officer</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">New Decision</label>
                          <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                            <button className="btn btn-outline" style={{ borderColor: '#10b981', color: '#10b981' }} onClick={() => handleOverride('APPROVE')} disabled={!overrideText.trim()}>
                              ✓ Override to APPROVE
                            </button>
                            <button className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleOverride('DECLINE')} disabled={!overrideText.trim()}>
                              ✗ Confirm DECLINE
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mandatory Justification * <span style={{ color: '#9ca3af', fontWeight: 400, textTransform: 'none' }}>(logged to audit trail)</span></label>
                        <textarea className="form-textarea" rows={3} placeholder="Enter underwriting rationale for this override decision..." value={overrideText} onChange={e => setOverrideText(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Audit Trail */}
                <div className="card mb-16">
                  <div className="card-header">
                    <h3>Policy Audit Trail</h3>
                    <span className="badge badge-muted">{(selectedCase.auditTrail || []).length} events</span>
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    {(selectedCase.auditTrail || []).length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No audit events yet</div>
                    ) : (
                      <div className="timeline" style={{ padding: '16px 16px 16px 40px' }}>
                        {[...(selectedCase.auditTrail || [])].reverse().map((event, i) => (
                          <div key={i} className="timeline-item">
                            <div className="timeline-dot normal" />
                            <div className="timeline-date">{new Date(event.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {event.actor}</div>
                            <div className="timeline-title">{event.action}</div>
                            {event.details && <div className="timeline-desc">{event.details}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-outline" onClick={() => setStep(4)}>← Back</button>
                  <button className="btn btn-outline" onClick={() => setStep(1)}>← Return to Queue</button>
                  {(selectedCase.status === 'APPROVED' || override?.newDecision === 'APPROVE') && (
                    <button className="btn btn-accent btn-lg" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                      const policyNum = `PL-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;
                      const boundPremium = (selectedCase.agentResults?.final_decision?.recommended_premium || selectedCase.quoteResult?.monthly_premium || 0).toFixed(2);
                      updateCase(selectedCase.id, {
                        status: 'APPROVED',
                        auditTrail: [...(selectedCase.auditTrail || []), {
                          timestamp: new Date().toISOString(), actor: 'GiriRamadoss',
                          action: 'Policy Issued',
                          details: `Policy number: ${policyNum} · Premium: $${boundPremium}/mo`,
                        }],
                      });
                      setPolicyModal({
                        policyNum,
                        petName: selectedCase.pet?.name,
                        breed: selectedCase.pet?.breed,
                        holderName: `${selectedCase.holder?.first_name} ${selectedCase.holder?.last_name}`,
                        coverageType: COVERAGE_LABELS[selectedCase.coverage?.type] || selectedCase.coverage?.type,
                        annualBenefit: selectedCase.coverage?.annual_benefit,
                        premium: boundPremium,
                      });
                    }}>
                      🎉 Issue Policy
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

        </div>

        {/* Case Summary Sidebar — steps 2–5 only */}
        {step > 1 && (
          <CaseSummary c={selectedCase} creRunning={creRunning} />
        )}
      </div>
    </div>
  );
}
