import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Calendar, Filter, ChevronDown, ChevronRight, User, Building2, FileText, Settings, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';

function authHeader() {
  return { Authorization: `Bearer ${sessionStorage.getItem('persona_token') ?? 'P-001'}` };
}

interface AuditEvent {
  eventId: string;
  employerId: string;
  actorId: string;
  actorName?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome: string;
  timestamp: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
}

async function fetchAuditEvents(): Promise<AuditEvent[]> {
  const res = await fetch('/api/audit?employerId=ACM-001', { headers: authHeader() });
  const json = await res.json();
  const events = Array.isArray(json.data?.events) ? json.data.events : [];

  // Augment with synthetic demo events for richer display
  const synthetic: AuditEvent[] = [
    { eventId: 'AUD-DEMO-001', employerId: 'ACM-001', actorId: 'P-001', actorName: 'Linda Hayes', action: 'ELIGIBILITY_RULE_PUBLISHED', resourceType: 'EligibilityRule', resourceId: 'RULE-FT-001', outcome: 'SUCCESS', timestamp: new Date(Date.now() - 3_600_000).toISOString() },
    { eventId: 'AUD-DEMO-002', employerId: 'ACM-001', actorId: 'P-002', actorName: 'Sarah Chen', action: 'ENROLLMENT_EXCEPTION_REVIEWED', resourceType: 'Employee', resourceId: 'ACM-E012', outcome: 'PENDING', timestamp: new Date(Date.now() - 7_200_000).toISOString(), details: { employeeName: 'Linda White', reason: 'Carrier rejection — CT-10045' } },
    { eventId: 'AUD-DEMO-003', employerId: 'ACM-001', actorId: 'P-006', actorName: 'Marcus Bell', action: 'CARRIER_TRANSACTION_SUBMITTED', resourceType: 'CarrierTransaction', resourceId: 'CT-10045', outcome: 'FAILED', timestamp: new Date(Date.now() - 10_800_000).toISOString(), details: { carrierId: 'CAR-001', errorCode: 'INVALID_DEPENDENT_ID' } },
    { eventId: 'AUD-DEMO-004', employerId: 'ACM-001', actorId: 'P-001', actorName: 'Linda Hayes', action: 'DOCUMENT_UPLOADED', resourceType: 'BenefitsDocument', resourceId: 'DOC-2027-0001', outcome: 'SUCCESS', timestamp: new Date(Date.now() - 14_400_000).toISOString(), details: { documentType: 'Benefits Guide', pageCount: 24 } },
    { eventId: 'AUD-DEMO-005', employerId: 'ACM-001', actorId: 'SYSTEM', actorName: 'AI Engine', action: 'REQUIREMENTS_GENERATED', resourceType: 'BenefitsDocument', resourceId: 'DOC-2027-0001', outcome: 'SUCCESS', timestamp: new Date(Date.now() - 12_600_000).toISOString(), details: { requirementsCount: 127, conflictsDetected: 2, processingMs: 1847 } },
    { eventId: 'AUD-DEMO-006', employerId: 'ACM-001', actorId: 'P-005', actorName: 'James Park', action: 'ELIGIBILITY_AUDIT_REVIEWED', resourceType: 'Employee', resourceId: 'ACM-E012', outcome: 'BLOCKED', timestamp: new Date(Date.now() - 18_000_000).toISOString(), details: { decision: 'Cannot approve — carrier acceptance pending' } },
    { eventId: 'AUD-DEMO-007', employerId: 'ACM-001', actorId: 'P-007', actorName: 'Jessica Torres', action: 'PAYROLL_DEDUCTION_RECONCILED', resourceType: 'PayrollTransaction', resourceId: 'PAY-CYCLE-2027-01', outcome: 'PARTIAL', timestamp: new Date(Date.now() - 21_600_000).toISOString(), details: { reconciledCount: 523, mismatches: 27 } },
    { eventId: 'AUD-DEMO-008', employerId: 'ACM-001', actorId: 'P-003', actorName: 'Robert Chen', action: 'EXECUTIVE_REPORT_VIEWED', resourceType: 'Report', resourceId: 'RPT-EXEC-2027-01', outcome: 'SUCCESS', timestamp: new Date(Date.now() - 25_200_000).toISOString() },
  ];

  return [...synthetic, ...events].slice(0, 50);
}

const ACTION_META: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  ELIGIBILITY_RULE_PUBLISHED: { label: 'Rule Published', color: 'text-emerald-600', icon: CheckCircle2 },
  ENROLLMENT_EXCEPTION_REVIEWED: { label: 'Exception Review', color: 'text-amber-600', icon: AlertTriangle },
  CARRIER_TRANSACTION_SUBMITTED: { label: 'Carrier Submit', color: 'text-red-600', icon: FileText },
  DOCUMENT_UPLOADED: { label: 'Doc Uploaded', color: 'text-brand-600', icon: FileText },
  REQUIREMENTS_GENERATED: { label: 'AI Generation', color: 'text-violet-600', icon: Settings },
  ELIGIBILITY_AUDIT_REVIEWED: { label: 'Eligibility Audit', color: 'text-amber-600', icon: ShieldCheck },
  PAYROLL_DEDUCTION_RECONCILED: { label: 'Payroll Reconcile', color: 'text-cyan-600', icon: Settings },
  EXECUTIVE_REPORT_VIEWED: { label: 'Report Viewed', color: 'text-gray-600', icon: FileText },
};

const OUTCOME_STYLES: Record<string, string> = {
  SUCCESS: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-red-100 text-red-700',
  PENDING: 'bg-amber-100 text-amber-700',
  BLOCKED: 'bg-red-100 text-red-700',
  PARTIAL: 'bg-amber-100 text-amber-700',
};

const RESOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Employee: User,
  EligibilityRule: ShieldCheck,
  BenefitsDocument: FileText,
  CarrierTransaction: Building2,
  PayrollTransaction: Settings,
  Report: FileText,
};

function relativeTime(ts: string): string {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

const EVENT_TYPES = ['All', 'Eligibility', 'Enrollment', 'Documents', 'Carrier', 'Payroll', 'Reports'];
const OUTCOMES = ['All', 'SUCCESS', 'FAILED', 'PENDING', 'BLOCKED', 'PARTIAL'];

function matchFilter(event: AuditEvent, type: string, outcome: string): boolean {
  const typeMatch = type === 'All' || (
    (type === 'Eligibility' && (event.action.includes('ELIGIBILITY') || event.action.includes('RULE'))) ||
    (type === 'Enrollment' && event.action.includes('ENROLLMENT')) ||
    (type === 'Documents' && (event.action.includes('DOCUMENT') || event.action.includes('REQUIREMENTS'))) ||
    (type === 'Carrier' && event.action.includes('CARRIER')) ||
    (type === 'Payroll' && event.action.includes('PAYROLL')) ||
    (type === 'Reports' && event.action.includes('REPORT'))
  );
  const outcomeMatch = outcome === 'All' || event.outcome === outcome;
  return typeMatch && outcomeMatch;
}

export default function AuditTrail() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [outcomeFilter, setOutcomeFilter] = useState('All');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['audit-trail'],
    queryFn: fetchAuditEvents,
    staleTime: 30_000,
  });

  function toggle(id: string) {
    setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const filtered = events.filter((e) => matchFilter(e, typeFilter, outcomeFilter));
  const failedCount = events.filter((e) => e.outcome === 'FAILED' || e.outcome === 'BLOCKED').length;

  return (
    <div className="p-6 max-w-5xl mx-auto" data-testid="audit-trail">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Audit Trail</h1>
        <p className="text-sm text-gray-500 mt-0.5">Complete log of all system events, eligibility decisions, and data access. SSN and PII are never recorded.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Events', value: events.length, color: 'text-gray-900' },
          { label: 'Today', value: events.filter((e) => new Date(e.timestamp) > new Date(Date.now() - 86_400_000)).length, color: 'text-brand-600' },
          { label: 'Failures / Blocks', value: failedCount, color: failedCount > 0 ? 'text-red-600' : 'text-emerald-600' },
          { label: 'Actors', value: new Set(events.map((e) => e.actorId)).size, color: 'text-gray-700' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-400">Type:</span>
        </div>
        {EVENT_TYPES.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${typeFilter === t ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
        ))}
        <div className="flex items-center gap-1 ml-4 mr-2">
          <span className="text-xs text-gray-400">Outcome:</span>
        </div>
        {OUTCOMES.map((o) => (
          <button key={o} onClick={() => setOutcomeFilter(o)} className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${outcomeFilter === o ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{o}</button>
        ))}
      </div>

      {/* Event timeline */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

          <div className="space-y-1">
            {filtered.map((event) => {
              const meta = ACTION_META[event.action];
              const Icon = meta?.icon ?? (RESOURCE_ICONS[event.resourceType] ?? Settings);
              const isOpen = expanded.has(event.eventId);
              const hasDetails = event.details && Object.keys(event.details).length > 0;

              return (
                <div key={event.eventId} className="relative pl-12">
                  {/* Timeline dot */}
                  <div className={`absolute left-3 top-3.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${event.outcome === 'FAILED' || event.outcome === 'BLOCKED' ? 'bg-red-100' : event.outcome === 'SUCCESS' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${event.outcome === 'FAILED' || event.outcome === 'BLOCKED' ? 'bg-red-500' : event.outcome === 'SUCCESS' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>

                  <div className={`border border-gray-100 rounded-xl bg-white mb-2 overflow-hidden ${event.outcome === 'FAILED' || event.outcome === 'BLOCKED' ? 'border-l-2 border-l-red-300' : ''}`}>
                    <button
                      className="w-full text-left px-4 py-3 flex items-center gap-3"
                      onClick={() => hasDetails && toggle(event.eventId)}
                    >
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${meta?.color ?? 'text-gray-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800">{meta?.label ?? event.action}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${OUTCOME_STYLES[event.outcome] ?? 'bg-gray-100 text-gray-600'}`}>{event.outcome}</span>
                          <span className="text-xs font-mono text-gray-400">{event.resourceId}</span>
                          <span className="text-xs text-gray-400 ml-auto">{relativeTime(event.timestamp)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {event.actorName ?? event.actorId} · {event.resourceType}
                        </p>
                      </div>
                      {hasDetails && (
                        isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {isOpen && hasDetails && (
                      <div className="px-4 pb-3 border-t border-gray-50 bg-gray-50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2 mt-2">Event Details</p>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-1">
                          {Object.entries(event.details ?? {}).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-xs">
                              <dt className="text-gray-400 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</dt>
                              <dd className="font-mono font-medium text-gray-700">{String(v)}</dd>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs">
                            <dt className="text-gray-400">Timestamp</dt>
                            <dd className="font-mono font-medium text-gray-700">{new Date(event.timestamp).toLocaleString()}</dd>
                          </div>
                          <div className="flex justify-between text-xs">
                            <dt className="text-gray-400">Event ID</dt>
                            <dd className="font-mono font-medium text-gray-700">{event.eventId}</dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No events match the current filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
