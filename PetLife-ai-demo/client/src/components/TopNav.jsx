import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NOTIFICATIONS = [
  {
    id: 1, icon: '🆕', type: 'info',
    title: 'New FNOL submitted',
    body: 'Bella (Golden Retriever) · Claim CLM-2026-9104 auto-triaged to Manual Review',
    time: 'Just now', unread: true,
  },
  {
    id: 2, icon: '⚠️', type: 'warning',
    title: 'Payment failure escalated',
    body: 'PET-2026-1192 John Miller — Dunning L2 triggered. Secure pay-link required.',
    time: '5 min ago', unread: true,
  },
  {
    id: 3, icon: '✅', type: 'success',
    title: 'Claim approved & paid',
    body: 'CLM-2026-4392 · $1,240.00 · Figo US · Sarah Thompson — payout dispatched',
    time: '23 min ago', unread: true,
  },
  {
    id: 4, icon: '📋', type: 'review',
    title: 'Underwriting needs triage',
    body: 'UW-2026-0088 · Labrador / pre-existing hip dysplasia — manual review required',
    time: '1 hr ago', unread: false,
  },
  {
    id: 5, icon: '🔄', type: 'info',
    title: 'Policy renewal window open',
    body: 'PET-UK-33771 Oliver Hughes — 30-day renewal period begins today',
    time: '2 hrs ago', unread: false,
  },
];

const NOTIF_COLORS = {
  info:    { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e' },
  success: { bg: '#f0fdf4', border: '#a7f3d0', text: '#065f46' },
  review:  { bg: '#f5f3ff', border: '#ddd6fe', text: '#7c3aed' },
};

export default function TopNav({ onOpenChat }) {
  const [search, setSearch] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, unread: false })));
  const dismiss = (id) => setNotifications(p => p.filter(n => n.id !== id));

  return (
    <header className="topnav">
      <div className="topnav-brand">
        <span>🐾</span>
        <span>PET<span>LIFE</span></span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 400, letterSpacing: 1 }}>AI</span>
      </div>

      <div className="topnav-spacer" />

      <input
        className="topnav-search"
        placeholder="Search policies, claims..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="topnav-actions">
        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="topnav-btn" title="Notifications" onClick={() => setNotifOpen(p => !p)}
            style={{ position: 'relative' }}>
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 0, right: 0, width: 16, height: 16,
                borderRadius: '50%', background: '#ef4444', color: 'white',
                fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #1a2148',
              }}>{unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 380, zIndex: 500,
              background: 'white', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
              border: '1px solid #e5e7eb', overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1a2148' }}>
                  Notifications {unreadCount > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: '#fef2f2', color: '#dc2626', marginLeft: 6 }}>{unreadCount} new</span>}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifications.map(n => {
                  const c = NOTIF_COLORS[n.type] || NOTIF_COLORS.info;
                  return (
                    <div key={n.id} style={{
                      padding: '12px 16px', borderBottom: '1px solid #f9fafb',
                      background: n.unread ? '#fafcff' : 'white',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
                        {n.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 4 }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: '#1a2148' }}>{n.title}</div>
                          <div style={{ fontSize: 10, color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>{n.time}</div>
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                      </div>
                      {n.unread && (
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: 4 }} />
                      )}
                      <button onClick={() => dismiss(n.id)} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', fontSize: 14, padding: '0 2px', flexShrink: 0 }}>×</button>
                    </div>
                  );
                })}
                {notifications.length === 0 && (
                  <div style={{ padding: '30px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    No notifications
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 16px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                <button style={{ fontSize: 12, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  View all activity
                </button>
              </div>
            </div>
          )}
        </div>

        <button className="topnav-btn" title="Reports" onClick={() => navigate('/reports')}>📊</button>
        <button className="topnav-ai-btn" onClick={onOpenChat}>🐾 Ask Pawspect</button>
        <div className="topnav-avatar" title="GiriRamadoss">GR</div>
      </div>
    </header>
  );
}
