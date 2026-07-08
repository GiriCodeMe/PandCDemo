import { useState } from 'react';

const PERIODS = ['Q2 2026 (Apr–Jun)', 'Q1 2026 (Jan–Mar)', 'FY 2025', 'MTD Jul 2026'];

const BRAND_DATA = [
  { brand: 'Figo US',        gwp: 842300, policies: 5210, claimsRatio: 61.2, flag: '🇺🇸' },
  { brand: 'Embrace US',     gwp: 734100, policies: 4880, claimsRatio: 64.8, flag: '🇺🇸' },
  { brand: 'Nationwide US',  gwp: 521400, policies: 3140, claimsRatio: 58.9, flag: '🇺🇸' },
  { brand: 'Trupanion US',   gwp: 410200, policies: 2370, claimsRatio: 72.1, flag: '🇺🇸' },
  { brand: 'Hartville US',   gwp: 180500, policies: 1090, claimsRatio: 55.3, flag: '🇺🇸' },
  { brand: 'Everypaw UK',    gwp: 98400,  policies:  904, claimsRatio: 60.7, flag: '🇬🇧' },
  { brand: 'Petplan EU',     gwp: 52800,  policies:  653, claimsRatio: 57.4, flag: '🇪🇺' },
];

const CLAIM_TYPES = [
  { type: 'Illness',     count: 1842, avgCost: 1240, color: '#3b82f6' },
  { type: 'Accident',    count: 1103, avgCost:  890, color: '#f59e0b' },
  { type: 'Surgery',     count:  471, avgCost: 3620, color: '#ef4444' },
  { type: 'Dental',      count:  384, avgCost:  640, color: '#8b5cf6' },
  { type: 'Wellness',    count:  291, avgCost:  180, color: '#10b981' },
  { type: 'Behavioural', count:   88, avgCost:  420, color: '#6b7280' },
];

const TOP_BREEDS = [
  { breed: 'French Bulldog', claims: 428, avgCost: 2840, trend: '+12%', risk: 'HIGH' },
  { breed: 'Golden Retriever', claims: 371, avgCost: 1920, trend: '+4%',  risk: 'MEDIUM' },
  { breed: 'Labrador Retriever', claims: 344, avgCost: 1780, trend: '+2%', risk: 'MEDIUM' },
  { breed: 'German Shepherd', claims: 298, avgCost: 2110, trend: '+7%',  risk: 'HIGH' },
  { breed: 'Poodle',          claims: 187, avgCost: 1340, trend: '-3%',  risk: 'LOW' },
  { breed: 'Bulldog',         claims: 163, avgCost: 3180, trend: '+18%', risk: 'HIGH' },
  { breed: 'Beagle',          claims: 144, avgCost:  980, trend: '0%',   risk: 'LOW' },
];

const RECENT_EXCEPTIONS = [
  { date: 'Jul 07', type: 'Card Failed',     policy: 'PET-2026-1192', holder: 'John Miller',   amount: '$45.50', state: 'Dunning L2', flag: '🇺🇸' },
  { date: 'Jul 07', type: 'Unapplied Wire',  policy: 'ACC-992185',    holder: 'Unassigned',    amount: '$250.00',state: 'Unmatched', flag: '🏢' },
  { date: 'Jul 06', type: 'ACH R01',         policy: 'PET-2026-8831', holder: 'Sarah Jenkins', amount: '$82.00', state: 'Dunning L1', flag: '🇺🇸' },
  { date: 'Jul 06', type: 'BACS Cancelled',  policy: 'PET-UK-44912',  holder: 'Oliver Smith',  amount: '£38.00', state: 'Dunning L1', flag: '🇬🇧' },
  { date: 'Jul 05', type: 'Fraud Chargeback',policy: 'CHB-2026-0088', holder: 'Lisa Torres',   amount: '$124.50',state: 'L3 CRITICAL', flag: '🇺🇸' },
];

const RISK_COLORS = { HIGH: { bg: '#fee2e2', color: '#dc2626' }, MEDIUM: { bg: '#fef3c7', color: '#d97706' }, LOW: { bg: '#d1fae5', color: '#065f46' } };

