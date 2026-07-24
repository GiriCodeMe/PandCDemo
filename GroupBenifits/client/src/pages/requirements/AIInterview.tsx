import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

function authHeader() {
  return { Authorization: `Bearer ${sessionStorage.getItem('persona_token') ?? 'P-001'}` };
}

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  suggestions?: string[];
  generatedReq?: GeneratedReq;
  ts: number;
}

interface GeneratedReq {
  id: string;
  title: string;
  type: string;
  priority: string;
}

const INTERVIEW_SCRIPT: { question: string; followUp: (answer: string) => string; suggestions: string[]; genReq?: GeneratedReq }[] = [
  {
    question: "Hi! I'm the AI Requirements Analyst. I'll guide you through a structured interview to extract requirements for your benefits plan.\n\nLet's start: What is the primary benefit you want to configure for the upcoming plan year?",
    followUp: (a) => `Got it — **${a}**. Great choice. What employee class should be eligible for this benefit?`,
    suggestions: ['Medical / Health Insurance', 'Dental & Vision', 'Life & Disability', 'HSA / FSA'],
  },
  {
    question: '',
    followUp: (a) => `**${a}** — noted. What waiting period applies before new hires become eligible?`,
    suggestions: ['Full-Time Employees (30+ hrs/week)', 'All Employees', 'Management Only', 'Full-Time + Part-Time'],
    genReq: { id: 'INT-001', title: 'Define eligible employee class', type: 'Functional', priority: 'HIGH' },
  },
  {
    question: '',
    followUp: (a) => `Waiting period: **${a}**. Does coverage begin on the first of the month following the waiting period, or exactly on day 1 after the period?`,
    suggestions: ['30 days', '60 days', '90 days', 'No waiting period (immediate)'],
    genReq: { id: 'INT-002', title: 'Configure eligibility waiting period', type: 'Functional', priority: 'HIGH' },
  },
  {
    question: '',
    followUp: (a) => `Coverage start rule: **${a}**. Will the employer contribute to premiums? If so, what percentage for employee-only coverage?`,
    suggestions: ['1st of month following waiting period', 'Exact date after waiting period ends', 'First of month of hire date'],
    genReq: { id: 'INT-003', title: 'Define coverage effective date calculation rule', type: 'Business Rule', priority: 'HIGH' },
  },
  {
    question: '',
    followUp: (a) => `Employer contribution: **${a}**. Should dependent coverage be offered? If yes, who pays for the dependent premium?`,
    suggestions: ['80% employer / 20% employee', '100% employer paid', '50% employer / 50% employee', 'Employee pays 100%'],
    genReq: { id: 'INT-004', title: 'Configure employer premium contribution percentage', type: 'Functional', priority: 'HIGH' },
  },
  {
    question: '',
    followUp: (a) => `Dependent coverage answer: **${a}**. Last question: what is the annual open enrollment window for this benefit?`,
    suggestions: ['Yes — employee pays 100% of dependent cost', 'Yes — employer contributes to dependent cost', 'No dependent coverage offered'],
    genReq: { id: 'INT-005', title: 'Define dependent eligibility and premium responsibility', type: 'Functional', priority: 'MEDIUM' },
  },
  {
    question: '',
    followUp: (_a) => `Thank you — I now have enough to generate a structured requirements set. Click **Generate Requirements** below to create your backlog items.`,
    suggestions: ['October 1 – 31 (annual)', 'November 1 – 30 (annual)', 'Continuous / Qualifying Life Events Only'],
    genReq: { id: 'INT-006', title: 'Configure open enrollment window and special enrollment rules', type: 'Functional', priority: 'MEDIUM' },
  },
];

const PRIORITY_VARIANT: Record<string, 'error' | 'warning' | 'default'> = {
  HIGH: 'error',
  MEDIUM: 'warning',
  LOW: 'default',
};

const TYPE_COLORS: Record<string, string> = {
  'Functional': 'bg-brand-50 text-brand-700',
  'Business Rule': 'bg-violet-50 text-violet-700',
  'Non-Functional': 'bg-gray-100 text-gray-600',
};

let msgCounter = 0;

function mkId() {
  return `m-${++msgCounter}-${Date.now()}`;
}

