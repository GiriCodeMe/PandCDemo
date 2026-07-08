import { useState, useEffect } from 'react';
import { getPolicies } from '../api';

const STATUS_CFG = {
  ACTIVE:   { cls: 'badge-success', label: 'Active' },
  LAPSED:   { cls: 'badge-danger',  label: 'Lapsed' },
  PENDING:  { cls: 'badge-warning', label: 'Pending' },
  CANCELLED:{ cls: 'badge-muted',   label: 'Cancelled' },
};

const COVERAGE_ICONS = { ACCIDENT_ILLNESS: '🏥', WELLNESS: '💊', ACCIDENT_ONLY: '🚑' };

function PolicyDetail({ policy, onClose }) {
  const util = (policy.financials?.annual_benefit_used / policy.coverage.annual_benefit_max * 100).toFixed(1);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 16, width: '780px', maxWidth: '96vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: '#0a0f2c', color: 'white', padding: '20px 28px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{policy.pet.name} — {policy.policy_id}</div>
            <div style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>{policy.pet.breed} · {policy.holder.name}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className={`badge ${STATUS_CFG[policy.status]?.cls || 'badge-muted'}`}>{policy.status}</span>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        <div style={{ padding: 28 }}>
          <div className="grid-2 mb-20">
            {/* Pet info */}
            <div>
              <div className="section-label mb-8">Pet Information</div>
              <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px' }}>
                {[
                  ['Name', policy.pet.name],
                  ['Species', policy.pet.species],
                  ['Breed', policy.pet.breed],
                  ['Sex', policy.pet.sex],
                  ['Date of Birth', policy.pet.dob],
                  ['Microchip', policy.pet.microchip],
                  ['Neutered', policy.pet.neutered ? 'Yes' : 'No'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280', width: 100, fontSize: 12 }}>{k}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Holder info */}
            <div>
              <div className="section-label mb-8">Policyholder</div>
              <div style={{ background: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px' }}>
                {[
                  ['Name', policy.holder.name],
                  ['Email', policy.holder.email],
                  ['Phone', policy.holder.phone],
                  ['Address', policy.holder.address],
                  ['Postcode', policy.holder.postcode],
                  ['Since', policy.holder.customer_since],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280', width: 100, fontSize: 12 }}>{k}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coverage */}
          <div className="section-label mb-8">Coverage Details</div>
          <div className="grid-3 mb-20">
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{COVERAGE_ICONS[policy.coverage.type] || '📋'}</div>
              <div style={{ fontSize: 12, color: '#0369a1', fontWeight: 700 }}>Coverage Type</div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{policy.coverage.type?.replace(/_/g, ' ')}</div>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>💷</div>
              <div style={{ fontSize: 12, color: '#065f46', fontWeight: 700 }}>Annual Benefit</div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>${policy.coverage.annual_benefit_max?.toLocaleString()}</div>
            </div>
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>🔁</div>
              <div style={{ fontSize: 12, color: '#92400e', fontWeight: 700 }}>Reimbursement</div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{100 - policy.coverage.coinsurance_pct}%</div>
            </div>
          </div>

          {/* Benefit utilisation */}
          <div className="section-label mb-8">Benefit Utilisation This Year</div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span>${policy.financials?.annual_benefit_used?.toFixed(2)} used</span>
              <span style={{ color: '#6b7280' }}>of ${policy.coverage.annual_benefit_max?.toLocaleString()} limit</span>
            </div>
            <div className="confidence-bar" style={{ height: 10 }}>
              <div style={{ height: '100%', borderRadius: 5, background: parseFloat(util) > 80 ? '#ef4444' : '#3b82f6', width: `${Math.min(util, 100)}%`, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>${(policy.coverage.annual_benefit_max - policy.financials?.annual_benefit_used)?.toFixed(2)} remaining · {util}% utilised</div>
          </div>

          {/* Excluded conditions */}
          {policy.excluded_conditions?.length > 0 && (
            <div className="alert alert-warning">
              <strong>Policy Exclusions:</strong>
              <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {policy.excluded_conditions.map((e, i) => <span key={i} className="badge badge-danger">{e}</span>)}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
            <button className="btn btn-outline" onClick={onClose}>Close</button>
            <button className="btn btn-primary">Edit Policy</button>
            <button className="btn btn-accent">Process Claim</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    getPolicies({ search, status: statusFilter, species: speciesFilter })
      .then(r => setPolicies(r.data.policies || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, statusFilter, speciesFilter]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Policy Management</div>
            <div className="page-subtitle">{policies.length} policies · Click any row to view details</div>
          </div>
          <button className="btn btn-accent">+ New Policy</button>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <input className="toolbar-search" placeholder="Search policies, pets, holders..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="toolbar-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="LAPSED">Lapsed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select className="toolbar-select" value={speciesFilter} onChange={e => setSpeciesFilter(e.target.value)}>
            <option value="">All Species</option>
            <option value="canine">Dog</option>
            <option value="feline">Cat</option>
            <option value="rabbit">Rabbit</option>
          </select>
          <div className="toolbar-spacer" />
          <span style={{ fontSize: 12, color: '#6b7280' }}>{policies.length} results</span>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Policy ID</th>
                <th>Pet</th>
                <th>Holder</th>
                <th>Coverage</th>
                <th>Monthly Premium</th>
                <th>Annual Limit</th>
                <th>Deductible</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                  <div className="loading-bar" />
                </td></tr>
              ) : policies.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No policies found — try clearing filters</td></tr>
              ) : policies.map(p => {
                const sc = STATUS_CFG[p.status] || { cls: 'badge-muted', label: p.status };
                return (
                  <tr key={p.policy_id} style={{ cursor: 'pointer' }} onClick={() => setSelected(p)}>
                    <td><span className="td-id">{p.policy_id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.pet.name}</div>
                      <div className="text-muted text-sm">{p.pet.breed} · {p.pet.species}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.holder.name}</div>
                      <div className="text-muted text-sm">{p.holder.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-navy" style={{ fontSize: 10 }}>{p.coverage.type?.replace(/_/g, ' ')}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>${p.financials?.monthly_premium?.toFixed(2)}</td>
                    <td>${p.coverage.annual_benefit_max?.toLocaleString()}</td>
                    <td>${p.coverage.deductible}</td>
                    <td className="text-muted text-sm">{p.dates.start}</td>
                    <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => setSelected(p)}>View</button>
                        <button className="btn btn-sm btn-primary">Claim</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <PolicyDetail policy={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
