import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart, Calendar, FileText, CheckCircle2, XCircle, Clock,
  AlertCircle, Plus, ChevronRight, Shield, ArrowLeft, Filter,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { lifeEventsApi, type LifeEvent, type DependentRule } from '../../api/life-events';

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  'Pending Documentation': 'bg-amber-50 text-amber-700 border border-amber-200',
  Submitted: 'bg-blue-50 text-blue-700 border border-blue-200',
  Approved: 'bg-green-50 text-green-700 border border-green-200',
  Completed: 'bg-gray-100 text-gray-600 border border-gray-200',
  Rejected: 'bg-red-50 text-red-700 border border-red-200',
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  'Pending Documentation': <Clock className="w-3.5 h-3.5" />,
  Submitted: <FileText className="w-3.5 h-3.5" />,
  Approved: <CheckCircle2 className="w-3.5 h-3.5" />,
  Completed: <CheckCircle2 className="w-3.5 h-3.5" />,
  Rejected: <XCircle className="w-3.5 h-3.5" />,
};

const EVENT_TYPE_COLOR: Record<string, string> = {
  Marriage: 'text-pink-600 bg-pink-50',
  Divorce: 'text-orange-600 bg-orange-50',
  Birth: 'text-blue-600 bg-blue-50',
  Adoption: 'text-purple-600 bg-purple-50',
  'Loss of Other Coverage': 'text-red-600 bg-red-50',
  'Gain of Other Coverage': 'text-green-600 bg-green-50',
  'Death of Dependent': 'text-gray-600 bg-gray-100',
  'Domestic Partnership': 'text-indigo-600 bg-indigo-50',
  'Child Age-Out': 'text-yellow-600 bg-yellow-50',
  Other: 'text-gray-600 bg-gray-100',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {STATUS_ICON[status]}
      {status}
    </span>
  );
}

