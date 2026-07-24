import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';

function authHeader() {
  return { Authorization: `Bearer ${sessionStorage.getItem('persona_token') ?? 'P-001'}` };
}

interface Conflict {
  conflictId: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  resolution: string;
  source?: string;
  reqA?: string;
  reqB?: string;
}

async function fetchConflicts(): Promise<Conflict[]> {
  const res = await fetch('/api/requirements/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ documentId: 'DOC-2027-0001' }),
  });
  const json = await res.json();
  const fromApi: Conflict[] = (json.data?.conflicts ?? []).map((c: Record<string, string>) => ({
    conflictId: c.conflictId,
    description: c.description,
    severity: (c.severity as 'HIGH' | 'MEDIUM' | 'LOW') ?? 'MEDIUM',
    resolution: c.resolution,
    source: 'AI Analysis',
    reqA: 'REQ-101',
    reqB: 'REQ-208',
  }));

  // Supplement with seed-data conflicts for richer demo
  const seedConflicts: Conflict[] = [
    {
      conflictId: 'CONF-003',
      description: 'Waiting period inconsistency: Eligibility Policy (p.2) states "immediately upon hire" for managers, while Benefits Guide (p.1) states 30-day waiting period for all employees.',
      severity: 'HIGH',
      resolution: 'Add employee class condition: Full-Time Standard → 30 days; Manager → Immediate. Update eligibility rule REQ-FT-001.',
      source: 'Document Cross-Check',
      reqA: 'DOC-2027-0001 §1',
      reqB: 'DOC-2027-0002 §1',
    },
    {
      conflictId: 'CONF-004',
      description: 'Premium basis ambiguity: Section 3.2 uses "monthly premium" while Section 7.4 refers to "per-paycheck contribution". Cannot derive deduction amount without payroll frequency.',
      severity: 'HIGH',
      resolution: 'Clarify payroll frequency (bi-weekly vs. semi-monthly) in plan configuration. Update payroll integration requirements.',
      source: 'Document Cross-Check',
      reqA: 'REQ-FIN-003',
      reqB: 'REQ-FIN-014',
    },
    {
      conflictId: 'CONF-005',
      description: 'Dependent age limit: Benefits Guide states "age 26" cutoff, but carrier SBC document states "through age 26" (inclusive of 26th birthday month).',
      severity: 'MEDIUM',
      resolution: 'Align language to IRS/ACA standard: coverage terminates end of month in which dependent turns 26.',
      source: 'Carrier SBC vs Policy',
      reqA: 'REQ-DEP-001',
      reqB: 'CARRIER-SBC-§4',
    },
    {
      conflictId: 'CONF-006',
      description: 'HSA contribution limit not defined for plans marketed as "HDHP-compatible." IRS 2027 limits may differ from plan document values.',
      severity: 'MEDIUM',
      resolution: 'Add IRS 2027 HSA limit reference ($4,300 individual / $8,550 family) as a system-managed constant. Flag for annual review.',
      source: 'Regulatory Gap',
      reqA: 'REQ-HSA-001',
      reqB: 'IRS-2027-Pub969',
    },
    {
      conflictId: 'CONF-007',
      description: 'Default enrollment option is undefined. Requirements do not specify whether an employee who misses open enrollment is auto-defaulted to the cheapest plan or waived.',
      severity: 'LOW',
      resolution: 'Define default enrollment policy in Section 2. Recommended: employee is treated as "waived" unless explicitly enrolling.',
      source: 'Completeness Check',
      reqA: 'REQ-OE-005',
      reqB: undefined,
    },
  ];

  return [...fromApi, ...seedConflicts];
}

const SEV_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; border: string; text: string; badge: string }> = {
  HIGH: { label: 'Critical', icon: ShieldAlert, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  MEDIUM: { label: 'Warning', icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  LOW: { label: 'Info', icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
};

type Resolution = 'accepted' | 'flagged' | 'overridden';

export default function ConflictDetection() {
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [actions, setActions] = useState<Record<string, Resolution>>({});

  const { data: conflicts = [], isLoading } = useQuery({
    queryKey: ['conflicts'],
    queryFn: fetchConflicts,
    staleTime: 300_000,
  });

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function act(id: string, action: Resolution) {
    setActions((prev) => ({ ...prev, [id]: action }));
  }

  const filtered = filter === 'ALL' ? conflicts : conflicts.filter((c) => c.severity === filter);
  const highCount = conflicts.filter((c) => c.severity === 'HIGH').length;
  const medCount = conflicts.filter((c) => c.severity === 'MEDIUM').length;
  const lowCount = conflicts.filter((c) => c.severity === 'LOW').length;
  const resolvedCount = Object.keys(actions).length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div data-testid="conflict-detection">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Conflicts', value: conflicts.length, color: 'text-gray-900' },
          { label: 'Critical', value: highCount, color: 'text-red-600' },
          { label: 'Warnings', value: medCount, color: 'text-amber-600' },
          { label: 'Resolved', value: resolvedCount, color: 'text-emerald-600' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-4">
        {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => {
          const meta = sev !== 'ALL' ? SEV_META[sev] : null;
          return (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filter === sev ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
            >
              {sev === 'ALL' ? `All (${conflicts.length})` : `${meta!.label} (${sev === 'HIGH' ? highCount : sev === 'MEDIUM' ? medCount : lowCount})`}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <Filter className="w-3 h-3" />
          {filtered.length} showing
        </div>
      </div>

      {/* Conflict list */}
      <div className="space-y-3">
        {filtered.map((c) => {
          const meta = SEV_META[c.severity] ?? SEV_META['LOW']!;
          const Icon = meta.icon;
          const isOpen = expanded.has(c.conflictId);
          const resolution = actions[c.conflictId];

          return (
            <div
              key={c.conflictId}
              className={`border rounded-xl overflow-hidden transition-all ${resolution ? 'opacity-60' : ''} ${meta.border} ${meta.bg}`}
            >
              <button
                className="w-full px-4 py-3 flex items-start gap-3 text-left"
                onClick={() => toggle(c.conflictId)}
              >
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${meta.text}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${meta.badge}`}>{meta.label}</span>
                    <span className="text-[10px] font-mono text-gray-400">{c.conflictId}</span>
                    {c.source && <span className="text-[10px] text-gray-400">· {c.source}</span>}
                    {resolution && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto ${resolution === 'accepted' ? 'bg-emerald-100 text-emerald-700' : resolution === 'overridden' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                        {resolution === 'accepted' ? 'Accepted' : resolution === 'overridden' ? 'Overridden' : 'Flagged'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 leading-snug pr-6">{c.description}</p>
                </div>
                {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-200/60">
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    {c.reqA && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Source A</p>
                        <p className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded text-gray-700">{c.reqA}</p>
                      </div>
                    )}
                    {c.reqB && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Source B</p>
                        <p className="text-xs font-mono bg-white border border-gray-200 px-2 py-1 rounded text-gray-700">{c.reqB}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">AI Suggested Resolution</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{c.resolution}</p>
                  </div>
                  {!resolution && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => act(c.conflictId, 'accepted')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept Resolution
                      </button>
                      <button
                        onClick={() => act(c.conflictId, 'flagged')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-200 transition-colors"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Flag for Review
                      </button>
                      <button
                        onClick={() => act(c.conflictId, 'overridden')}
                        className="ml-auto px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Override
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
