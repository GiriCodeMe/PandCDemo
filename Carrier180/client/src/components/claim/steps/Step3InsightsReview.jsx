import styles from './Steps.module.css';

export default function Step3InsightsReview({ claim }) {
  if (!claim) return null;
  const { fraudAnalysis, insuredHistory, visualEvidence } = claim;
  const score = fraudAnalysis?.score || 0;
  const level = (fraudAnalysis?.level || 'low').toLowerCase();
  const cursorPct = Math.min(score, 100);

  return (
    <div className={styles.stepContent}>
      <h1 className={styles.stepTitle}>Claim Insights &amp; Review</h1>

      <Section num="01" title="Visual Analysis">
        {visualEvidence
          ? (
            <div className={styles.visualGrid}>
              <div className={styles.visualBox}>
                <div className={styles.visualLabel}>{visualEvidence.before.label}</div>
                <img
                  src={visualEvidence.before.url}
                  alt={visualEvidence.before.label}
                  className={styles.visualImage}
                />
                <div className={styles.visualCaption}>{visualEvidence.before.caption}</div>
              </div>
              <div className={styles.visualBox}>
                <div className={styles.visualLabel}>{visualEvidence.after.label}</div>
                <img
                  src={visualEvidence.after.url}
                  alt={visualEvidence.after.label}
                  className={styles.visualImage}
                />
                <div className={styles.visualCaption}>{visualEvidence.after.caption}</div>
              </div>
            </div>
          )
          : (
            <div className={styles.visualGrid}>
              <div className={styles.visualBox}>
                <div className={styles.visualLabel}>BEFORE LOSS</div>
                <div className={styles.visualPlaceholder}>🏠</div>
              </div>
              <div className={styles.visualBox}>
                <div className={styles.visualLabel}>AFTER LOSS</div>
                <div className={styles.visualPlaceholder}>⚠</div>
              </div>
            </div>
          )}
      </Section>

      <Section num="02" title="Fraud Analysis">
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
          <div className={styles.fraudGauge}>
            <div className={`${styles.gaugeScore} ${styles[`gaugeScore--${level}`]}`}>{score}</div>
            <div className={styles.gaugeLabel}>{fraudAnalysis?.level} Risk</div>
            <div className={styles.gaugeBar}>
              <div className={styles.gaugeCursor} style={{ left: `${cursorPct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-muted)' }}>
              <span>Low</span><span>High</span>
            </div>
          </div>
          <div className={styles.flagList}>
            {(fraudAnalysis?.flags || []).length === 0
              ? <div style={{ color: '#16a34a', fontSize: 13 }}>✓ No fraud flags detected.</div>
              : fraudAnalysis.flags.map(f => (
                  <div key={f} className={styles.flagItem}>⚠ {f}</div>
                ))}
          </div>
        </div>
      </Section>

      <Section num="03" title="Insured History">
        {(insuredHistory || []).length === 0
          ? <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No prior claims on record.</p>
          : (
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Date</th>
                  <th>Cause</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {insuredHistory.map(h => (
                  <tr key={h.claimId}>
                    <td>{h.claimId}</td>
                    <td>{h.date}</td>
                    <td>{h.cause}</td>
                    <td>${h.amount.toLocaleString()}</td>
                    <td><span className="badge badge--closed">{h.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </Section>
    </div>
  );
}

function Section({ num, title, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionNum}>{num}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
