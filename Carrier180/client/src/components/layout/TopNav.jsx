import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStella } from '../../context/StellaContext';
import styles from './TopNav.module.css';

const PENDING_ALERTS = [
  {
    id: 1,
    priority: 'HIGH',
    claimId: '2026-102',
    title: 'Claim 2026-102 — Missing Structural Assessment',
    sub: 'Fire claim cannot be settled without a licensed structural engineer report',
    path: '/claims/2026-102/review?step=2'
  },
  {
    id: 2,
    priority: 'MEDIUM',
    claimId: '2026-108',
    title: 'Claim 2026-108 — Invoice Address Mismatch',
    sub: 'Repair invoice shows 98 Commerce Dr vs loss address 123 Main St',
    path: '/claims/2026-108/review?step=2'
  }
];

export default function TopNav() {
  const navigate = useNavigate();
  const { toggle } = useStella();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    }
    if (showNotif) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showNotif]);

  return (
    <header className={styles.topnav}>
      <div className={styles.logo} onClick={() => navigate('/dashboard')}>
        <span className={styles.logoCarrier}>CARRIER</span>
      </div>

      <nav className={styles.links}>
        <button className={styles.link} onClick={() => navigate('/dashboard')}>Dashboard</button>
        <button className={styles.link} onClick={() => navigate('/claims')}>Claims</button>
        <button className={styles.link} onClick={() => navigate('/reports')}>Reports</button>
      </nav>

      <div className={styles.right}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input className={styles.search} placeholder="Search claims..." />
        </div>

        <div ref={notifRef} className={styles.notifWrap}>
          <button
            className={`${styles.iconBtn} ${showNotif ? styles.iconBtnActive : ''}`}
            onClick={() => setShowNotif(v => !v)}
            title={`${PENDING_ALERTS.length} pending actions`}
          >
            🔔
            <span className={styles.notifBadge}>{PENDING_ALERTS.length}</span>
          </button>

          {showNotif && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span>Pending Actions</span>
                <span className={styles.notifCount}>{PENDING_ALERTS.length} requiring attention</span>
              </div>
              {PENDING_ALERTS.map(alert => (
                <div
                  key={alert.id}
                  className={styles.notifItem}
                  onClick={() => { setShowNotif(false); navigate(alert.path); }}
                >
                  <span className={`${styles.notifPriority} ${styles[`notifPriority--${alert.priority.toLowerCase()}`]}`}>
                    {alert.priority}
                  </span>
                  <div className={styles.notifContent}>
                    <div className={styles.notifTitle}>{alert.title}</div>
                    <div className={styles.notifSub}>{alert.sub}</div>
                  </div>
                  <span className={styles.notifArrow}>→</span>
                </div>
              ))}
              <div className={styles.notifFooter} onClick={() => { setShowNotif(false); navigate('/claims'); }}>
                View all claims →
              </div>
            </div>
          )}
        </div>

        <button className={styles.iconBtn} title="Settings">⚙</button>
        <div className={styles.avatar}>J</div>
        <button className={styles.stellaBtn} onClick={toggle}>
          <span>✦</span> Ask Stella
        </button>
      </div>
    </header>
  );
}
