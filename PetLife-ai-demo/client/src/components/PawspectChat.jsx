import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_LABELS = {
  '/underwriting':  'Underwriting Workbench',
  '/claims':        'Claims Adjudicator Workbench',
  '/quote':         'Quote',
  '/fnol':          'FNOL Intake',
  '/fraud':         'Fraud & Breed',
  '/coding':        'Medical Coding',
  '/billing':       'Billing',
  '/policies':      'Policies',
  '/clinic':        'Clinic Portal',
  '/hotel-portal':  'Hotel Portal',
};

const STARTER_QUESTIONS = {
  '/underwriting': [
    'Explain the risk score for this application',
    'Why was this case referred vs STP?',
    'What breed-specific exclusions apply?',
    'Summarize the AI pipeline results',
  ],
  '/claims': [
    'What does the fraud score mean for this claim?',
    'Explain the AI Behavioural Checks',
    'Does this claim qualify for STP?',
    'What is subrogation and does it apply here?',
    'Explain the reserve calculation',
  ],
  '/fraud': [
    'Explain the AI Behavioural Checks',
    'What does the fraud risk level mean?',
    'When is a claim routed to the SIU?',
    'What is Invoice Tampering detection?',
  ],
  '/fnol':  [
    'What happens after I submit an FNOL?',
    'Explain the triage rules',
    'What documents do I need?',
  ],
  '/quote': [
    'What affects the premium calculation?',
    'Explain breed risk loading',
    'What coverage types are available?',
  ],
  '/clinic': [
    'How does eligibility verification work?',
    'What is a pre-authorization token?',
    'How is the carrier payout calculated at settlement?',
    'When is a claim referred vs approved at pre-auth?',
  ],
  '/hotel-portal': [
    'What does the health pass clearance status mean?',
    'How does stay protection coverage work?',
    'What is covered under an incident response pre-auth?',
    'How does the loyalty deductible credit program work?',
  ],
};

function buildPageContext(pathname) {
  const uwQueue = JSON.parse(localStorage.getItem('uwQueue') || '[]');
  const claimsQueue = JSON.parse(localStorage.getItem('claimsQueue') || '[]');

  if (pathname.startsWith('/underwriting')) {
    const cases = uwQueue.slice(0, 3);
    return {
      page: 'Underwriting Workbench',
      data: cases.length ? `Current UW queue (${cases.length} cases): ${JSON.stringify(cases.map(c => ({ id: c.id, pet: c.petName, breed: c.breed, status: c.status, decision: c.agentResults?.final_decision?.decision })))}` : 'No cases in UW queue.',
    };
  }
  if (pathname.startsWith('/claims')) {
    const claims = claimsQueue.slice(0, 3);
    const claimsData = claims.length ? `Recent FNOL claims (${claims.length}): ${JSON.stringify(claims.map(c => ({ id: c.claim_id, pet: c.pet, condition: c.condition, billed: c.billed, status: c.status })))}` : 'No FNOL claims in queue.';
    return {
      page: 'Claims Adjudicator Workbench',
      data: `${claimsData}\n\nAI Behavioural Checks (Tier 2 fraud): Three Gemini-powered pattern checks — (1) Invoice Tampering [CRITICAL]: detects digitally altered invoices, triggers SIU referral + payment freeze; (2) Unusual Vet-Owner Pattern [HIGH]: flags anomalous vet-policyholder relationships, triggers payment block + adjudicator warning; (3) Rapid High-Value Submission [MEDIUM]: detects suspicious high-value claims shortly after policy inception, flagged for medical audit. Fraud score <50 = STP eligible, 50-79 = manual review, ≥80 = SIU referral.`,
    };
  }
  if (pathname.startsWith('/clinic')) {
    return {
      page: 'Clinic Portal',
      data: 'The Clinic Portal integrates with the EIS (Enterprise Insurance System) to provide real-time services to in-network vet clinics: (1) Eligibility verification — look up active policy by petId, microchip, policy number, or phone; returns coverage limits, deductible remaining, co-insurance %, and waiting period status. (2) Pre-authorization — submit diagnosis code + procedure line items to get a guaranteed payout ceiling and pre-auth token (valid 30 days). Outcomes: APPROVED, REFERRED (waiting period or fraud review), DECLINED (inactive policy). (3) Settlement — submit the final invoice with a pre-auth token; the server runs triage rules and either direct-settles to the clinic bank account or holds in escrow if the bank account is unmapped.',
    };
  }
  if (pathname.startsWith('/hotel-portal')) {
    return {
      page: 'Hotel Portal',
      data: 'The Hotel Portal connects pet boarding facilities with the PetLife insurance network: (1) Health Pass — real-time check-in clearance showing vaccination compliance (GREEN/AMBER/RED) plus active insurance status. (2) Stay Protection — micro-policy binder for a specific stay ($3.50/day, up to $2,500 emergency vet cap); quote then bind with check-in/check-out dates. (3) Incident Response — staff can file an incident report (ILLNESS/INJURY/EMERGENCY); if an active policy or stay binder exists, the system issues an emergency pre-auth up to $500 and dispatches the nearest in-network vet. (4) Loyalty Dashboard — tracks deductible credits and boarding discounts earned through the PetLife loyalty program.',
    };
  }
  return { page: PAGE_LABELS[pathname] || 'PetLife AI Platform', data: null };
}

