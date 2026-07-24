import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, AlertTriangle, CheckCircle, DollarSign, ClipboardCheck, FileText, BookOpen, BarChart3, ArrowRight, Calendar, ShieldCheck, Zap, Briefcase } from 'lucide-react';
import { employersApi } from '../../api/employers';
import { useEmployerStore } from '../../stores/employerStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

function MetricCard({ title, value, subtitle, icon: Icon, variant = 'default' }: MetricCardProps) {
  const iconBg =
    variant === 'success' ? 'bg-emerald-100 text-emerald-600' :
    variant === 'warning' ? 'bg-amber-100 text-amber-600' :
    variant === 'error' ? 'bg-red-100 text-red-600' :
    'bg-brand-100 text-brand-600';
  const valueColor =
    variant === 'success' ? 'text-emerald-700' :
    variant === 'warning' ? 'text-amber-700' :
    variant === 'error' ? 'text-red-700' :
    'text-gray-900';
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
            <p className={`text-3xl font-bold mt-1 ${valueColor}`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const QUICK_LINKS = [
  { label: 'Enrollment', href: '/enrollment', icon: ClipboardCheck, color: 'text-brand-600', bg: 'bg-brand-50', desc: 'Manage open enrollment & life events' },
  { label: 'Plans & Rules', href: '/plans', icon: FileText, color: 'text-cyan-600', bg: 'bg-cyan-50', desc: 'Configure plans, eligibility & rates' },
  { label: 'AI Requirements', href: '/requirements', icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50', desc: 'Extract rules from benefits documents' },
  { label: 'Reports', href: '/reports', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Executive summary & compliance reports' },
  { label: 'Audit Trail', href: '/audit', icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Full event log for compliance review' },
  { label: 'Impact Analysis', href: '/plans?tab=impact', icon: Zap, color: 'text-rose-600', bg: 'bg-rose-50', desc: 'What-if scenarios for plan changes' },
  { label: 'Small Business', href: '/small-business', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'New group enrollment wizard — 8 steps' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentEmployer, currentPlanYear } = useEmployerStore();
  const employerId = currentEmployer?.employerId ?? 'ACM-001';

  const { data: metrics, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', employerId],
    queryFn: () => employersApi.dashboard(employerId),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-1">Failed to load dashboard</p>
          <p className="text-gray-500 text-sm">{(error as Error)?.message ?? 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  const planYear = currentPlanYear?.year ?? metrics?.planYear ?? '';
  const isOpenEnrollment = currentPlanYear?.status === 'OPEN_ENROLLMENT';
  const isDraft = currentPlanYear?.status === 'DRAFT' || currentPlanYear?.status === 'CONFIGURATION';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Open Enrollment Banner */}
      {isOpenEnrollment && (
        <div className="mb-5 bg-gradient-to-r from-brand-500 to-violet-500 rounded-xl p-4 flex items-center gap-3 text-white shadow-md">
          <Calendar className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">Open Enrollment is Active — {planYear} Plan Year</p>
            <p className="text-xs text-white/80 mt-0.5">Employees can enroll or make plan changes. Monitor progress in the Enrollment hub.</p>
          </div>
          <button
            onClick={() => navigate('/enrollment')}
            className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            View Enrollment <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isDraft && currentPlanYear && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{planYear} Plan Year is in {currentPlanYear.status.replace(/_/g, ' ')} — not yet published</p>
            <p className="text-xs text-amber-600 mt-0.5">Complete plan configuration and publish the plan year before open enrollment begins.</p>
          </div>
          <button
            onClick={() => navigate('/plans')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1.5"
          >
            Go to Plans <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            {currentEmployer?.name ?? 'Acme Corp'}
            {planYear ? ` · ${planYear} Plan Year` : ''}
          </p>
        </div>
        {currentPlanYear && (
          <Badge variant={
            currentPlanYear.status === 'ACTIVE' ? 'success' :
            currentPlanYear.status === 'OPEN_ENROLLMENT' ? 'warning' :
            'info'
          }>
            {currentPlanYear.status.replace(/_/g, ' ')}
          </Badge>
        )}
      </div>

      {/* KPI metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Enrollment Rate"
          value={metrics ? `${metrics.enrollment.enrollmentRate.toFixed(1)}%` : '—'}
          subtitle={`${metrics?.enrollment.totalEnrolled ?? 0} of ${metrics?.employees.eligible ?? 0} eligible`}
          icon={TrendingUp}
          variant={metrics && metrics.enrollment.enrollmentRate > 85 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Eligibility Exceptions"
          value={metrics?.eligibility.exceptions ?? 0}
          subtitle={`${metrics?.eligibility.openedThisWeek ?? 0} opened this week`}
          icon={AlertTriangle}
          variant={metrics && metrics.eligibility.exceptions > 0 ? 'warning' : 'success'}
        />
        <MetricCard
          title="Carrier Success"
          value={metrics ? `${metrics.carrier.successRate.toFixed(1)}%` : '—'}
          subtitle={`${metrics?.carrier.accepted ?? 0} accepted, ${metrics?.carrier.rejected ?? 0} rejected`}
          icon={CheckCircle}
          variant={metrics && metrics.carrier.successRate > 95 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Payroll Success"
          value={metrics ? `${metrics.payroll.successRate.toFixed(1)}%` : '—'}
          subtitle={`${metrics?.payroll.activeDeductions ?? 0} active deductions`}
          icon={DollarSign}
          variant={metrics && metrics.payroll.successRate > 95 ? 'success' : 'warning'}
        />
      </div>

      {/* Data grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Enrollment Summary</CardTitle>
              <Badge variant="info">{metrics.planYear} Plan Year</Badge>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2.5 text-sm">
                {[
                  { label: 'Total Employees', value: metrics.employees.total.toLocaleString(), color: 'text-gray-900' },
                  { label: 'Eligible', value: metrics.employees.eligible.toLocaleString(), color: 'text-gray-900' },
                  { label: 'Fully Enrolled', value: metrics.enrollment.fullyEnrolled.toLocaleString(), color: 'text-emerald-700' },
                  { label: 'Partially Enrolled', value: metrics.enrollment.partiallyEnrolled.toLocaleString(), color: 'text-amber-700' },
                  { label: 'Pending', value: metrics.enrollment.pending.toLocaleString(), color: 'text-gray-700' },
                  { label: 'Not Enrolled', value: metrics.enrollment.notEnrolled.toLocaleString(), color: 'text-gray-500' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className={`font-medium ${color}`}>{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2.5 text-sm">
                {[
                  { label: 'Carrier Submitted', value: metrics.carrier.submitted.toLocaleString(), color: 'text-gray-900' },
                  { label: 'Carrier Pending', value: metrics.carrier.pending.toLocaleString(), color: 'text-amber-700' },
                  { label: 'Carrier Rejected', value: metrics.carrier.rejected.toLocaleString(), color: 'text-red-700' },
                  { label: 'Payroll Pending Updates', value: metrics.payroll.pendingUpdates.toLocaleString(), color: 'text-amber-700' },
                  { label: 'Reconciliation Exceptions', value: metrics.payroll.reconciliationExceptions.toLocaleString(), color: metrics.payroll.reconciliationExceptions > 0 ? 'text-red-700' : 'text-emerald-700' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className={`font-medium ${color}`}>{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Quick Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {QUICK_LINKS.map(({ label, href, icon: Icon, color, bg, desc }) => (
            <button
              key={href}
              onClick={() => navigate(href)}
              className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:shadow-sm transition-all text-left group"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${bg} group-hover:scale-105 transition-transform`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: '1.125rem', height: '1.125rem' }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