function EventTypeBadge({ eventType }: { eventType: string }) {
  const cls = EVENT_TYPE_COLOR[eventType] ?? 'text-gray-600 bg-gray-100';
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${cls}`}>
      {eventType}
    </span>
  );
}

// ─── Stat Cards ────────────────────────────────────────────────────────────────

function StatCards({ stats }: { stats: Record<string, number> }) {
  const items = [
    { label: 'Total Events', value: stats.total ?? 0, color: 'text-gray-900' },
    { label: 'Pending Docs', value: stats['Pending Documentation'] ?? 0, color: 'text-amber-600' },
    { label: 'Submitted', value: stats.Submitted ?? 0, color: 'text-blue-600' },
    { label: 'Approved', value: stats.Approved ?? 0, color: 'text-green-600' },
    { label: 'Completed', value: stats.Completed ?? 0, color: 'text-gray-500' },
  ];
  return (
    <div className="grid grid-cols-5 gap-3 mb-6">
      {items.map(({ label, value, color }) => (
        <Card key={label} className="p-4 text-center">
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </Card>
      ))}
    </div>
  );
}

// ─── Report Life Event Form ────────────────────────────────────────────────────

function ReportForm({
  eventTypes,
  onSubmit,
  onCancel,
}: {
  eventTypes: string[];
  onSubmit: (employeeId: string, eventType: string, eventDate: string) => void;
  onCancel: () => void;
}) {
  const [employeeId, setEmployeeId] = useState('ACM-E001');
  const [eventType, setEventType] = useState(eventTypes[0] ?? 'Marriage');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" data-testid="report-life-event-modal">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Report a Life Event</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Employee ID</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              placeholder="ACM-E001"
            />
          </div>
          <div>
            <label htmlFor="event-type-select" className="block text-xs font-semibold text-gray-600 mb-1">Event Type</label>
            <select
              id="event-type-select"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              {eventTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(employeeId, eventType, eventDate)}
            disabled={!employeeId || !eventType || !eventDate}
            className="flex-1 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Life Event Detail ─────────────────────────────────────────────────────────

function LifeEventDetail({
  event,
  onBack,
  onStatusChange,
  onDocSubmit,
}: {
  event: LifeEvent;
  onBack: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDocSubmit: (id: string, doc: string) => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const windowExpired = event.enrollmentWindowEnd < today;
  const daysLeft = Math.max(
    0,
    Math.round((new Date(event.enrollmentWindowEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
        data-testid="life-event-back"
      >
        <ArrowLeft className="w-4 h-4" /> Back to list
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{event.eventType}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Employee: {event.employeeId} · Event date: {event.eventDate}
          </p>
        </div>
        <StatusBadge status={event.status} />
      </div>

      {/* Enrollment window */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-700">Enrollment Window</h3>
          {!windowExpired && (
            <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {daysLeft}d remaining
            </span>
          )}
          {windowExpired && (
            <span className="ml-auto text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              Expired
            </span>
          )}
        </div>
        <div className="flex gap-8 text-sm">
          <div>
            <p className="text-xs text-gray-400">Opens</p>
            <p className="font-semibold text-gray-800">{event.enrollmentWindowStart}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Closes</p>
            <p className="font-semibold text-gray-800">{event.enrollmentWindowEnd}</p>
          </div>
        </div>
      </Card>

      {/* Documents checklist */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-700">Required Documents</h3>
        </div>
        {event.documentsRequired.length === 0 ? (
          <p className="text-sm text-gray-400">No documents required.</p>
        ) : (
          <div className="space-y-2">
            {event.documentsRequired.map((doc) => {
              const submitted = event.documentsSubmitted.includes(doc);
              return (
                <div key={doc} className="flex items-center gap-3">
                  {submitted ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm flex-1 ${submitted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                    {doc}
                  </span>
                  {!submitted && (
                    <button
                      onClick={() => onDocSubmit(event.lifeEventId, doc)}
                      className="text-xs text-brand-600 font-medium hover:text-brand-700 px-2 py-0.5 rounded border border-brand-200 hover:bg-brand-50"
                    >
                      Mark received
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Status actions */}
      {!['Completed', 'Rejected'].includes(event.status) && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h3>
          <div className="flex gap-2 flex-wrap">
            {event.status !== 'Approved' && (
              <button
                onClick={() => onStatusChange(event.lifeEventId, 'Approved')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700"
                data-testid="approve-life-event"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </button>
            )}
            {event.status === 'Approved' && (
              <button
                onClick={() => onStatusChange(event.lifeEventId, 'Completed')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
              </button>
            )}
            <button
              onClick={() => onStatusChange(event.lifeEventId, 'Rejected')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Dependent Rules View ──────────────────────────────────────────────────────

function DependentRulesView({ rules }: { rules: DependentRule[] }) {
  return (
    <div className="space-y-3">
      {rules.map((r) => (
        <Card key={r.ruleId} className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-brand-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900">{r.ruleType}</p>
                {r.ageLimit && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    Max age {r.ageLimit}
                  </span>
                )}
                <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-400'}`}>
                  {r.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{r.description}</p>
              {r.documentationRequired.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {r.documentationRequired.map((d) => (
                    <span key={d} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Hub ─────────────────────────────────────────────────────────────────

type View = 'list' | 'rules';

export default function LifeEventsHub() {
  const qc = useQueryClient();
  const [view, setView] = useState<View>('list');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<LifeEvent | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['life-events', statusFilter, typeFilter],
    queryFn: () => lifeEventsApi.getAll({
      status: statusFilter || undefined,
      eventType: typeFilter || undefined,
    }),
    staleTime: 30_000,
  });

  const { data: eventTypes = [] } = useQuery({
    queryKey: ['life-events', 'event-types'],
    queryFn: lifeEventsApi.getEventTypes,
    staleTime: 300_000,
  });

  const { data: depRules = [] } = useQuery({
    queryKey: ['life-events', 'dependent-rules'],
    queryFn: lifeEventsApi.getDependentRules,
    staleTime: 300_000,
    enabled: view === 'rules',
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      lifeEventsApi.updateStatus(id, status),
    onSuccess: (updated) => {
      setSelectedEvent(updated);
      qc.invalidateQueries({ queryKey: ['life-events'] });
    },
  });

  const docMutation = useMutation({
    mutationFn: ({ id, doc }: { id: string; doc: string }) =>
      lifeEventsApi.submitDocument(id, doc),
    onSuccess: (updated) => {
      setSelectedEvent(updated);
      qc.invalidateQueries({ queryKey: ['life-events'] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: ({ employeeId, eventType, eventDate }: { employeeId: string; eventType: string; eventDate: string }) =>
      lifeEventsApi.submit(employeeId, eventType, eventDate),
    onSuccess: (newEvent) => {
      setShowReportForm(false);
      qc.invalidateQueries({ queryKey: ['life-events'] });
      setSelectedEvent(newEvent);
    },
  });

  const events = data?.events ?? [];
  const stats = data?.stats ?? {};

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Life Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Qualifying life events, enrollment windows, and dependent verification.
          </p>
        </div>
        <button
          onClick={() => setShowReportForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          data-testid="report-life-event-btn"
        >
          <Plus className="w-4 h-4" />
          Report Life Event
        </button>
      </div>

      {/* Stats */}
      {!isLoading && <StatCards stats={stats} />}

      {/* View switcher */}
      <div data-testid="life-events-view-switcher" className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {[
          { id: 'list' as View, label: 'Life Events' },
          { id: 'rules' as View, label: 'Dependent Rules' },
        ].map(({ id, label }) => (
          <button
            key={id}
            data-testid={`life-events-view-${id}`}
            onClick={() => { setView(id); setSelectedEvent(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List view */}
      {view === 'list' && (
        <div>
          {selectedEvent ? (
            <LifeEventDetail
              event={selectedEvent}
              onBack={() => setSelectedEvent(null)}
              onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
              onDocSubmit={(id, doc) => docMutation.mutate({ id, doc })}
            />
          ) : (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Filter className="w-3.5 h-3.5" />
                  Filter:
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  data-testid="status-filter"
                >
                  <option value="">All statuses</option>
                  {['Pending Documentation', 'Submitted', 'Approved', 'Completed', 'Rejected'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  data-testid="type-filter"
                >
                  <option value="">All event types</option>
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {(statusFilter || typeFilter) && (
                  <button
                    onClick={() => { setStatusFilter(''); setTypeFilter(''); }}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
                <span className="ml-auto text-xs text-gray-400">{events.length} event{events.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Event list */}
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              ) : events.length === 0 ? (
                <div className="flex items-center gap-2 p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                  <div className="w-full">
                    <Heart className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    No life events found.
                  </div>
                </div>
              ) : (
                <div className="space-y-2" data-testid="life-events-list">
                  {events.map((event) => {
                    const today = new Date().toISOString().split('T')[0];
                    const windowExpired = event.enrollmentWindowEnd < today;
                    const daysLeft = Math.max(
                      0,
                      Math.round(
                        (new Date(event.enrollmentWindowEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                      ),
                    );
                    return (
                      <button
                        key={event.lifeEventId}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-brand-300 hover:bg-brand-50/20 text-left transition-colors"
                        data-testid={`life-event-row-${event.lifeEventId}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <EventTypeBadge eventType={event.eventType} />
                            <span className="text-xs text-gray-400">{event.employeeId}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>Event: {event.eventDate}</span>
                            {!windowExpired && event.status !== 'Completed' && event.status !== 'Rejected' && (
                              <span className="text-amber-600 font-medium">
                                <Clock className="w-3 h-3 inline mr-0.5" />
                                {daysLeft}d left
                              </span>
                            )}
                            {windowExpired && event.status === 'Pending Documentation' && (
                              <span className="text-red-600 font-medium">
                                <AlertCircle className="w-3 h-3 inline mr-0.5" />
                                Window expired
                              </span>
                            )}
                          </div>
                        </div>
                        <StatusBadge status={event.status} />
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dependent Rules view */}
      {view === 'rules' && (
        <DependentRulesView rules={depRules} />
      )}

      {/* Report form modal */}
      {showReportForm && (
        <ReportForm
          eventTypes={eventTypes}
          onSubmit={(employeeId, eventType, eventDate) =>
            reportMutation.mutate({ employeeId, eventType, eventDate })
          }
          onCancel={() => setShowReportForm(false)}
        />
      )}
    </div>
  );
}
