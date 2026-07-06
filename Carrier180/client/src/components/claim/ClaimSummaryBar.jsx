import styles from './ClaimSummaryBar.module.css';

export default function ClaimSummaryBar({ claim }) {
  if (!claim) return null;
  return (
    <div className={styles.bar}>
      <Cell label="Insured Name"         value={claim.insuredName} />
      <Cell label="Policy Number"        value={claim.policyNumber} />
      <Cell label="Date of Loss"         value={claim.dateOfLoss} />
      <Cell label="Claim #"              value={claim.id} />
      <div className={styles.divider} />
      <Cell label="Cause of Loss"        value={<span className={styles.causeTag}>◯ {claim.causeOfLoss}</span>} />
      <Cell label="AI Sentiment Analysis" value={claim.aiSentiment} />
      <Cell label="Insured Segmentation" value={<strong>{claim.insuredSegmentation}</strong>} />
    </div>
  );
}

function Cell({ label, value }) {
  return (
    <div className={styles.cell}>
      <div className={styles.cellLabel}>{label}</div>
      <div className={styles.cellValue}>{value}</div>
    </div>
  );
}
