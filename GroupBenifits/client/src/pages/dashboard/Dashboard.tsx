import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
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

export default function Dashboard() {
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {planYear && <p className="text-gray-500 text-sm mt-1">Plan Year {planYear}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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

      {metrics && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
