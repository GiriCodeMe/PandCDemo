import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import styles from './ClaimsTable.module.css';

function statusClass(s) {
  if (s === 'New') return 'badge--new';
  if (s === 'Under Review') return 'badge--review';
  return 'badge--closed';
}

function riskClass(r) { return `risk-dot--${r.toLowerCase()}`; }

export default function ClaimsTable() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [risk, setRisk] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    claimsApi.list({ search, status, risk })
      .then(data => { setClaims(data.claims); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, status, risk]);

  return (
    <div className={`card ${styles.wrap}`}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.search}
            placeholder="Search by Claim # or Policyholder..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <select className={styles.filter} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="All">Status: All</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="Closed">Closed</option>
          </select>
          <select className={styles.filter} value={risk} onChange={e => setRisk(e.target.value)}>
            <option value="All">Risk: All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>CLAIM #</th>
            <th>POLICYHOLDER</th>
            <th>CAUSE OF LOSS</th>
            <th>CLAIM AMOUNT</th>
            <th>DATE OF LOSS</th>
            <th>STATUS</th>
            <th>ADJUSTER</th>
            <th>FRAUD RISK</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={8} className={styles.loading}>Loading claims...</td></tr>
          ) : claims.length === 0 ? (
            <tr><td colSpan={8} className={styles.loading}>No claims found</td></tr>
          ) : claims.map(c => (
            <tr key={c.id} className={styles.row} onClick={() => navigate(`/claims/${c.id}/review`)}>
              <td className={styles.claimId}>{c.id}</td>
              <td>{c.insuredName}</td>
              <td>{c.causeOfLoss}</td>
              <td className={styles.amount}>${c.claimAmount.toLocaleString()}</td>
              <td>{c.dateOfLoss}</td>
              <td><span className={`badge ${statusClass(c.status)}`}>{c.status}</span></td>
              <td>{c.adjuster}</td>
              <td>
                <span className={styles.riskCell}>
                  <span className={`risk-dot ${riskClass(c.fraudRisk)}`} />
                  {c.fraudRisk}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.footer}>
        <span>Showing {claims.length} of {total} claims</span>
        <div className={styles.pages}>
          <button className={styles.pageBtn}>Previous</button>
          <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
          <button className={styles.pageBtn}>2</button>
          <button className={styles.pageBtn}>3</button>
          <button className={styles.pageBtn}>Next</button>
        </div>
      </div>
    </div>
  );
}
