import styles from './RegionChart.module.css';

const REGIONS = [
  { label: 'Florida Coast', pct: 85, color: '#0a0f2c' },
  { label: 'Texas Inland',  pct: 25, color: '#3b82f6' },
  { label: 'Other',         pct: 10, color: '#d1d5db' }
];

export default function RegionChart() {
  return (
    <div className={`card ${styles.panel}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Claim Distribution by Region</h2>
        <button className={styles.iconBtn}>⊞</button>
      </div>

      <div className={styles.bars}>
        {REGIONS.map(r => (
          <div key={r.label} className={styles.barRow}>
            <div className={styles.barLabel}>
              <span className={styles.dot} style={{ background: r.color }} />
              <span>{r.label}</span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${r.pct}%`, background: r.color }} />
            </div>
            <span className={styles.barPct}>{r.pct}%</span>
          </div>
        ))}
      </div>

      <div className={styles.alert}>
        <div className={styles.alertHeader}>⚠ REGIONAL RISK ASSESSMENT</div>
        <p className={styles.alertBody}>
          Over the last 3 months, an unusual concentration of similar loss type patterns has been detected
          in <strong>Zip Code 33109</strong>. This trend suggests potential organized fraud requiring additional scrutiny.
        </p>
      </div>

      <div className={styles.footer}>
        <span className={styles.footerLabel}>TOTAL CLAIMS ANALYZED</span>
        <span className={styles.footerVal}>1,264 UNITS</span>
      </div>
    </div>
  );
}
