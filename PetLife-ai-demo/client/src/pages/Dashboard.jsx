import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClaims, getPolicies, getBilling } from '../api';

const MOCK_STATS = {
  active_policies: 5, lapsed_policies: 1,
  open_claims: 3, pending_underwriting: 2,
  monthly_premium_collected: 419.75, fraud_alerts: 1,
  claim_approval_rate: 72, avg_claim_value: 668.50
};

const STATUS_MAP = {
  APPROVED: { cls: 'badge-success', label: 'Approved' },
  PARTIALLY_APPROVED: { cls: 'badge-warning', label: 'Partial' },
  DENIED: { cls: 'badge-danger', label: 'Denied' },
  PENDING: { cls: 'badge-info', label: 'Pending' },
};

export default function Dashboard() {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [stats, setStats] = useState(MOCK_STATS);

  useEffect(() => {
    getClaims().then(r => setClaims(r.data.claims || [])).catch(() => {});
    getPolicies().then(r => setPolicies(r.data.policies || [])).catch(() => {});
  }, []);

  const recentClaims = claims.slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Welcome back, Giri</div>
            <div className="page-subtitle">PetLife AI Insurance Platform — {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon">📋</span>
            <span className="badge badge-success">Active</span>
          </div>
          <div className="kpi-value">{stats.active_policies}</div>
          <div className="kpi-label">Active Policies</div>
          <div className="kpi-trend up mt-4">+3 this month</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon">🏥</span>
            <span className="badge badge-warning">Open</span>
          </div>
          <div className="kpi-value">{stats.open_claims}</div>
          <div className="kpi-label">Open Claims</div>
          <div className="kpi-trend down mt-4">−2 vs last week</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon">⚡</span>
            <span className="badge badge-info">Pending</span>
          </div>
          <div className="kpi-value">{stats.pending_underwriting}</div>
          <div className="kpi-label">Underwriting Queue</div>
          <div className="kpi-trend mt-4" style={{ color: '#6b7280' }}>Awaiting decision</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon">💷</span>
            <span className="badge badge-success">MoM ↑</span>
          </div>
          <div className="kpi-value">${stats.monthly_premium_collected.toFixed(0)}</div>
          <div className="kpi-label">Monthly Premium</div>
          <div className="kpi-trend up mt-4">+$42 vs last month</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-icon">🚨</span>
            <span className="badge badge-danger">Alert</span>
          </div>
          <div className="kpi-value">{stats.fraud_alerts}</div>
          <div className="kpi-label">Fraud Alerts</div>
          <div className="kpi-trend mt-4" style={{ color: '#ef4444' }}>Requires review</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid-2-1">
        {/* Recent Claims */}
        <div className="card">
          <div className="card-header">
            <h2>Recent Claims</h2>
            <Link to="/claims" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Pet / Holder</th>
                  <th>Submitted</th>
                  <th>Condition</th>
                  <th>Billed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentClaims.length > 0 ? recentClaims.map(c => {
                  const s = STATUS_MAP[c.status] || { cls: 'badge-muted', label: c.status };
                  return (
                    <tr key={c.claim_id}>
                      <td><span className="td-id">{c.claim_id}</span></td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{c.pet}</div>
                        <div className="text-muted text-sm">{c.holder}</div>
                      </td>
                      <td className="text-muted text-sm">{c.submitted}</td>
                      <td style={{ fontSize: 13 }}>{c.condition}</td>
                      <td style={{ fontWeight: 600 }}>${c.billed?.toFixed(2)}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 28, color: '#9ca3af' }}>No claims data — start the server</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header"><h3>Quick Actions</h3></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to="/quote" className="btn btn-accent btn-full">💬 Generate New Quote</Link>
              <Link to="/claims" className="btn btn-primary btn-full">🏥 Process Claim</Link>
              <Link to="/underwriting" className="btn btn-ai btn-full">⚡ Run Underwriting</Link>
              <Link to="/fraud" className="btn btn-outline btn-full">🐾 Verify Breed / Fraud</Link>
            </div>
          </div>

          {/* AI Use Cases */}
          <div className="card">
            <div className="card-header">
              <h3>AI Use Cases</h3>
              <span className="ai-tag">✨ Gemini Powered</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📄', label: 'Invoice Parsing', path: '/claims', desc: 'Extract vet invoice data' },
                { icon: '⚖️', label: 'Claims Adjudication', path: '/claims', desc: 'Apply policy rules & adjudicate' },
                { icon: '🔬', label: 'Medical Coding', path: '/coding', desc: 'SNOMED-CT / ICD-10 coding' },
                { icon: '🐾', label: 'Breed & Fraud', path: '/fraud', desc: 'Vision-based breed verification' },
                { icon: '📚', label: 'History Review', path: '/history', desc: 'Pre-existing condition detection' },
                { icon: '⚡', label: 'Risk Underwriting', path: '/underwriting', desc: 'Multi-agent underwriting decision' },
              ].map(uc => (
                <Link key={uc.path + uc.label} to={uc.path} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fafafa' }}>
                  <span style={{ fontSize: 18 }}>{uc.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1d2e' }}>{uc.label}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{uc.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Approval Rate */}
      <div className="card mt-16">
        <div className="card-header"><h3>Claim Statistics</h3></div>
        <div className="card-body">
          <div className="grid-3" style={{ gap: 24 }}>
            {[
              { label: 'Approval Rate', value: `${stats.claim_approval_rate}%`, color: '#10b981', pct: stats.claim_approval_rate },
              { label: 'Avg Claim Value', value: `$${stats.avg_claim_value}`, color: '#3b82f6', pct: 55 },
              { label: 'Fraud Detection', value: '99.2%', color: '#7c3aed', pct: 99 },
            ].map(stat => (
              <div key={stat.label}>
                <div className="flex justify-between mb-8">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{stat.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: stat.color }}>{stat.value}</span>
                </div>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${stat.pct}%`, background: stat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