export default function AIInterview() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: mkId(),
      role: 'assistant',
      text: INTERVIEW_SCRIPT[0]!.question,
      suggestions: INTERVIEW_SCRIPT[0]!.suggestions,
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatedReqs, setGeneratedReqs] = useState<GeneratedReq[]>([]);
  const [fullReqs, setFullReqs] = useState<{ requirementId: string; title: string; type: string; priority: string; status: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  function sendMessage(text: string) {
    if (!text.trim() || typing || step >= INTERVIEW_SCRIPT.length) return;
    const userMsg: Message = { id: mkId(), role: 'user', text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const script = INTERVIEW_SCRIPT[step];
    if (script?.genReq) {
      setGeneratedReqs((prev) => [...prev, script.genReq!]);
    }

    const nextStep = step + 1;
    const nextScript = INTERVIEW_SCRIPT[nextStep];

    setTimeout(() => {
      const reply = script?.followUp(text) ?? 'Thank you for that response.';
      const assistantMsg: Message = {
        id: mkId(),
        role: 'assistant',
        text: reply,
        suggestions: nextScript?.suggestions,
        generatedReq: script?.genReq,
        ts: Date.now(),
      };
      if (nextStep < INTERVIEW_SCRIPT.length && nextScript?.genReq) {
        setGeneratedReqs((prev) => {
          if (prev.find((r) => r.id === nextScript.genReq!.id)) return prev;
          return prev;
        });
      }
      setMessages((prev) => [...prev, assistantMsg]);
      setStep(nextStep);
      setTyping(false);
    }, 900 + Math.random() * 400);
  }

  async function generateRequirements() {
    setTyping(true);
    try {
      const res = await fetch('/api/requirements/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ documentId: 'AI-INTERVIEW-001' }),
      });
      const json = await res.json();
      const reqs = json.data?.requirements ?? [];
      setFullReqs(reqs.slice(0, 10));
      setGenerated(true);
      setMessages((prev) => [
        ...prev,
        {
          id: mkId(),
          role: 'assistant',
          text: `Requirements generated! I created **${reqs.length} requirements**, **${json.data?.userStoriesCount ?? 0} user stories**, and **${json.data?.businessRulesCount ?? 0} business rules** from your interview responses. Review the panel on the right to accept or refine them.`,
          ts: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [...prev, { id: mkId(), role: 'assistant', text: 'Unable to reach the server. Check the server is running on port 3001.', ts: Date.now() }]);
    }
    setTyping(false);
  }

  const interviewComplete = step >= INTERVIEW_SCRIPT.length;

  return (
    <div className="grid grid-cols-5 gap-5 h-[600px]" data-testid="ai-interview">
      {/* Chat pane */}
      <div className="col-span-3 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-brand-50 to-violet-50">
          <Bot className="w-4 h-4 text-brand-500" />
          <p className="text-sm font-semibold text-gray-800">AI Requirements Analyst</p>
          <span className="ml-auto text-[10px] text-gray-400">Step {Math.min(step + 1, INTERVIEW_SCRIPT.length)} / {INTERVIEW_SCRIPT.length}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-gradient-to-r from-brand-400 to-violet-500 transition-all duration-500"
            style={{ width: `${(Math.min(step, INTERVIEW_SCRIPT.length) / INTERVIEW_SCRIPT.length) * 100}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'assistant' ? 'bg-brand-100' : 'bg-gray-200'}`}>
                {m.role === 'assistant' ? <Bot className="w-3.5 h-3.5 text-brand-600" /> : <User className="w-3.5 h-3.5 text-gray-600" />}
              </div>
              <div className={`max-w-[80%] ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${m.role === 'assistant' ? 'bg-gray-50 text-gray-800 rounded-tl-none' : 'bg-brand-500 text-white rounded-tr-none'}`}>
                  {m.text.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </div>
                {m.generatedReq && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Captured: {m.generatedReq.title}
                  </div>
                )}
                {m.suggestions && !interviewComplete && messages[messages.length - 1]?.id === m.id && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="px-2 py-1 text-[11px] font-medium bg-white border border-gray-200 rounded-full hover:border-brand-400 hover:text-brand-700 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-brand-600" />
              </div>
              <div className="px-3 py-2 bg-gray-50 rounded-xl rounded-tl-none">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100">
          {interviewComplete ? (
            <button
              onClick={generateRequirements}
              disabled={generated || typing}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {generated ? 'Requirements Generated' : 'Generate Requirements'}
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                placeholder="Type your answer or click a suggestion..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-300"
                disabled={typing}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || typing}
                className="px-3 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Requirements panel */}
      <div className="col-span-2 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <p className="text-sm font-semibold text-gray-800">Generated Requirements</p>
          <span className="ml-auto text-xs text-gray-400">{(generated ? fullReqs.length : generatedReqs.length)}</span>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {!generated && generatedReqs.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Clock className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-xs text-gray-400 text-center px-4">Requirements appear here as the interview progresses</p>
            </div>
          )}
          {!generated && generatedReqs.map((r) => (
            <div key={r.id} className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-mono text-gray-400">{r.id}</span>
                <Badge variant={PRIORITY_VARIANT[r.priority] ?? 'default'} className="text-[10px]">{r.priority}</Badge>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ml-auto ${TYPE_COLORS[r.type] ?? 'bg-gray-100 text-gray-600'}`}>{r.type}</span>
              </div>
              <p className="text-xs font-medium text-gray-800">{r.title}</p>
            </div>
          ))}
          {generated && fullReqs.map((r) => (
            <div key={r.requirementId} className="p-3">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="text-[10px] font-mono text-gray-400">{r.requirementId}</span>
                <Badge variant={PRIORITY_VARIANT[r.priority] ?? 'default'} className="text-[10px]">{r.priority}</Badge>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ml-auto ${TYPE_COLORS[r.type] ?? 'bg-gray-100 text-gray-600'}`}>{r.type}</span>
              </div>
              <p className="text-xs font-medium text-gray-800">{r.title}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <button className="text-[10px] text-emerald-600 font-medium hover:text-emerald-700">Accept</button>
                <button className="text-[10px] text-gray-400 hover:text-gray-600">Flag</button>
                <button className="text-[10px] text-gray-400 hover:text-gray-600">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