function Bar({ value, max, color }) {
  return (
    <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${Math.round((value / max) * 100)}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
    </div>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState(PERIODS[0]);

  const totalGWP        = BRAND_DATA.reduce((s, b) => s + b.gwp, 0);
  const totalPolicies   = BRAND_DATA.reduce((s, b) => s + b.policies, 0);
  const avgClaimsRatio  = (BRAND_DATA.reduce((s, b) => s + b.claimsRatio, 0) / BRAND_DATA.length).toFixed(1);
  const totalClaims     = CLAIM_TYPES.reduce((s, t) => s + t.count, 0);
  const maxBrandGWP     = Math.max(...BRAND_DATA.map(b => b.gwp));
  const maxClaimCount   = Math.max(...CLAIM_TYPES.map(t => t.count));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="page-title">Pet Insurance Business Report</div>
            <div className="page-subtitle">Executive performance overview · All brands · Powered by EPAM AI analytics</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={period} onChange={e => setPeriod(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
              {PERIODS.map(p => <option key={p}>{p}</option>)}
            </select>
            <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', fontSize: 12, fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
              ⬇ Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Executive KPIs */}
      <div className="kpi-grid mb-20" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon">💰</span><span className="badge badge-success">+12% YoY</span></div>
          <div className="kpi-value">${(totalGWP / 1_000_000).toFixed(2)}M</div>
          <div className="kpi-label">Gross Written Premium</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon">📋</span><span className="badge badge-success">+8% YoY</span></div>
          <div className="kpi-value">{totalPolicies.toLocaleString()}</div>
          <div className="kpi-label">Policies in Force</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon">⚖️</span><span className="badge badge-warning">Monitor</span></div>
          <div className="kpi-value" style={{ color: '#d97706' }}>{avgClaimsRatio}%</div>
          <div className="kpi-label">Claims Loss Ratio</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon">📊</span><span className="badge badge-success">Healthy</span></div>
          <div className="kpi-value" style={{ color: '#065f46' }}>94.1%</div>
          <div className="kpi-label">Net Combined Ratio</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><span className="kpi-icon">🆕</span><span className="badge badge-info">MTD</span></div>
          <div className="kpi-value">{totalClaims.toLocaleString()}</div>
          <div className="kpi-label">Total Claims Filed</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Premium by Brand */}
        <div className="card">
          <div className="card-header"><h2>Gross Written Premium by Brand</h2></div>
          <div style={{ padding: '16px 20px' }}>
            {BRAND_DATA.map((b, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{b.flag} {b.brand}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1a2148' }}>${(b.gwp / 1000).toFixed(0)}K</span>
                    <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>{b.policies.toLocaleString()} policies</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Bar value={b.gwp} max={maxBrandGWP} color="#3b82f6" />
                  <span style={{ fontSize: 11, color: b.claimsRatio > 65 ? '#dc2626' : b.claimsRatio > 60 ? '#d97706' : '#065f46', fontWeight: 700, width: 40, textAlign: 'right' }}>
                    {b.claimsRatio}%
                  </span>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 11, color: '#9ca3af', display: 'flex', gap: 16 }}>
              <span>Bar = GWP share</span>
              <span>% = Claims loss ratio</span>
            </div>
          </div>
        </div>

        {/* Claims by Type */}
        <div className="card">
          <div className="card-header"><h2>Claims by Type</h2></div>
          <div style={{ padding: '16px 20px' }}>
            {CLAIM_TYPES.map((t, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: t.color, display: 'inline-block' }} />
                    {t.type}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1a2148' }}>{t.count.toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 8 }}>avg ${t.avgCost.toLocaleString()}</span>
                  </div>
                </div>
                <Bar value={t.count} max={maxClaimCount} color={t.color} />
              </div>
            ))}
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Total claims filed</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#1a2148' }}>{totalClaims.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Top Breeds by Claim Frequency */}
        <div className="card">
          <div className="card-header"><h2>Top Breeds by Claim Frequency</h2><span className="ai-tag">🤖 AI Risk Scoring</span></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Breed</th>
                  <th>Claims</th>
                  <th>Avg Cost</th>
                  <th>Trend</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {TOP_BREEDS.map((b, i) => {
                  const rc = RISK_COLORS[b.risk];
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{b.breed}</td>
                      <td style={{ fontWeight: 700 }}>{b.claims}</td>
                      <td>${b.avgCost.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: b.trend.startsWith('+') ? '#dc2626' : b.trend.startsWith('-') ? '#065f46' : '#6b7280' }}>{b.trend}</td>
                      <td><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: rc.bg, color: rc.color }}>{b.risk}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Billing Exceptions */}
        <div className="card">
          <div className="card-header"><h2>Recent Billing Exceptions</h2></div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Policy</th>
                  <th>Holder</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_EXCEPTIONS.map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: 11, color: '#9ca3af' }}>{e.date}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>{e.flag} {e.policy}</td>
                    <td style={{ fontSize: 12 }}>{e.holder}</td>
                    <td style={{ fontWeight: 800 }}>{e.amount}</td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
                        background: e.state.includes('CRITICAL') ? '#fecaca' : e.state.includes('L2') ? '#fee2e2' : e.state.includes('L1') ? '#fef3c7' : '#f3f4f6',
                        color: e.state.includes('CRITICAL') ? '#991b1b' : e.state.includes('L2') ? '#dc2626' : e.state.includes('L1') ? '#d97706' : '#6b7280',
                      }}>{e.state}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card mb-20">
        <div className="card-header">
          <h2>AI Business Insights</h2>
          <span className="ai-tag">⚡ Powered by EPAM AI · Gemini 2.0</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { icon: '📈', title: 'Premium Growth Driver', color: '#065f46', bg: '#f0fdf4', border: '#a7f3d0',
              insight: 'Figo US grew GWP by 18% QoQ driven by multi-pet discount uptake. Recommend expanding the bundle to Embrace US.' },
            { icon: '⚠️', title: 'Claims Risk Signal', color: '#92400e', bg: '#fffbeb', border: '#fcd34d',
              insight: 'French Bulldog and Bulldog claims up 12–18% YoY. Trupanion claims ratio (72.1%) exceeds target. Recommend breed surcharge review.' },
            { icon: '🤖', title: 'Auto-Resolution Rate', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
              insight: '6 of 10 active billing exceptions are AI auto-resolvable. Gemini resolved 94% of FX variance and fractional balance cases with no human intervention.' },
          ].map((ins, i) => (
            <div key={i} style={{ background: ins.bg, border: `1px solid ${ins.border}`, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>{ins.icon}</span>
                <span style={{ fontWeight: 800, fontSize: 13, color: ins.color }}>{ins.title}</span>
              </div>
              <p style={{ fontSize: 12, color: ins.color, lineHeight: 1.6, margin: 0 }}>{ins.insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
