import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/claims',    label: 'Claims',    icon: '📋' },
  { to: '/reports',   label: 'Reports',   icon: '📊' }
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.portalLabel}>
        <span className={styles.portalTitle}>CLAIMS PORTAL</span>
        <span className={styles.portalSub}>Claims Adjuster Workflow</span>
      </div>

      <nav className={styles.nav}>
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <span className={styles.navIcon}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className={styles.newClaimBtn} onClick={() => navigate('/claims/new')}>
        + New Claim
      </button>

      <div className={styles.bottomNav}>
        <button className={styles.bottomItem}>
          <span>⚙</span> Support
        </button>
        <button className={styles.bottomItem}>
          <span>👤</span> Account
        </button>
      </div>
    </aside>
  );
}
