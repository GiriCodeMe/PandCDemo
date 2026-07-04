import { useEffect } from 'react';
import { useStella } from '../context/StellaContext';
import ClaimsTable from '../components/dashboard/ClaimsTable';
import styles from './ClaimsPage.module.css';

export default function ClaimsPage() {
  const { updateContext } = useStella();

  useEffect(() => {
    updateContext({ page: 'claims', claimId: null, step: null });
  }, [updateContext]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>All Claims</h1>
      </div>
      <ClaimsTable />
    </div>
  );
}
