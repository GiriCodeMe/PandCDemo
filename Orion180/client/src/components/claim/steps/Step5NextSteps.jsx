import { useState } from 'react';
import styles from './Steps.module.css';
import ServiceProviderModal from '../ServiceProviderModal';

function detectActionType(action) {
  const lower = action.toLowerCase();
  if (lower.includes('plumber') || lower.includes('plumbing')) return 'plumber';
  if (lower.includes('structural engineer')) return 'structural-inspector';
  if (lower.includes('field adjuster') || lower.includes('field inspection') || lower.includes('site inspection')) return 'inspector';
  if (lower.includes('siu')) return 'siu';
  if (lower.includes('ale') || lower.includes('hotel')) return 'ale';
  if (lower.includes('second visit') || lower.includes('confirm visit') || lower.includes('on site') || lower.includes('on-site')) return 'confirm-visit';
  if (lower.includes('schedule') && (lower.includes('inspection') || lower.includes('follow'))) return 'schedule';
  if (lower.includes('approve') || lower.includes('authorization') || lower.includes('authorize')) return 'authorize';
  if (lower.includes('issue payment') || lower.includes('payment authorization')) return 'payment';
  return 'generic';
}

function buildConfirmMessage(action, claim) {
  const lower = action.toLowerCase();
  if (lower.includes('second visit') || lower.includes('on site') || lower.includes('on-site')) {
    return `Schedule a second on-site visit for claim #${claim.id} (${claim.insuredName}, ${claim.causeOfLoss} — ${claim.address?.city}, ${claim.address?.state})?\n\nThis will log a field visit request and notify the assigned adjuster (${claim.adjuster || 'Jane Doe'}) to coordinate access with the insured. Second visits are typically required when the initial assessment needs validation or when repair scope has changed.`;
  }
  if (lower.includes('schedule') && lower.includes('follow')) {
    return `Schedule a 30-day follow-up inspection for claim #${claim.id}?\n\nThis will add a follow-up task to the adjuster's queue and notify the insured that a final verification inspection will be conducted after repairs are completed.`;
  }
  if (lower.includes('approve')) {
    return `Approve the contractor estimate for claim #${claim.id} (${claim.insuredName})?\n\nApproving will authorize the contractor to begin work and release the initial payment per the approved estimate. This action is logged in the claim file.`;
  }
  if (lower.includes('payment authorization') || lower.includes('issue payment')) {
    return `Issue payment authorization for claim #${claim.id} to ${claim.insuredName}?\n\nThis will initiate the payment disbursement process. The payment will be processed per the settlement amount approved on file. Estimated processing time: 3–5 business days.`;
  }
  return `Proceed with the following action for claim #${claim.id}?\n\n"${action}"\n\nThis action will be logged in the claim file and the assigned adjuster will be notified.`;
}

function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 12, padding: 32, maxWidth: 480, width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, color: '#1a1d2e' }}>Confirm Action</div>
        <div style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.75, marginBottom: 26, whiteSpace: 'pre-line' }}>{message}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            style={{ padding: '9px 22px', borderRadius: 8, background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={onClose}
          >Cancel</button>
          <button
            style={{ padding: '9px 22px', borderRadius: 8, background: '#e84040', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            onClick={() => { onConfirm(); onClose(); }}
          >Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default function Step5NextSteps({ claim }) {
  if (!claim) return null;
  const { nextSteps } = claim;
  const decision = nextSteps?.decisionStatus || nextSteps?.decision || 'Pending Review';
  const rationale = nextSteps?.decisionRationale || nextSteps?.rationale || 'Awaiting final review and documentation.';
  const actions = nextSteps?.nextBestActions || nextSteps?.actions || [];

  const [modal, setModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [completedActions, setCompletedActions] = useState(new Set());

  const zip = claim.address?.zip;

  function handleAction(action, index) {
    const type = detectActionType(action);
    if (type === 'plumber') {
      setModal({ type: 'plumber', title: 'Available Registered Plumbers', action, index });
    } else if (type === 'inspector') {
      setModal({ type: 'inspector', title: 'Available Field Inspectors / Adjusters', action, index });
    } else if (type === 'structural-inspector') {
      setModal({ type: 'inspector', title: 'Structural Engineer Inspectors', action, index });
    } else if (type === 'siu') {
      setConfirmModal({
        message: 'Initiate SIU (Special Investigation Unit) Preliminary Review for this claim? This will create a referral in the SIU case management system and notify the SIU liaison.',
        index
      });
    } else if (type === 'ale') {
      setConfirmModal({
        message: `Confirm ALE (Additional Living Expense) hotel authorization for insured (${claim.insuredName})? This will authorize hotel accommodation at the approved rate per policy ALE coverage terms.`,
        index
      });
    } else {
      setConfirmModal({ message: buildConfirmMessage(action, claim), index });
    }
  }

  function markDone(index) {
    setCompletedActions(prev => new Set([...prev, index]));
  }

  const bannerClass = decision.toLowerCase().includes('approved')
    ? styles['decisionBanner--approved']
    : decision.toLowerCase().includes('review')
      ? styles['decisionBanner--review']
      : styles['decisionBanner--info'];

  return (
    <div className={styles.stepContent}>
      <h1 className={styles.stepTitle}>Next Steps &amp; Decision</h1>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>01</span>
          <h2>Final Decision</h2>
        </div>
        <div className={`${styles.decisionBanner} ${bannerClass}`}>
          {decision}
        </div>
        <div className={styles.rationaleBlock} style={{ marginTop: 14 }}>
          <div className={styles.rationaleBlockLabel}>Decision Rationale</div>
          <div className={styles.rationaleBlockText}>{rationale}</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>02</span>
          <h2>Next Best Actions</h2>
        </div>
        <div className={styles.nextActionsPanel}>
          <div className={styles.nextActionsTitle}>
            <span>✦</span> Stella's Recommended Actions
          </div>
          {actions.length === 0
            ? <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>No actions recommended at this time.</div>
            : actions.map((action, i) => {
                const done = completedActions.has(i);
                return (
                  <div key={i} className={styles.nextActionItem}>
                    <div className={`${styles.nextActionCheck} ${done ? styles['nextActionCheck--done'] : ''}`}
                      style={done ? { background: 'rgba(22,163,74,0.4)', borderColor: '#16a34a' } : {}}
                    />
                    <button
                      className={styles.nextActionBtn}
                      onClick={() => !done && handleAction(action, i)}
                      style={done ? { opacity: 0.5, cursor: 'default', textDecoration: 'line-through' } : {}}
                      disabled={done}
                    >
                      {action} {!done && '→'}
                    </button>
                  </div>
                );
              })}
        </div>
      </div>

      {modal && (
        <ServiceProviderModal
          type={modal.type === 'structural-inspector' ? 'inspector' : modal.type}
          zip={zip}
          title={modal.title}
          onClose={() => setModal(null)}
          onSelect={sp => {
            markDone(modal.index);
            setModal(null);
          }}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={() => markDone(confirmModal.index)}
          onClose={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
