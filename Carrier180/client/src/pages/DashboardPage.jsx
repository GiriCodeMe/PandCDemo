import { useEffect, useState } from 'react';
import { useStella } from '../context/StellaContext';
import { claimsApi } from '../services/api';
import KpiCard from '../components/dashboard/KpiCard';
import ClaimsTable from '../components/dashboard/ClaimsTable';
import AiRiskInsight from '../components/dashboard/AiRiskInsight';
import RegionChart from '../components/dashboard/RegionChart';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { updateContext } = useStella();
  const [stats, setStats] = useState({ newClaims: 21, largeLossAlerts: 4, insuredSentimentAlerts: 6, highFraudRisk: 3, avgCycleTimeOver15: 2 });

  useEffect(() => {
    updateContext({ page: 'dashboard', claimId: null, step: null });
    claimsApi.stats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.overviewLabel}>OVERVIEW</div>
          <h1>Claims Dashboard</h1>
        </div>
        <div className={styles.greeting}>
          <div className={styles.greetingLabel}>GOOD MORNING</div>
          <div className={styles.greetingName}>JANE DOE</div>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <KpiCard icon="📋" label="New Claims"             value={stats.newClaims}              badge="+12%" badgeType="low" />
        <KpiCard icon="⚠"  label="Large Loss Alerts"      value={String(stats.largeLossAlerts).padStart(2,'0')} />
        <KpiCard icon="📅" label="Insured Sentiment Alerts" value={String(stats.insuredSentimentAlerts).padStart(2,'0')} />
        <KpiCard icon="⚠"  label="High Fraud Risk"        value={String(stats.highFraudRisk).padStart(2,'0')} badge="Critical" badgeType="critical" />
        <KpiCard icon="🕐" label="Avg Cycle Time > 15 Days" value={String(stats.avgCycleTimeOver15).padStart(2,'0')} />
      </div>

      <ClaimsTable />

      <div className={styles.bottomGrid}>
        <AiRiskInsight />
        <RegionChart />
      </div>
    </div>
  );
}
