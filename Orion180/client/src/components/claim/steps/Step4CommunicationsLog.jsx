import { useState } from 'react';
import styles from './Steps.module.css';

const TEMPLATES = [
  {
    name: 'Request Documentation',
    tags: [{ label: 'SAFE', type: 'safe' }],
    text: 'We require additional documentation regarding the damaged property for the claim.',
    sentiment: 'Neutral',
    url: '/sample-docs/template-request-docs.html'
  },
  {
    name: 'Claim Approved',
    tags: [{ label: 'PORTAL', type: 'portal' }, { label: 'EMAIL', type: 'email' }],
    text: 'Good news! Your claim has been reviewed and approved for settlement.',
    sentiment: 'Positive',
    url: '/sample-docs/template-claim-approved.html'
  },
  {
    name: 'Additional Info Needed',
    tags: [{ label: 'EMAIL', type: 'email' }],
    text: 'We need additional information to complete the review of your claim. Please submit the requested documents at your earliest convenience.',
    sentiment: 'Neutral',
    url: '/sample-docs/template-additional-info.html'
  }
];

function typeIcon(type) {
  if (type === 'call') return '📞';
  if (type === 'sms')  return '💬';
  if (type === 'email') return '✉';
  return '🖥';
}

function ComposeModal({ claim, onClose, onSend }) {
  const [channel, setChannel] = useState('email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  function handleSend() {
    if (!body.trim()) return;
    setSending(true);
    setTimeout(() => {
      onSend({ channel, subject, body });
      onClose();
    }, 600);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: 12, padding: 28, maxWidth: 540, width: '100%',
        boxShadow: '0 20px 50px rgba(0,0,0,0.18)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1d2e' }}>New Message</div>
          <button
            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}
            onClick={onClose}
          >✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: 5 }}>To</div>
            <div style={{ padding: '9px 12px', background: '#f4f6f9', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: 13, color: '#374151' }}>
              {claim?.insuredName} &lt;{claim?.contact?.email}&gt;
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: 5 }}>Channel</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['email', 'sms', 'portal', 'call'].map(ch => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
                    background: channel === ch ? '#0a0f2c' : '#fff',
                    color: channel === ch ? '#fff' : '#374151',
                    borderColor: channel === ch ? '#0a0f2c' : '#d1d5db'
                  }}
                >
                  {typeIcon(ch)} {ch.charAt(0).toUpperCase() + ch.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {channel === 'email' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: 5 }}>Subject</div>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder={`Re: Claim #${claim?.id} — ${claim?.causeOfLoss}`}
                style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
          )}

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6b7280', marginBottom: 5 }}>Message</div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              placeholder="Type your message to the insured..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button
              onClick={onClose}
              style={{ padding: '9px 20px', borderRadius: 7, background: 'transparent', color: '#374151', border: '1px solid #d1d5db', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >Cancel</button>
            <button
              onClick={handleSend}
              disabled={!body.trim() || sending}
              style={{ padding: '9px 22px', borderRadius: 7, background: body.trim() ? '#e84040' : '#e5e7eb', color: body.trim() ? '#fff' : '#9ca3af', border: 'none', fontSize: 13, fontWeight: 600, cursor: body.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}
            >{sending ? 'Sending…' : 'Send Message'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Step4CommunicationsLog({ claim }) {
  if (!claim) return null;
  const [comms, setComms] = useState(claim.communications || []);
  const [showCompose, setShowCompose] = useState(false);

  function handleSend({ channel, subject, body }) {
    const newEntry = {
      id: `comm-new-${Date.now()}`,
      type: channel,
      actor: 'Jane Doe',
      agentId: 'ADJ-001',
      claimId: claim.id,
      notes: subject ? `[${subject}] ${body}` : body,
      timestamp: new Date().toISOString()
    };
    setComms(prev => [newEntry, ...prev]);
  }

  return (
    <div className={styles.stepContent}>
      <h1 className={styles.stepTitle}>Communications Log</h1>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>01</span>
          <h2>Communication Log</h2>
          <button
            className="btn btn--primary btn--sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => setShowCompose(true)}
          >+ Send a New Message</button>
        </div>

        {comms.length === 0
          ? <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>No communications logged yet.</p>
          : comms.map(c => (
              <div key={c.id} className={styles.commEntry}>
                <div className={styles.commAvatar}>{c.actor?.charAt(0) || '?'}</div>
                <div className={styles.commBody}>
                  <div className={styles.commActor}>{c.actor} {typeIcon(c.type)}</div>
                  <div className={styles.commMeta}>Claim Number: {c.claimId} · {new Date(c.timestamp).toLocaleString()}</div>
                  <div className={styles.commNotes}>{c.notes}</div>
                </div>
              </div>
            ))}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionNum}>02</span>
          <h2>AI Generated Communication Templates</h2>
        </div>

        <div className={styles.templateGrid}>
          {TEMPLATES.map(t => (
            <div key={t.name} className={styles.templateCard}>
              <div className={styles.templateType}>
                {t.tags.map(tag => (
                  <span key={tag.label} className={`${styles.templateTag} ${styles[`templateTag--${tag.type}`]}`}>
                    {tag.label}
                  </span>
                ))}
              </div>
              <div className={styles.templateName}>{t.name}</div>
              <div className={styles.templateText}>{t.text}</div>
              <div className={styles.templateFooter}>
                <button
                  className="btn btn--outline btn--sm"
                  onClick={() => window.open(t.url, '_blank')}
                >
                  Preview Template ↗
                </button>
                <span className={styles.templateSentiment}>Sentiment: {t.sentiment}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.stellaInsight} style={{ marginTop: 16 }}>
          <span className={styles.stellaInsightIcon}>✦</span>
          <p className={styles.stellaInsightText}>
            Based on past communication history, the <strong>Request Documentation</strong> template leads to
            31% faster resolution for water damage files by preemptively securing plumbing repair invoices.
          </p>
        </div>
      </div>

      {showCompose && (
        <ComposeModal
          claim={claim}
          onClose={() => setShowCompose(false)}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
