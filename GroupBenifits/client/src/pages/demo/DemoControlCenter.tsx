import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Monitor, CheckCircle2, XCircle, RefreshCw, Zap, Users, ArrowRight, Database, Cpu, Play } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { usePersonaStore } from '../../stores/personaStore';

function authHeader() {
  return { Authorization: `Bearer ${sessionStorage.getItem('persona_token') ?? 'P-001'}` };
}

async function checkHealth() {
  const start = performance.now();
  const res = await fetch('/api/auth/personas', { headers: authHeader() });
  const elapsed = Math.round(performance.now() - start);
  const json = await res.json();
  const personas: Record<string, unknown>[] = Array.isArray(json.data) ? json.data : [];
  return { ok: res.ok, personaCount: personas.length, responseMs: elapsed };
}

async function checkSeedData() {
  const [reqRes, docRes, empRes] = await Promise.all([
    fetch('/api/requirements', { headers: authHeader() }).then((r) => r.json()),
    fetch('/api/documents?employerId=ACM-001', { headers: authHeader() }).then((r) => r.json()),
    fetch('/api/employees', { headers: authHeader() }).then((r) => r.json()),
  ]);
  return {
    requirements: Array.isArray(reqRes.data) ? reqRes.data.length : 0,
    documents: Array.isArray(docRes.data) ? docRes.data.length : 0,
    employees: Array.isArray(empRes.data) ? empRes.data.length : 0,
  };
}

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  persona: string;
  route: string;
  steps: string[];
  highlight: string;
}

const SCENARIOS: DemoScenario[] = [
  {
    id: 'linda-error',
    title: 'Linda White — Carrier Rejection',
    description: 'Trace an enrollment failure from HR exception queue → carrier transaction → compliance audit.',
    persona: 'P-002 (Sarah Chen, HR Admin)',
    route: '/enrollment',
    steps: [
      'Switch to HR Admin (P-002) — see ACM-E012 in Eligibility Exceptions',
      'Switch to Carrier Admin (P-006) — see CT-10045 failed transaction',
      'Switch to Compliance Analyst (P-005) — see ACM-E012 blocked in audit trail',
      'Switch to Benefits Admin (P-001) — see enrollment rate stuck at 97.8%',
    ],
    highlight: 'One enrollment failure — four roles see it differently',
  },
  {
    id: 'ai-requirements',
    title: 'AI Requirements Studio Demo',
    description: 'Upload a document → AI extracts rules → detect conflicts → trace to plans.',
    persona: 'P-001 (Linda Hayes, Benefits Admin)',
    route: '/requirements',
    steps: [
      'Open Document Library — click a document to open 3-panel review',
      'Review PDF preview + extracted clauses + AI findings',
      'Switch to AI Interview tab — walk through guided conversation',
      'Switch to Conflict Detection — show 5 detected conflicts',
      'Switch to Traceability — click "Highlight: Linda White path"',
    ],
    highlight: 'Entire requirements lifecycle — no manual copying',
  },
  {
    id: 'plan-comparison',
    title: 'Employee Plan Selection',
    description: 'Show the employee experience: compare plans and understand waiting period.',
    persona: 'P-004 (Rachel Kim, Employee)',
    route: '/plans',
    steps: [
      'Open Plans → Plan Comparison tab',
      'Select Medical Gold + Medical Silver + Medical HDHP',
      'Toggle "Differences Only" to highlight deductible gap',
      'Open Plans → Impact Analysis — select "Lower Medical Deductible"',
      'Switch to Enrollment → Employee view — see Rachel\'s waiting period banner',
    ],
    highlight: 'Empowers employees to make informed benefit decisions',
  },
  {
    id: 'eligibility-rules',
    title: 'Eligibility Rule Builder',
    description: 'Build a new eligibility rule visually and simulate it against employees.',
    persona: 'P-001 (Linda Hayes, Benefits Admin)',
    route: '/plans',
    steps: [
      'Open Plans → Rule Builder tab',
      'Set IF Employment Type = Full-Time AND Hours ≥ 30',
      'Set Waiting Period: First of month following 30 days',
      'Switch to Eligibility Simulator',
      'Select ACM-E012 (Linda White) — show blocked result',
    ],
    highlight: 'Visual rule creation with instant eligibility simulation',
  },
];

