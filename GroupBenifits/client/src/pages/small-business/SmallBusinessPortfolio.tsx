import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Search, Filter, Building2, Clock, CheckCircle2, AlertTriangle, XCircle, FileText, ArrowRight } from 'lucide-react';

type AppStatus =
  | 'DRAFT'
  | 'CENSUS_VALIDATION'
  | 'QUOTE_GENERATED'
  | 'ENROLLMENT_IN_PROGRESS'
  | 'AI_REVIEW'
  | 'DOCUMENTS_REQUIRED'
  | 'READY_FOR_SUBMISSION'
  | 'PENDING_SIGNATURE'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'CONDITIONALLY_APPROVED'
  | 'PAYMENT_PENDING'
  | 'ACTIVE';

interface ClientApp {
  id: string;
  businessName: string;
  ownerName: string;
  industry: string;
  employeeCount: number;
  status: AppStatus;
  progressPct: number;
  monthlyPremium?: number;
  lastActivityDate: string;
  brokerNote?: string;
  aiDecision?: 'APPROVE' | 'CONDITIONAL_APPROVAL' | 'REJECT';
}

const MOCK_CLIENTS: ClientApp[] = [
  {
    id: 'APP-2025-41872',
    businessName: 'Acme Corp',
    ownerName: 'David Chen',
    industry: 'Manufacturing',
    employeeCount: 12,
    status: 'DRAFT',
    progressPct: 22,
    lastActivityDate: '2025-12-14',
    brokerNote: 'Waiting on census spreadsheet from HR',
  },
  {
    id: 'APP-2025-38291',
    businessName: 'ABC Manufacturing',
    ownerName: 'Maria Lopez',
    industry: 'Manufacturing',
    employeeCount: 28,
    status: 'UNDER_REVIEW',
    progressPct: 85,
    monthlyPremium: 14200,
    lastActivityDate: '2025-12-12',
    aiDecision: 'CONDITIONAL_APPROVAL',
    brokerNote: 'Conditional — waiting for SOH documents from 3 employees',
  },
  {
    id: 'APP-2025-29943',
    businessName: 'XYZ Services',
    ownerName: 'James Hartwell',
    industry: 'Professional Services',
    employeeCount: 8,
    status: 'ACTIVE',
    progressPct: 100,
    monthlyPremium: 5840,
    lastActivityDate: '2025-12-10',
    aiDecision: 'APPROVE',
  },
  {
    id: 'APP-2025-55112',
    businessName: 'Sunrise Bakery',
    ownerName: 'Patricia Williams',
    industry: 'Food & Beverage',
    employeeCount: 5,
    status: 'QUOTE_GENERATED',
    progressPct: 42,
    monthlyPremium: 2950,
    lastActivityDate: '2025-12-13',
  },
  {
    id: 'APP-2025-61004',
    businessName: 'Harbor Tech Solutions',
    ownerName: 'Kevin O\'Brien',
    industry: 'Technology',
    employeeCount: 19,
    status: 'ENROLLMENT_IN_PROGRESS',
    progressPct: 63,
    monthlyPremium: 11400,
    lastActivityDate: '2025-12-11',
    brokerNote: 'Employee enrollment open window closes Dec 31',
  },
  {
    id: 'APP-2025-70228',
    businessName: 'Coastal Realty Group',
    ownerName: 'Susan Park',
    industry: 'Real Estate',
    employeeCount: 11,
    status: 'APPROVED',
    progressPct: 95,
    monthlyPremium: 7300,
    lastActivityDate: '2025-12-09',
    aiDecision: 'APPROVE',
    brokerNote: 'Pending first premium payment',
  },
];

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT:                   { label: 'Draft',               color: 'bg-gray-100 text-gray-600',     icon: FileText },
  CENSUS_VALIDATION:       { label: 'Census Validation',   color: 'bg-blue-100 text-blue-700',     icon: Clock },
  QUOTE_GENERATED:         { label: 'Quote Ready',         color: 'bg-cyan-100 text-cyan-700',     icon: FileText },
  ENROLLMENT_IN_PROGRESS:  { label: 'Enrolling',           color: 'bg-brand-100 text-brand-700',   icon: Clock },
  AI_REVIEW:               { label: 'AI Review',           color: 'bg-violet-100 text-violet-700', icon: Clock },
  DOCUMENTS_REQUIRED:      { label: 'Docs Required',       color: 'bg-amber-100 text-amber-700',   icon: AlertTriangle },
  READY_FOR_SUBMISSION:    { label: 'Ready to Submit',     color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  PENDING_SIGNATURE:       { label: 'Pending Signature',   color: 'bg-indigo-100 text-indigo-700', icon: Clock },
  SUBMITTED:               { label: 'Submitted',           color: 'bg-brand-100 text-brand-700',   icon: Clock },
  UNDER_REVIEW:            { label: 'Under Review',        color: 'bg-violet-100 text-violet-700', icon: Clock },
  APPROVED:                { label: 'Approved',            color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  CONDITIONALLY_APPROVED:  { label: 'Cond. Approved',      color: 'bg-amber-100 text-amber-700',   icon: AlertTriangle },
  PAYMENT_PENDING:         { label: 'Payment Pending',     color: 'bg-orange-100 text-orange-700', icon: Clock },
  ACTIVE:                  { label: 'Active',              color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
};

const AI_DECISION_CONFIG = {
  APPROVE:               { label: 'AI: Approve',         color: 'text-emerald-700' },
  CONDITIONAL_APPROVAL:  { label: 'AI: Conditional',     color: 'text-amber-700' },
  REJECT:                { label: 'AI: Reject',          color: 'text-red-700' },
};

const STATUS_ORDER: AppStatus[] = [
  'DRAFT', 'CENSUS_VALIDATION', 'QUOTE_GENERATED', 'ENROLLMENT_IN_PROGRESS',
  'AI_REVIEW', 'DOCUMENTS_REQUIRED', 'READY_FOR_SUBMISSION', 'PENDING_SIGNATURE',
  'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'CONDITIONALLY_APPROVED', 'PAYMENT_PENDING', 'ACTIVE',
];

function ProgressBar({ pct, status }: { pct: number; status: AppStatus }) {
  const color =
    status === 'ACTIVE' || status === 'APPROVED' ? 'bg-emerald-500' :
    status === 'DOCUMENTS_REQUIRED' || status === 'CONDITIONALLY_APPROVED' ? 'bg-amber-400' :
    'bg-brand-500';
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const STAGE_FILTERS = ['All', 'In Progress', 'Action Required', 'Completed'] as const;
type StageFilter = typeof STAGE_FILTERS[number];

function matchFilter(app: ClientApp, f: StageFilter): boolean {
  if (f === 'All') return true;
  if (f === 'Action Required') return app.status === 'DOCUMENTS_REQUIRED' || app.status === 'PENDING_SIGNATURE' || app.status === 'PAYMENT_PENDING';
  if (f === 'Completed') return app.status === 'ACTIVE' || app.status === 'APPROVED';
  return !['ACTIVE', 'APPROVED', 'DRAFT'].includes(app.status);
}

export default function SmallBusinessPortfolio() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('All');
  const [sortBy, setSortBy] = useState<'activity' | 'name' | 'status'>('activity');

  const sorted = [...MOCK_CLIENTS]
    .filter((c) => {
      const q = search.toLowerCase();
      if (q && !c.businessName.toLowerCase().includes(q) && !c.ownerName.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false;
      return matchFilter(c, stageFilter);
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.businessName.localeCompare(b.businessName);
      if (sortBy === 'status') return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      return b.lastActivityDate.localeCompare(a.lastActivityDate);
    });

  const stats = {
    total: MOCK_CLIENTS.length,
    active: MOCK_CLIENTS.filter((c) => c.status === 'ACTIVE').length,
    actionRequired: MOCK_CLIENTS.filter((c) => ['DOCUMENTS_REQUIRED', 'PENDING_SIGNATURE', 'PAYMENT_PENDING'].includes(c.status)).length,
    totalPremium: MOCK_CLIENTS.filter((c) => c.monthlyPremium).reduce((sum, c) => sum + (c.monthlyPremium ?? 0), 0),
  };

  return (
    <div className="max-w-5xl mx-auto" data-testid="small-business-portfolio">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
        <button onClick={() => navigate('/')} className="hover:text-gray-600">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigate('/small-business')} className="hover:text-gray-600">Small Business</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-brand-600 font-medium">My Portfolio</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Clients</h1>
          <p className="text-gray-500 text-sm mt-0.5">Broker portfolio — manage and track all client group benefits applications.</p>
        </div>
        <button
          onClick={() => navigate('/small-business')}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Application
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Clients', value: stats.total, color: 'text-gray-900' },
          { label: 'Active Policies', value: stats.active, color: 'text-emerald-700' },
          { label: 'Action Required', value: stats.actionRequired, color: stats.actionRequired > 0 ? 'text-amber-700' : 'text-gray-700' },
          { label: 'Monthly Premium', value: `$${(stats.totalPremium).toLocaleString()}`, color: 'text-brand-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 bg-white border border-gray-200 rounded-xl px-3">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, owner, or ID…"
            className="flex-1 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex gap-1">
            {STAGE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStageFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${stageFilter === f ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 bg-white focus:outline-none"
          >
            <option value="activity">Sort: Recent</option>
            <option value="name">Sort: Name</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>

      {/* Client table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Building2 className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">No clients match your filter.</p>
            <button onClick={() => { setSearch(''); setStageFilter('All'); }} className="mt-2 text-xs text-brand-600 hover:text-brand-800">Clear filters</button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Progress</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Premium</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((client) => {
                const cfg = STATUS_CONFIG[client.status];
                const StatusIcon = cfg.icon;
                const aiCfg = client.aiDecision ? AI_DECISION_CONFIG[client.aiDecision] : null;
                const actionLabel =
                  client.status === 'DRAFT' ? 'Continue' :
                  client.status === 'ACTIVE' || client.status === 'APPROVED' ? 'View' :
                  'Continue';

                return (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-brand-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{client.businessName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{client.ownerName} · {client.industry} · {client.employeeCount} EEs</div>
                          {client.brokerNote && (
                            <div className="text-xs text-amber-700 mt-0.5 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 flex-shrink-0" /> {client.brokerNote}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 hidden sm:table-cell">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                        {aiCfg && (
                          <div className={`text-[10px] font-medium ${aiCfg.color}`}>{aiCfg.label}</div>
                        )}
                        <div className="text-[10px] text-gray-400">{client.id}</div>
                      </div>
                    </td>
                    <td className="px-3 py-4 hidden md:table-cell">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{client.progressPct}%</span>
                        </div>
                        <ProgressBar pct={client.progressPct} status={client.status} />
                      </div>
                    </td>
                    <td className="px-3 py-4 hidden lg:table-cell">
                      {client.monthlyPremium ? (
                        <div>
                          <div className="font-semibold text-gray-900">${client.monthlyPremium.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-400">/ month</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate('/small-business')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg text-xs font-semibold transition-colors"
                      >
                        {actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer note */}
      <p className="text-[11px] text-gray-400 text-center mt-4">
        {sorted.length} of {MOCK_CLIENTS.length} clients shown · Data shown is for demo purposes only
      </p>
    </div>
  );
}
