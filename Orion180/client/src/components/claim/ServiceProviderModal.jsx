import { useState, useEffect } from 'react';
import styles from './ServiceProviderModal.module.css';
import { erpApi } from '../../services/api';

export default function ServiceProviderModal({ type, zip, title, onClose, onSelect }) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    erpApi.getServiceProviders(type, zip)
      .then(data => { setProviders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [type, zip]);

  function handleAssign() {
    if (!selected) return;
    if (onSelect) onSelect(selected);
    onClose();
  }

  const typeLabel = type === 'plumber' ? 'Plumber' : 'Field Inspector';
  const typeIcon = type === 'plumber' ? '🔧' : '🔍';

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>{typeIcon} {title || `Available ${typeLabel}s`}</div>
            <div className={styles.subtitle}>
              Carrier-registered providers within 50 miles of zip {zip}
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {loading && (
            <div className={styles.loading}>Loading registered providers from CRM...</div>
          )}
          {!loading && providers.length === 0 && (
            <div className={styles.empty}>No registered {typeLabel.toLowerCase()}s found for this area.</div>
          )}
          {!loading && providers.map(p => (
            <div
              key={p.id}
              className={`${styles.card} ${selected?.id === p.id ? styles.cardSelected : ''}`}
              onClick={() => setSelected(p)}
            >
              <div className={styles.cardTop}>
                <div className={styles.cardName}>
                  {p.name}
                  {p.title && <span className={styles.cardTitle}> — {p.title}</span>}
                </div>
                <div className={styles.distanceBadge}>{p.distance} mi</div>
              </div>
              <div className={styles.cardAddress}>{p.address}</div>
              <div className={styles.cardMeta}>
                <span>{p.phone}</span>
                <span>·</span>
                <span className={styles.availability}>{p.availability}</span>
                <span>·</span>
                <span className={styles.nextSlot}>{p.nextSlot}</span>
              </div>
              <div className={styles.specialties}>
                {(p.specialties || []).map(s => (
                  <span key={s} className={styles.specialty}>{s}</span>
                ))}
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.rating}>
                  {'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}
                  <span className={styles.ratingNum}> {p.rating} ({p.reviewCount} reviews)</span>
                </div>
                {p.carrier180Certified && (
                  <div className={styles.certified}>
                    ✓ Carrier Certified · {p.yearsWithCarrier180} yrs · {p.claimsHandled} claims
                  </div>
                )}
                {p.credentials && <div className={styles.credentials}>{p.credentials}</div>}
                {p.license && <div className={styles.license}>Lic: {p.license}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerNote}>
            Data sourced from Carrier CRM/SOR · {providers.length} provider(s) found
          </span>
          <div className={styles.footerBtns}>
            <button className="btn btn--outline" onClick={onClose}>Cancel</button>
            <button
              className="btn btn--primary"
              onClick={handleAssign}
              disabled={!selected}
            >
              Assign {selected ? selected.name.split(' ')[0] : typeLabel} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
