import { useState, useRef, useEffect } from 'react';
import { useStella } from '../../context/StellaContext';
import { stellaApi } from '../../services/api';
import styles from './StellaPanel.module.css';

export default function StellaPanel() {
  const { isOpen, close, context, messages, addMessage } = useStella();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(overrideText) {
    const text = (overrideText || input).trim();
    if (!text || loading) return;
    setInput('');
    addMessage({ role: 'user', text });
    setLoading(true);
    try {
      // pass the existing conversation history (exclude the greeting at id=0)
      const history = messages.filter(m => m.id !== 0);
      const res = await stellaApi.chat(text, context, history);
      addMessage({ role: 'stella', text: res.reply, suggestions: res.suggestions });
    } catch {
      addMessage({ role: 'stella', text: 'Sorry, I\'m having trouble connecting right now. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.stellaAvatar}>✦</div>
            <div>
              <div className={styles.stellaName}>Stella</div>
              <div className={styles.stellaSub}>AI Claims Assistant</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={close} aria-label="Close Stella">✕</button>
        </div>

        {context.claimId && (
          <div className={styles.contextBadge}>
            📎 Context: Claim #{context.claimId}
            {context.step ? ` · Step ${context.step}` : ''}
          </div>
        )}

        <div className={styles.messages}>
          {messages.map(msg => (
            <div key={msg.id} className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageStella}`}>
              {msg.role === 'stella' && (
                <div className={styles.stellaAvatarSmall}>✦</div>
              )}
              <div className={styles.bubble}>
                <p className={styles.text}>{msg.text}</p>
                {msg.suggestions?.length > 0 && (
                  <div className={styles.suggestions}>
                    <div className={styles.suggestionsLabel}>Next Best Actions</div>
                    {msg.suggestions.map((s, i) => (
                      <div key={i} className={styles.suggestion}>
                        <span className={styles.suggestNum}>{i + 1}</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.message} ${styles.messageStella}`}>
              <div className={styles.stellaAvatarSmall}>✦</div>
              <div className={styles.bubble}>
                <div className={styles.typing}>
                  <span/><span/><span/>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className={styles.quickPrompts}>
          {[
            'What is the fraud risk?',
            'What should I do next?',
            'Any missing documents?'
          ].map(q => (
            <button key={q} className={styles.quickBtn} onClick={() => send(q)}>
              {q}
            </button>
          ))}
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            placeholder="Ask Stella anything about this claim..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
          <button className={styles.sendBtn} onClick={send} disabled={loading || !input.trim()}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
