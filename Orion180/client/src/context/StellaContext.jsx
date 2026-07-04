import { createContext, useContext, useState, useCallback } from 'react';

const StellaContext = createContext(null);

export function StellaProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState({ page: 'dashboard', claimId: null, step: null });
  const [messages, setMessages] = useState([
    { id: 0, role: 'stella', text: 'Hi, I\'m Stella! I can look up claim details, explain fraud risk, and recommend next actions. What can I help you with?' }
  ]);

  const open  = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(v => !v), []);

  const updateContext = useCallback((ctx) => {
    setContext(prev => ({ ...prev, ...ctx }));
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { id: Date.now(), ...msg }]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([{ id: 0, role: 'stella', text: 'Hi, I\'m Stella! I can look up claim details, explain fraud risk, and recommend next actions. What can I help you with?' }]);
  }, []);

  return (
    <StellaContext.Provider value={{ isOpen, open, close, toggle, context, updateContext, messages, addMessage, clearMessages }}>
      {children}
    </StellaContext.Provider>
  );
}

export function useStella() {
  const ctx = useContext(StellaContext);
  if (!ctx) throw new Error('useStella must be used inside StellaProvider');
  return ctx;
}
