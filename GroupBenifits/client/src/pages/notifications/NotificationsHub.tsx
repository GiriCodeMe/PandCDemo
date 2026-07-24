import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bell, Mail, CheckCircle2, XCircle, Clock, FileText,
  Eye, AlertTriangle, ChevronRight, Tag,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { notificationsApi, type Notification, type NotificationTemplate } from '../../api/notifications';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  Sent: 'bg-green-50 text-green-700 border border-green-200',
  Delivered: 'bg-green-50 text-green-700 border border-green-200',
  Failed: 'bg-red-50 text-red-700 border border-red-200',
  Scheduled: 'bg-blue-50 text-blue-700 border border-blue-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const CATEGORY_COLOR: Record<string, string> = {
  Enrollment: 'bg-brand-50 text-brand-700',
  'Life Events': 'bg-purple-50 text-purple-700',
  COBRA: 'bg-red-50 text-red-700',
  Payroll: 'bg-green-50 text-green-700',
  Documentation: 'bg-orange-50 text-orange-700',
  Eligibility: 'bg-amber-50 text-amber-700',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded ${CATEGORY_COLOR[category] ?? 'bg-gray-100 text-gray-600'}`}>
      {category}
    </span>
  );
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  Sent: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  Failed: <XCircle className="w-4 h-4 text-red-500" />,
  Scheduled: <Clock className="w-4 h-4 text-blue-500" />,
  Pending: <Clock className="w-4 h-4 text-amber-500" />,
};

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotificationRow({ n }: { n: Notification }) {
  return (
    <div
      className={`flex items-start gap-4 p-4 border rounded-xl ${n.status === 'Failed' ? 'border-red-200 bg-red-50/20' : 'border-gray-200 bg-white'}`}
      data-testid={`notification-row-${n.notificationId}`}
    >
      <div className="mt-0.5 flex-shrink-0">
        {STATUS_ICON[n.status] ?? <Mail className="w-4 h-4 text-gray-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{n.subject}</p>
          <CategoryBadge category={n.category} />
          <StatusBadge status={n.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
          <span>To: <strong className="text-gray-600">{n.employeeName}</strong></span>
          <span>{n.templateName}</span>
          {n.sentAt && <span>Sent: {fmtDate(n.sentAt)}</span>}
          {n.scheduledFor && !n.sentAt && <span>Scheduled: {fmtDate(n.scheduledFor)}</span>}
          {n.openedAt && (
            <span className="flex items-center gap-1 text-green-600">
              <Eye className="w-3 h-3" /> Opened
            </span>
          )}
        </div>
        {n.status === 'Failed' && n.errorMessage && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            {n.errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({ tpl, selected, onClick }: {
  tpl: NotificationTemplate;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border rounded-xl transition-colors ${selected ? 'border-brand-400 bg-brand-50/40 shadow-sm' : 'border-gray-200 bg-white hover:border-brand-200 hover:bg-brand-50/20'}`}
      data-testid={`template-card-${tpl.templateId}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-gray-900">{tpl.name}</p>
            <CategoryBadge category={tpl.category} />
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">{tpl.bodyPreview.substring(0, 100)}…</p>
        </div>
        <div className="text-right text-[10px] text-gray-400 flex-shrink-0">
          <p className="font-semibold text-gray-600">{tpl.useCount.toLocaleString()}</p>
          <p>uses</p>
        </div>
      </div>
    </button>
  );
}

function TemplateDetail({ tpl }: { tpl: NotificationTemplate }) {
  return (
    <div data-testid="template-detail">
    <Card className="p-5 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-gray-900">{tpl.name}</h3>
          <CategoryBadge category={tpl.category} />
        </div>
        <p className="text-xs text-gray-400">{tpl.channel} · Last updated {tpl.lastModified} · {tpl.useCount.toLocaleString()} sends</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Subject Line</p>
        <div className="text-xs font-medium text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          {tpl.subject}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Body Preview</p>
        <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 leading-relaxed">
          {tpl.bodyPreview}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Variables</p>
        <div className="flex flex-wrap gap-1.5">
          {tpl.variables.map((v) => (
            <span key={v} className="text-[10px] font-mono bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded">
              {`{{${v}}}`}
            </span>
          ))}
        </div>
      </div>
    </Card>
    </div>
  );
}

// ─── Main Hub ─────────────────────────────────────────────────────────────────

type View = 'overview' | 'history' | 'templates';

export default function NotificationsHub() {
  const [view, setView] = useState<View>('overview');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: notificationsApi.getStats,
    staleTime: 30_000,
  });

  const { data: notifications = [], isLoading: notifsLoading } = useQuery({
    queryKey: ['notifications', 'list', statusFilter, categoryFilter],
    queryFn: () => notificationsApi.getNotifications({
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
    }),
    staleTime: 30_000,
    enabled: view === 'history' || view === 'overview',
  });

  const { data: templates = [], isLoading: tplsLoading } = useQuery({
    queryKey: ['notifications', 'templates'],
    queryFn: () => notificationsApi.getTemplates(),
    staleTime: 30_000,
    enabled: view === 'templates',
  });

  const VIEWS: { id: View; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Notification History' },
    { id: 'templates', label: 'Templates' },
  ];

  const failedNotifs = notifications.filter((n) => n.status === 'Failed');
  const scheduledNotifs = notifications.filter((n) => n.status === 'Scheduled');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Employee communications, notification templates, and delivery tracking.
        </p>
      </div>

      {/* Stats */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-5 gap-3 mb-6" data-testid="notification-stats">
          {[
            { label: 'Total Sent', value: stats.sent, color: 'text-gray-900' },
            { label: 'Delivery Rate', value: `${stats.deliveryRate}%`, color: stats.deliveryRate >= 95 ? 'text-green-600' : 'text-amber-600' },
            { label: 'Open Rate', value: `${stats.openRate}%`, color: 'text-brand-600' },
            { label: 'Failed', value: stats.failed, color: stats.failed > 0 ? 'text-red-600' : 'text-gray-900' },
            { label: 'Scheduled', value: stats.scheduled, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* View switcher */}
      <div data-testid="notifications-view-switcher" className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            data-testid={`notifications-view-${id}`}
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
          {/* Failed alerts */}
          {failedNotifs.length > 0 && (
            <div className="p-4 border border-red-200 bg-red-50/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-semibold text-red-700">
                  {failedNotifs.length} notification{failedNotifs.length !== 1 ? 's' : ''} failed to deliver
                </p>
              </div>
              <div className="space-y-2" data-testid="failed-notifications">
                {failedNotifs.map((n) => (
                  <NotificationRow key={n.notificationId} n={n} />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Category breakdown */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-700">By Category</h3>
              </div>
              <div className="space-y-2">
                {stats && Object.entries(stats.byCategory).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between items-center text-xs">
                    <CategoryBadge category={cat} />
                    <span className="font-semibold text-gray-700">{count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Scheduled */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-700">Scheduled</h3>
              </div>
              {notifsLoading ? (
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              ) : scheduledNotifs.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No scheduled notifications</p>
              ) : (
                <div className="space-y-2" data-testid="scheduled-notifications">
                  {scheduledNotifs.map((n) => (
                    <div key={n.notificationId} className="text-xs">
                      <p className="font-medium text-gray-800 truncate">{n.subject}</p>
                      <p className="text-gray-400">
                        {n.employeeName} · {fmtDate(n.scheduledFor ?? null)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Recent notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Recent Notifications</h3>
              <button
                onClick={() => setView('history')}
                className="text-xs text-brand-600 hover:text-brand-800 font-medium"
              >
                View all →
              </button>
            </div>
            {notifsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-2" data-testid="recent-notifications">
                {notifications.filter((n) => n.status !== 'Scheduled').slice(0, 5).map((n) => (
                  <NotificationRow key={n.notificationId} n={n} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History */}
      {view === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5"
              data-testid="notif-status-filter"
            >
              <option value="">All statuses</option>
              {['Sent', 'Failed', 'Scheduled'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5"
              data-testid="notif-category-filter"
            >
              <option value="">All categories</option>
              {['Enrollment', 'Life Events', 'COBRA', 'Payroll', 'Documentation', 'Eligibility'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="ml-auto text-xs text-gray-400">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
          </div>
          {notifsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2" data-testid="notifications-list">
              {notifications.map((n) => (
                <NotificationRow key={n.notificationId} n={n} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Templates */}
      {view === 'templates' && (
        <div className="grid grid-cols-2 gap-4" data-testid="templates-section">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              {templates.length} templates
            </p>
            {tplsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-2" data-testid="template-list">
                {templates.map((tpl) => (
                  <TemplateCard
                    key={tpl.templateId}
                    tpl={tpl}
                    selected={selectedTemplate?.templateId === tpl.templateId}
                    onClick={() => setSelectedTemplate(tpl)}
                  />
                ))}
              </div>
            )}
          </div>
          <div>
            {selectedTemplate ? (
              <TemplateDetail tpl={selectedTemplate} />
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <FileText className="w-8 h-8 mb-2" />
                <p className="text-sm">Select a template to preview</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
