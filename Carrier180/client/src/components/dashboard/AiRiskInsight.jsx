import { useNavigate } from 'react-router-dom';
import styles from './AiRiskInsight.module.css';

export default function AiRiskInsight() {
  const navigate = useNavigate();

  return (
    <div className={`card ${styles.panel}`}>
      <div className={styles.aiLabel}>
        <span className="ai-tag">✦ AI RISK INSIGHT</span>
      </div>
      <h2 className={styles.title}>Priority Adjustment Recommendation</h2>
      <p className={styles.body}>
        Claim <strong>#2026-102</strong> (Mary Johnson) has been flagged with an updated fraud risk score due
        to missing structural documentation and proximity to a coastal surge zone. Immediate inspection is
        recommended to mitigate further loss.
      </p>
      <button className={`btn btn--primary btn--sm ${styles.reviewBtn}`} onClick={() => navigate('/claims/2026-102/review')}>
        Review Analysis
      </button>
    </div>
  );
}