const DEMO_TIPS = [
  { tip: 'BenChat is available on every page — click the blue circle to ask about the current context', key: 'benchat' },
  { tip: 'Press Ctrl+K anywhere to open global search — supports employees, plans, and requirements', key: 'search' },
  { tip: 'Switch personas from the top-right dropdown — the UI fully adapts to each role', key: 'persona' },
  { tip: 'Every table has "active" / "error" state seeded — no need to create dummy data', key: 'seed' },
  { tip: 'The traceability graph "Linda White path" button traces her error across all 7 layers', key: 'trace' },
];

export default function DemoControlCenter() {
  const { currentPersona } = usePersonaStore();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);

  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useQuery({
    queryKey: ['demo-health'],
    queryFn: checkHealth,
    staleTime: 30_000,
  });

  const { data: seed, isLoading: seedLoading, refetch: refetchSeed } = useQuery({
    queryKey: ['demo-seed'],
    queryFn: checkSeedData,
    staleTime: 30_000,
  });

  function handleReset() {
    sessionStorage.clear();
    setActiveScenario(null);
    setResetDone(true);
    setTimeout(() => { window.location.href = '/'; }, 1500);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto" data-testid="demo-control-center">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
          <Monitor className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Demo Control Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">System health, scenario presets, and presenter guidance.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">Active persona:</span>
          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-1 rounded-full">
            {currentPersona ? `${currentPersona.name} (${currentPersona.personaId})` : 'Not selected'}
          </span>
        </div>
      </div>

      {/* System health */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">API Server</span>
            <button onClick={() => { refetchHealth(); refetchSeed(); }} className="ml-auto p-1 hover:bg-gray-100 rounded transition-colors">
              <RefreshCw className="w-3 h-3 text-gray-400" />
            </button>
          </div>
          {healthLoading ? (
            <div className="h-6 bg-gray-100 rounded animate-pulse" />
          ) : health?.ok ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-bold text-emerald-700">Online</p>
                <p className="text-[10px] text-gray-400">{health.responseMs}ms · {health.personaCount} personas</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm font-bold text-red-600">Server offline — start with: npm run dev</p>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Seed Data</span>
          </div>
          {seedLoading ? (
            <div className="h-6 bg-gray-100 rounded animate-pulse" />
          ) : (
            <div className="space-y-0.5">
              {[
                { label: 'Requirements', value: seed?.requirements },
                { label: 'Documents', value: seed?.documents },
                { label: 'Employees', value: seed?.employees },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-500">{label}</span>
                  <span className={`font-bold ${value && value > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{value ?? 0}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Session</span>
          </div>
          <div className="space-y-1.5">
            <button
              onClick={handleReset}
              disabled={resetDone}
              className="w-full py-1.5 px-3 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              {resetDone ? 'Resetting...' : 'Reset Session & Go to Dashboard'}
            </button>
            <p className="text-[10px] text-gray-400 text-center">Clears session storage and reloads</p>
          </div>
        </Card>
      </div>

      {/* Demo scenarios */}
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Demo Scenarios</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {SCENARIOS.map((s) => {
          const active = activeScenario === s.id;
          return (
            <div
              key={s.id}
              className={`border-2 rounded-xl overflow-hidden transition-all ${active ? 'border-brand-400 bg-brand-50/40' : 'border-gray-200 bg-white'}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-gray-900">{s.title}</p>
                  <button
                    onClick={() => setActiveScenario(active ? null : s.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${active ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Play className="w-3 h-3" />
                    {active ? 'Active' : 'Select'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-2">{s.description}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-brand-600 font-medium mb-2">
                  <Zap className="w-3 h-3" />
                  {s.highlight}
                </div>
                <p className="text-[10px] text-gray-400">Start as: <span className="font-semibold text-gray-600">{s.persona}</span></p>
              </div>

              {active && (
                <div className="border-t border-brand-100 bg-brand-50 px-4 py-3">
                  <p className="text-[10px] font-bold text-brand-700 uppercase tracking-wide mb-2">Demo Steps</p>
                  <ol className="space-y-1.5">
                    {s.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                        <span className="w-4 h-4 rounded-full bg-brand-200 text-brand-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <a
                    href={s.route}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Go to starting page <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Demo tips */}
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Presenter Tips</h2>
      <div className="space-y-2">
        {DEMO_TIPS.map(({ tip, key }) => (
          <div key={key} className="flex items-start gap-2.5 text-sm text-gray-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}
