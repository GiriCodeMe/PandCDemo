import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, Clock, ChevronRight,
  User, Calendar, FileText, AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { cobraApi, type CobraEvent, type AuditEvent } from '../../api/cobra';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Elected: 'bg-blue-50 text-blue-700 border border-blue-200',
  Active: 'bg-green-50 text-green-700 border border-green-200',
  Declined: 'bg-gray-100 text-gray-600 border border-gray-200',
  Lapsed: 'bg-red-50 text-red-700 border border-red-200',
  Expired: 'bg-red-50 text-red-700 border border-red-200',
};

const AUDIT_STATUS_COLOR: Record<string, string> = {
  Success: 'text-green-600',
  Warning: 'text-amber-600',
  Error: 'text-red-600',
};

const AUDIT_STATUS_ICON: Record<string, React.ReactNode> = {
  Success: <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />,
  Warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />,
  Error: <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />,
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(d: string): number {
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ─── COBRA Event Card ─────────────────────────────────────────────────────────

function CobraEventCard({ event, onClick }: { event: CobraEvent; onClick: () => void }) {
  const days = event.electionStatus === 'Pending' ? daysUntil(event.electionDeadline) : null;
  const isUrgent = days !== null && days <= 14;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border rounded-xl transition-colors hover:border-brand-300 hover:bg-brand-50/30 ${isUrgent ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200 bg-white'}`}
      data-testid={`cobra-event-${event.cobraEventId}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900">{event.firstName} {event.lastName}</p>
            <StatusBadge status={event.electionStatus} />
            {isUrgent && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                {days}d left
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">{event.qualifyingEventType} · {fmtDate(event.qualifyingEventDate)}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Deadline: {fmtDate(event.electionDeadline)} ·
            Coverage: {event.coverageTypes.join(', ')}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

// ─── COBRA Event Detail ───────────────────────────────────────────────────────

function CobraEventDetail({ event, onBack }: { event: CobraEvent; onBack: () => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-xs text-brand-600 hover:text-brand-800 font-medium"
          data-testid="cobra-back"
        >
          ← Back
        </button>
        <h2 className="text-sm font-semibold text-gray-700">
          {event.firstName} {event.lastName} — COBRA {event.cobraEventId}
        </h2>
        <StatusBadge status={event.electionStatus} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Qualifying Event</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Event Type</span>
              <span className="font-medium text-gray-800">{event.qualifyingEventType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Event Date</span>
              <span className="font-medium text-gray-800">{fmtDate(event.qualifyingEventDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Coverage Loss</span>
              <span className="font-medium text-gray-800">{fmtDate(event.coverageLossDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Notice Sent</span>
              <span className="font-medium text-gray-800">{fmtDate(event.noticeSentDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Election Deadline</span>
              <span className={`font-medium ${event.electionStatus === 'Pending' && daysUntil(event.electionDeadline) <= 14 ? 'text-amber-700' : 'text-gray-800'}`}>
                {fmtDate(event.electionDeadline)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Contact</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium text-gray-800">{event.firstName} {event.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-800">{event.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Employee ID</span>
              <span className="font-mono text-xs text-gray-500">{event.employeeId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Employer</span>
              <span className="font-medium text-gray-800">{event.employerName}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Coverage Elections</h3>
        <div className="space-y-3">
          {event.elections.map((el) => (
            <div key={el.planCode} className={`p-3 rounded-lg border ${el.electionStatus === 'Active' ? 'border-green-200 bg-green-50/30' : el.electionStatus === 'Lapsed' ? 'border-red-200 bg-red-50/30' : el.electionStatus === 'Declined' ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-white'}`}
              data-testid={`cobra-election-${el.planCode}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{el.planName}</p>
                  <p className="text-xs text-gray-400">{el.coverageType}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Monthly COBRA cost</p>
                    <p className="text-sm font-bold text-gray-900">${el.monthlyCobraCost.toFixed(2)}</p>
                  </div>
                  <StatusBadge status={el.electionStatus} />
                </div>
              </div>
              {(el.paymentsReceived !== undefined) && (
                <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-2 mt-2">
                  <span>Payments received: <strong className="text-gray-800">{el.paymentsReceived}</strong></span>
                  {(el.paymentsDue ?? 0) > 0 && (
                    <span className="text-red-600 font-medium">Overdue: {el.paymentsDue}</span>
                  )}
                  {el.lastPaymentDate && <span>Last: {fmtDate(el.lastPaymentDate)}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

function AuditLogView({ events }: { events: AuditEvent[] }) {
  return (
    <div className="space-y-2" data-testid="audit-log-list">
      {events.map((e) => (
        <div key={e.auditId} className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl bg-white"
          data-testid={`audit-event-${e.auditId}`}
        >
          <div className="mt-0.5">{AUDIT_STATUS_ICON[e.status] ?? <AlertCircle className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono text-gray-400">{e.auditId}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{e.eventType.replace(/_/g, ' ')}</span>
              <span className={`text-xs font-medium ${AUDIT_STATUS_COLOR[e.status] ?? 'text-gray-500'}`}>{e.status}</span>
            </div>
            <p className="text-xs text-gray-700">{e.description}</p>
            <p className="text-[10px] text-brand-600 mt-0.5">{e.complianceNote}</p>
          </div>
          <div className="text-[10px] text-gray-400 flex-shrink-0">
            {new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Hub ─────────────────────────────────────────────────────────────────

type View = 'overview' | 'events' | 'audit';

export default function CobraHub() {
  const [view, setView] = useState<View>('overview');
  const [selectedEvent, setSelectedEvent] = useState<CobraEvent | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['cobra', 'stats'],
    queryFn: cobraApi.getStats,
    staleTime: 30_000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['cobra', 'alerts'],
    queryFn: cobraApi.getAlerts,
    staleTime: 30_000,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['cobra', 'events', statusFilter],
    queryFn: () => cobraApi.getAll(statusFilter || undefined),
    staleTime: 30_000,
    enabled: view === 'events' || view === 'overview',
  });

  const { data: auditLog = [], isLoading: auditLoading } = useQuery({
    queryKey: ['cobra', 'audit-log'],
    queryFn: () => cobraApi.getAuditLog(),
    staleTime: 30_000,
    enabled: view === 'audit',
  });

  const VIEWS: { id: View; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'events', label: 'COBRA Events' },
    { id: 'audit', label: 'Compliance Audit' },
  ];

  if (selectedEvent) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <CobraEventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">COBRA & Compliance</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          COBRA administration, election tracking, and compliance audit trail.
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-5 p-4 border border-amber-200 bg-amber-50/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-semibold text-amber-700">{alerts.length} compliance alert{alerts.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-1.5" data-testid="compliance-alerts">
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-2 text-xs ${a.severity === 'error' ? 'text-red-700' : 'text-amber-700'}`}
                data-testid={`alert-${a.cobraEventId}`}
              >
                {a.severity === 'error' ? <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
                {a.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-5 gap-3 mb-6" data-testid="cobra-stats">
          {[
            { label: 'Total Events', value: stats.total, color: 'text-gray-900' },
            { label: 'Pending Election', value: stats.pending, color: 'text-amber-600' },
            { label: 'Active COBRA', value: stats.elected, color: 'text-blue-600' },
            { label: 'Declined', value: stats.declined, color: 'text-gray-500' },
            { label: 'Lapsed', value: stats.lapsed, color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* View switcher */}
      <div data-testid="cobra-view-switcher" className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            data-testid={`cobra-view-${id}`}
            onClick={() => setView(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {view === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-700">Election Status Breakdown</h3>
              </div>
              <div className="space-y-2">
                {stats && Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center text-xs">
                    <StatusBadge status={status} />
                    <span className="font-semibold text-gray-700">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-700">Active COBRA Cost</h3>
              </div>
              {stats && (
                <div className="text-center py-4">
                  <p className="text-3xl font-bold text-gray-900">${stats.totalMonthlyCobraCost.toFixed(2)}</p>
                  <p className="text-xs text-gray-400 mt-1">total monthly COBRA premium</p>
                </div>
              )}
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent COBRA Events</h3>
            {eventsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-2" data-testid="cobra-events-list">
                {events.slice(0, 3).map((e) => (
                  <CobraEventCard key={e.cobraEventId} event={e} onClick={() => setSelectedEvent(e)} />
                ))}
                {events.length > 3 && (
                  <button
                    onClick={() => setView('events')}
                    className="text-xs text-brand-600 hover:text-brand-800 font-medium py-2"
                  >
                    View all {events.length} events →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* COBRA Events */}
      {view === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5"
              data-testid="cobra-status-filter"
            >
              <option value="">All statuses</option>
              {['Pending', 'Elected', 'Declined', 'Lapsed'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="ml-auto text-xs text-gray-400">{events.length} event{events.length !== 1 ? 's' : ''}</span>
          </div>
          {eventsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2" data-testid="cobra-events-full-list">
              {events.map((e) => (
                <CobraEventCard key={e.cobraEventId} event={e} onClick={() => setSelectedEvent(e)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Compliance Audit */}
      {view === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-700">Compliance Audit Trail</h3>
            <span className="ml-auto text-xs text-gray-400">{auditLog.length} event{auditLog.length !== 1 ? 's' : ''}</span>
          </div>
          {auditLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <AuditLogView events={auditLog} />
          )}
        </div>
      )}
    </div>
  );
}