export default function PawspectChat({ open, onClose }) {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const starters = STARTER_QUESTIONS[location.pathname] || STARTER_QUESTIONS['/underwriting'];
  const pageCtx  = buildPageContext(location.pathname);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        text: `Hi! I'm **Pawspect**, your AI assistant for the **${pageCtx.page}**.\n\nI can answer questions about underwriting decisions, claim processing, fraud analysis, compliance rules, and pet insurance generally. How can I help?`,
      }]);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setInput('');
    const userMsg = { role: 'user', text: question };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.text }));

    try {
      const resp = await fetch('/api/pawspect/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, pageContext: pageCtx, history }),
      });
      const data = await resp.json();
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer || 'Sorry, I could not generate a response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'I could not reach the AI backend right now. Please try again.', error: true }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // Simple markdown-ish rendering: **bold**, bullet lists
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, (_, t) => `<strong>${t}</strong>`);
      const bullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
      return (
        <div key={i} style={{ marginBottom: bullet ? 2 : 4, paddingLeft: bullet ? 12 : 0, position: 'relative' }}>
          {bullet && <span style={{ position: 'absolute', left: 0, color: '#7c3aed' }}>•</span>}
          <span dangerouslySetInnerHTML={{ __html: bold }} />
        </div>
      );
    });
  };

  return (
    <>
      {/* Overlay */}
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 999, backdropFilter: 'blur(2px)' }} />}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'white', zIndex: 1000, boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.25s ease',
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #1a2148 100%)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐾</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 15 }}>Ask Pawspect</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>{pageCtx.page}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Context badge */}
        <div style={{ background: '#ede9fe', borderBottom: '1px solid #ddd6fe', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: '#7c3aed', fontWeight: 700, textTransform: 'uppercase' }}>Context:</span>
          <span style={{ fontSize: 11, color: '#6d28d9' }}>{pageCtx.page}</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#a78bfa', background: '#7c3aed18', padding: '1px 6px', borderRadius: 10 }}>RAG · Gemini</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 14, display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: msg.role === 'user' ? '#e5e7eb' : 'linear-gradient(135deg, #7c3aed, #1a2148)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                {msg.role === 'user' ? '👤' : '🐾'}
              </div>
              <div style={{
                maxWidth: '82%', padding: '10px 13px', borderRadius: 12,
                background: msg.role === 'user' ? '#f3f4f6' : msg.error ? '#fef2f2' : '#fafafa',
                border: `1px solid ${msg.role === 'user' ? '#e5e7eb' : msg.error ? '#fca5a5' : '#e5e7eb'}`,
                fontSize: 13, lineHeight: 1.55, color: '#1a1d2e',
                borderTopRightRadius: msg.role === 'user' ? 4 : 12,
                borderTopLeftRadius: msg.role === 'user' ? 12 : 4,
              }}>
                {renderText(msg.text)}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #1a2148)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🐾</div>
              <div style={{ padding: '10px 14px', borderRadius: '12px 12px 12px 4px', background: '#fafafa', border: '1px solid #e5e7eb', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Starters */}
        {messages.length <= 1 && !loading && (
          <div style={{ padding: '0 14px 10px', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Suggested questions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {starters.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{ textAlign: 'left', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#374151', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.target.style.background = '#ede9fe'}
                  onMouseLeave={e => e.target.style.background = '#f8fafc'}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '10px 14px 14px', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about this claim, risk, or policy..."
              rows={2}
              style={{ flex: 1, border: '2px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.4, transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{ width: 38, height: 38, borderRadius: 10, background: input.trim() && !loading ? 'linear-gradient(135deg, #7c3aed, #1a2148)' : '#e5e7eb', border: 'none', color: input.trim() && !loading ? 'white' : '#9ca3af', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', fontSize: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ↑
            </button>
          </div>
          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 5, textAlign: 'center' }}>Shift+Enter for new line · Enter to send</div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}
