import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Send, MessageCircle, Cpu } from 'lucide-react';

const PAGE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/employers': 'Employer Directory',
  '/employees': 'Employee Directory',
  '/products': 'Product Catalog',
  '/requirements': 'AI Requirements Studio',
  '/plans': 'Plan Configuration',
};

const STARTER_QUESTIONS: Record<string, string[]> = {
  '/dashboard': [
    'What does the enrollment rate mean?',
    'Explain eligibility exceptions',
    'What is the carrier success rate?',
    'How does payroll deduction work?',
  ],
  '/': [
    'What does the enrollment rate mean?',
    'Explain eligibility exceptions',
    'What is the carrier success rate?',
    'How does payroll deduction work?',
  ],
  '/employers': [
    'What does the employer status mean?',
    'What is payroll frequency?',
    'How is active employee count calculated?',
    'What does each industry classification mean?',
  ],
  '/employers/detail': [
    'What is a plan year?',
    'What does DRAFT plan year mean?',
    'Explain open enrollment',
    'How is the renewal date determined?',
  ],
  '/employees': [
    'What does eligibility status mean?',
    'What is enrollment status?',
    'Why would an employee be partially eligible?',
    'What is the Employee 360 view?',
  ],
  '/employees/detail': [
    'Why is this employee only partially eligible?',
    'What benefits is this employee enrolled in?',
    'What is a dependent?',
    'How do I update dependent information?',
  ],
  '/products': [
    'What products are available to employees?',
    'What is the difference between HSA and FSA?',
    'What is an STD/LTD product?',
    'How do I compare plan options?',
  ],
  '/requirements': [
    'What is a requirements document lifecycle?',
    'What does AI generation produce?',
    'How are conflicts detected?',
    'What is a business rule vs a user story?',
  ],
  '/plans': [
    'What does a PUBLISHED plan year mean?',
    'What is a waiting period?',
    'What is the difference between PPO and HDHP?',
    'What are eligibility rules?',
  ],
};

function getPageLabel(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/employers/') && pathname.length > '/employers/'.length) return 'Employer Detail';
  if (pathname.startsWith('/employees/') && pathname.length > '/employees/'.length) return 'Employee 360';
  if (pathname.startsWith('/requirements')) return 'AI Requirements Studio';
  if (pathname.startsWith('/plans')) return 'Plan Configuration';
  for (const [key, label] of Object.entries(PAGE_LABELS)) {
    if (pathname === key) return label;
  }
  return 'Group Benefits Platform';
}

function getStarters(pathname: string): string[] {
  if (pathname.startsWith('/employers/') && pathname.length > '/employers/'.length) {
    return STARTER_QUESTIONS['/employers/detail'];
  }
  if (pathname.startsWith('/employees/') && pathname.length > '/employees/'.length) {
    return STARTER_QUESTIONS['/employees/detail'];
  }
  if (pathname.startsWith('/requirements')) {
    return STARTER_QUESTIONS['/requirements'];
  }
  if (pathname.startsWith('/plans')) {
    return STARTER_QUESTIONS['/plans'];
  }
  return STARTER_QUESTIONS[pathname] ?? STARTER_QUESTIONS['/dashboard'];
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  error?: boolean;
}

interface BenChatProps {
  open: boolean;
  onClose: () => void;
}

function renderText(text: string) {
  return text.split('\n').map((line, i) => {
    const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
    const html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return (
      <div key={i} className={`${isBullet ? 'pl-3 relative' : ''} mb-0.5 leading-relaxed`}>
        {isBullet && <span className="absolute left-0 text-brand-500">•</span>}
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  });
}

export default function BenChat({ open, onClose }: BenChatProps) {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const pageLabel = getPageLabel(location.pathname);
  const starters = getStarters(location.pathname);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        text: `Hi! I'm **BenChat**, your assistant for the **${pageLabel}**.\n\nI can explain enrollment metrics, eligibility rules, plan year statuses, carrier submissions, and payroll deductions. How can I help?`,
      }]);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const sendMessage = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setLoading(true);

    try {
      const resp = await fetch('/api/benchat/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          pageContext: { page: pageLabel, route: location.pathname },
        }),
      });
      const data = await resp.json();
      const answer = data?.data?.answer ?? 'Sorry, I could not generate a response.';
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Could not reach the server. Please try again.', error: true }]);
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[420px] max-w-full bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="BenChat assistant"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-900 px-5 py-4 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-sm">Ask BenChat</div>
            <div className="text-white/60 text-xs truncate">{pageLabel}</div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            aria-label="Close BenChat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Context badge */}
        <div className="bg-brand-50 border-b border-brand-100 px-4 py-1.5 flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Context:</span>
          <span className="text-xs text-brand-700">{pageLabel}</span>
          <span className="ml-auto text-[10px] text-brand-400 bg-brand-100 px-2 py-0.5 rounded-full">Phase 0 · Static KB</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'}`}>
                {msg.role === 'user' ? 'U' : 'B'}
              </div>
              <div className={`max-w-[82%] px-3 py-2.5 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-gray-100 text-gray-800 rounded-tr-sm' : msg.error ? 'bg-red-50 border border-red-200 text-red-700 rounded-tl-sm' : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-sm'}`}>
                {renderText(msg.text)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2 items-start">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs flex-shrink-0">B</div>
              <div className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl rounded-tl-sm shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && !loading && (
          <div className="px-4 pb-3 flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Suggested questions</p>
            <div className="flex flex-col gap-1.5">
              {starters.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-200 rounded-lg px-3 py-2 text-xs text-gray-700 hover:text-brand-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-100 p-3 flex-shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about benefits, enrollment, or plan years..."
              rows={2}
              className="flex-1 border-2 border-gray-200 focus:border-brand-400 rounded-xl px-3 py-2 text-sm resize-none outline-none font-sans leading-snug transition-colors"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${input.trim() && !loading ? 'bg-brand-600 hover:bg-brand-700 text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 text-center">Shift+Enter for new line · Enter to send</p>
        </div>
      </div>
    </>
  );
}
