import styles from './ClaimStepper.module.css';

const STEPS = [
  { n: 1, label: 'Claim Submission' },
  { n: 2, label: 'Claim Validation' },
  { n: 3, label: 'Insights & Review' },
  { n: 4, label: 'Communication Log' },
  { n: 5, label: 'Next Steps' }
];

export default function ClaimStepper({ current, onStepClick }) {
  return (
    <div className={styles.stepper}>
      {STEPS.map((s, i) => {
        const done    = s.n < current;
        const active  = s.n === current;
        return (
          <div key={s.n} className={styles.stepGroup}>
            {i > 0 && <div className={`${styles.connector} ${done || active ? styles.connectorDone : ''}`} />}
            <button
              className={`${styles.step} ${active ? styles.stepActive : ''} ${done ? styles.stepDone : ''}`}
              onClick={() => onStepClick?.(s.n)}
            >
              <div className={styles.circle}>
                {done ? '✓' : s.n}
              </div>
              <span className={styles.label}>{s.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
