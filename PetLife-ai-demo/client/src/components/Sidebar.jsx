import { NavLink, Link } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/',            icon: '🐾', label: 'Dashboard' },
  { path: '/quote',       icon: '🐾', label: 'New Quote' },
  { path: '/policies',    icon: '🐾', label: 'Policies' },
  { path: '/claims',      icon: '🐾', label: 'Claims',    badge: '3' },

  { path: '/underwriting',icon: '🐾', label: 'Underwriting', badge: '2' },
  { path: '/billing',     icon: '🐾', label: 'Billing' },
  { path: '/fnol',         icon: '🐾', label: 'FNOL Intake' },
  { path: '/clinic',       icon: '🏥', label: 'Clinic Portal' },
  { path: '/hotel-portal', icon: '🏨', label: 'Hotel Portal' },
  { path: '/reports',      icon: '🐾', label: 'Reports' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-logo" style={{ textDecoration: 'none' }}>
        <span className="sidebar-logo-icon">🐾</span>
        <div>
          <div className="sidebar-logo-text">PetLife AI</div>
          <div className="sidebar-logo-sub">Insurance Platform</div>
        </div>
      </Link>

      <div className="sidebar-section-label">Navigation</div>

      <nav className="sidebar-nav">
        <Link to="/quote" className="sidebar-cta">
          + New Quote
        </Link>

        <div style={{ marginTop: 8 }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              <span className="sidebar-item-label">{item.label}</span>
              {item.badge && <span className="sidebar-item-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-item">⚙️ Settings</div>
        <div className="sidebar-footer-item">❓ Help & Support</div>
        <div className="sidebar-footer-item" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, padding: '8px 10px' }}>
          Powered by EPAM AI
        </div>
      </div>
    </aside>
  );
}
