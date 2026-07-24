import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3, TrendingUp, AlertTriangle, CheckCircle2, XCircle,
  Clock, Users, DollarSign, FileText, ShieldCheck,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import {
  reportsApi,
  type ExecutiveSummary,
  type EnrollmentReport,
  type CarrierAuditReport,
  type ComplianceReport,
} from '../../api/reports';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_COLOR: Record<string, string> = {
  High: 'bg-red-50 text-red-700 border border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  Low: 'bg-blue-50 text-blue-700 border border-blue-200',
};

const STATUS_COLOR: Record<string, string> = {
  Open: 'bg-red-50 text-red-700',
  'In Progress': 'bg-amber-50 text-amber-700',
  Resolved: 'bg-green-50 text-green-700',
};

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${SEVERITY_COLOR[severity] ?? 'bg-gray-100 text-gray-500'}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLOR[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

function fmt$(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function fmtPct(n: number) {
  return `${n.toFixed(1)}%`;
}

// ─── Executive Summary View ───────────────────────────────────────────────────

function ExecutiveView({ data }: { data: ExecutiveSummary }) {
  return (
    <div className="space-y-6" data-testid="executive-summary">
      <p className="text-xs text-gray-400">Period: {data.period.label} · Generated {new Date(data.generatedAt).toLocaleDateString()}</p>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3" data-testid="executive-kpis">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{fmtPct(data.enrollment.enrollmentRate)}</p>
              <p className="text-xs text-gray-500">Enrollment Rate</p>
              <p className="text-[10px] text-gray-400">{data.enrollment.totalEnrolled} / {data.enrollment.totalEligible}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{fmt$(data.financials.totalMonthlyCost)}</p>
              <p className="text-xs text-gray-500">Monthly Cost</p>
              <p className="text-[10px] text-gray-400">+{data.financials.vsLastYear}% vs last year</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg ${data.carriers.successRate >= 97 ? 'bg-green-100' : 'bg-amber-100'} flex items-center justify-center flex-shrink-0`}>
              <BarChart3 className={`w-5 h-5 ${data.carriers.successRate >= 97 ? 'text-green-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{fmtPct(data.carriers.successRate)}</p>
              <p className="text-xs text-gray-500">Carrier Success</p>
              <p className="text-[10px] text-gray-400">{data.carriers.failed} failed, {data.carriers.pending} pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-lg ${data.compliance.openExceptions === 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center flex-shrink-0`}>
              <ShieldCheck className={`w-5 h-5 ${data.compliance.openExceptions === 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{data.compliance.openExceptions}</p>
              <p className="text-xs text-gray-500">Open Exceptions</p>
              <p className="text-[10px] text-gray-400">ACA: {data.compliance.aCA1095cFiled} filed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Plan mix + financials */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Plan Mix by Enrollment</h3>
          <div className="space-y-3">
            {data.enrollment.byPlan.map((p) => (
              <div key={p.planCode} data-testid={`plan-row-${p.planCode}`}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700 font-medium">{p.planName}</span>
                  <span className="text-gray-500">{p.enrolled} ({fmtPct(p.pct)})</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Financial Summary</h3>
          <div className="space-y-3 text-xs" data-testid="financial-summary">
            {[
              { label: 'Total Monthly Cost', value: fmt$(data.financials.totalMonthlyCost), bold: true },
              { label: 'Employer Contribution', value: fmt$(data.financials.employerContribution) },
              { label: 'Employee Contribution', value: fmt$(data.financials.employeeContribution) },
              { label: 'Avg Cost / Employee', value: fmt$(data.financials.avgCostPerEmployee) },
              { label: 'Projected Annual', value: fmt$(data.financials.projectedAnnualCost), bold: true },
            ].map(({ label, value, bold }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-500">{label}</span>
                <span className={bold ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top issues */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Issues Requiring Attention</h3>
        <div className="space-y-2" data-testid="top-issues">
          {data.topIssues.map((issue) => (
            <div
              key={issue.id}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-white"
              data-testid={`issue-row-${issue.id}`}
            >
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${issue.severity === 'High' ? 'text-red-500' : 'text-amber-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-mono text-gray-400">{issue.id}</span>
                  <SeverityBadge severity={issue.severity} />
                  <StatusBadge status={issue.status} />
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{issue.category}</span>
                </div>
                <p className="text-xs text-gray-700">{issue.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Enrollment Report View ───────────────────────────────────────────────────

function EnrollmentView({ data }: { data: EnrollmentReport }) {
  return (
    <div className="space-y-6" data-testid="enrollment-report">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{data.title} · {data.period}</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-3" data-testid="enrollment-summary">
        {[
          { label: 'Eligible', value: data.summary.totalEligible },
          { label: 'Enrolled', value: data.summary.totalEnrolled, color: 'text-brand-600' },
          { label: 'Waived', value: data.summary.totalWaived },
          { label: 'Enroll Rate', value: `${data.summary.enrollmentRate}%`, color: 'text-green-600' },
          { label: 'By Deadline', value: `${data.summary.completionByDeadline}%`, color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${color ?? 'text-gray-900'}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* By employer */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Employer</h3>
          <div className="space-y-3" data-testid="enrollment-by-employer">
            {data.byEmployer.map((e) => (
              <div key={e.employerId} data-testid={`employer-row-${e.employerId}`}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{e.employerName}</span>
                  <span className="text-gray-500">{e.enrolled}/{e.eligible} ({e.rate}%)</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-400 rounded-full" style={{ width: `${e.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* By product */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Product</h3>
          <div className="space-y-3" data-testid="enrollment-by-product">
            {data.byProduct.map((p) => (
              <div key={p.productCode} className="flex justify-between items-center text-xs" data-testid={`product-row-${p.productCode}`}>
                <span className="font-medium text-gray-700 w-28 truncate">{p.productName}</span>
                <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: `${p.rate}%` }} />
                </div>
                <span className="text-gray-500 w-24 text-right">{p.enrolled} / {p.eligible}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Enrollment timeline */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Enrollment Timeline</h3>
        <div className="flex items-end gap-2 h-32" data-testid="enrollment-timeline">
          {data.timeline.map((t, i) => {
            const maxEnrolled = Math.max(...data.timeline.map((x) => x.enrolled));
            const heightPct = maxEnrolled > 0 ? (t.enrolled / maxEnrolled) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group" data-testid={`timeline-bar-${i}`}>
                <div
                  className="w-full bg-brand-200 group-hover:bg-brand-400 rounded-t transition-colors"
                  style={{ height: `${Math.max(4, heightPct)}%` }}
                />
                <p className="text-[8px] text-gray-400 text-center leading-tight">{t.enrolled}</p>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 mt-1">
          {data.timeline.map((t, i) => (
            <div key={i} className="flex-1 text-[7px] text-gray-400 text-center leading-tight truncate">
              {t.label.split(' ')[0]}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Carrier Audit View ───────────────────────────────────────────────────────

function CarrierAuditView({ data }: { data: CarrierAuditReport }) {
  return (
    <div className="space-y-6" data-testid="carrier-audit-report">
      <p className="text-xs text-gray-400">{data.title} · {data.period}</p>

      <div className="grid grid-cols-5 gap-3" data-testid="carrier-summary">
        {[
          { label: 'Total', value: data.summary.totalTransactions },
          { label: 'Successful', value: data.summary.successful, color: 'text-green-600' },
          { label: 'Failed', value: data.summary.failed, color: data.summary.failed > 0 ? 'text-red-600' : 'text-gray-900' },
          { label: 'Pending', value: data.summary.pending, color: 'text-blue-600' },
          { label: 'Success Rate', value: `${data.summary.successRate}%`, color: data.summary.successRate >= 97 ? 'text-green-600' : 'text-amber-600' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-4 text-center">
            <p className={`text-2xl font-bold ${color ?? 'text-gray-900'}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">By Carrier</h3>
          <div className="space-y-3" data-testid="carrier-breakdown">
            {data.byCarrier.map((c) => (
              <div
                key={c.carrierId}
                className="p-3 border border-gray-100 rounded-lg"
                data-testid={`carrier-row-${c.carrierId}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-semibold text-gray-800">{c.carrierName}</p>
                  <span className={`text-xs font-bold ${c.successRate >= 97 ? 'text-green-600' : c.successRate >= 90 ? 'text-amber-600' : 'text-red-600'}`}>
                    {c.successRate}%
                  </span>
                </div>
                <div className="flex gap-3 text-[10px] text-gray-500">
                  <span className="text-green-600">{c.successful} ok</span>
                  {c.failed > 0 && <span className="text-red-600">{c.failed} failed</span>}
                  {c.pending > 0 && <span className="text-blue-600">{c.pending} pending</span>}
                </div>
                {c.failed > 0 && (
                  <p className="text-[10px] text-gray-400 mt-1 truncate">{c.topFailureReason}</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Failure Reasons</h3>
          <div className="space-y-3" data-testid="failure-reasons">
            {data.failureReasons.map((f) => (
              <div key={f.reason} data-testid={`failure-reason-row-${f.reason.replace(/\s+/g, '-').toLowerCase()}`}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">{f.reason}</span>
                  <span className="text-gray-500">{f.count} ({f.pct}%)</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 text-xs" data-testid="resolution-stats">
            <p className="font-semibold text-gray-700 mb-2">Resolution</p>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="font-bold text-green-600">{data.resolutionRate.resolved}</p>
                <p className="text-gray-400">Resolved</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-amber-600">{data.resolutionRate.inProgress}</p>
                <p className="text-gray-400">In Progress</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-red-600">{data.resolutionRate.open}</p>
                <p className="text-gray-400">Open</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Compliance View ──────────────────────────────────────────────────────────

function ComplianceView({ data }: { data: ComplianceReport }) {
  return (
    <div className="space-y-6" data-testid="compliance-report">
      <p className="text-xs text-gray-400">{data.title} · {data.period}</p>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-700">ACA 1095-C Status</h3>
          </div>
          <div className="space-y-2 text-xs" data-testid="aca-section">
            {[
              { label: 'Full-Time Employees', value: data.aca.totalFullTimeEmployees },
              { label: 'Forms 1095-C Generated', value: data.aca.forms1095cGenerated },
              { label: 'Filed to IRS', value: data.aca.forms1095cFiled, color: 'text-green-600' },
              { label: 'Pending Distribution', value: data.aca.forms1095cPending, color: data.aca.forms1095cPending > 0 ? 'text-amber-600' : 'text-gray-900' },
              { label: 'Form 1094-C', value: data.aca.form1094cStatus },
              { label: 'IRS Submission', value: data.aca.irsSubmissionDate },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-500">{label}</span>
                <span className={`font-semibold ${color ?? 'text-gray-700'}`}>{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-700">COBRA Summary</h3>
          </div>
          <div className="space-y-2 text-xs" data-testid="cobra-section">
            {[
              { label: 'Qualifying Events', value: data.cobra.totalQBEs },
              { label: 'Active', value: data.cobra.active },
              { label: 'Elected', value: data.cobra.elected, color: 'text-blue-600' },
              { label: 'Declined', value: data.cobra.declined },
              { label: 'Lapsed', value: data.cobra.lapsed, color: data.cobra.lapsed > 0 ? 'text-red-600' : 'text-gray-900' },
              { label: 'Notices On Time', value: data.cobra.noticesGeneratedOnTime, color: 'text-green-600' },
              { label: 'Monthly COBRA Cost', value: `$${data.cobra.monthlyCobraCost.toLocaleString()}` },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-500">{label}</span>
                <span className={`font-semibold ${color ?? 'text-gray-700'}`}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Open exceptions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Open Compliance Exceptions</h3>
        <div className="space-y-2" data-testid="compliance-exceptions">
          {data.openExceptions.map((exc) => (
            <div
              key={exc.id}
              className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-white"
              data-testid={`exception-row-${exc.id}`}
            >
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${exc.severity === 'High' ? 'text-red-500' : exc.severity === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-mono text-gray-400">{exc.id}</span>
                  <SeverityBadge severity={exc.severity} />
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{exc.type}</span>
                  <span className="text-[10px] text-gray-400">Due: {exc.dueDate}</span>
                </div>
                <p className="text-xs text-gray-700">{exc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit trail summary */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Audit Trail Summary</h3>
        <p className="text-xs text-gray-400 mb-3">{data.auditTrail.totalEvents} events this quarter</p>
        <div className="grid grid-cols-4 gap-3" data-testid="audit-trail-summary">
          {Object.entries(data.auditTrail.byType).map(([type, count]) => (
            <div key={type} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{count}</p>
              <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{type.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Hub ─────────────────────────────────────────────────────────────────

type View = 'executive' | 'enrollment' | 'carrier' | 'compliance';

export default function ReportsHub() {
  const [view, setView] = useState<View>('executive');

  const { data: executive, isLoading: execLoading } = useQuery({
    queryKey: ['reports', 'executive-summary'],
    queryFn: reportsApi.getExecutiveSummary,
    staleTime: 30_000,
  });

  const { data: enrollment, isLoading: enrollLoading } = useQuery({
    queryKey: ['reports', 'enrollment'],
    queryFn: reportsApi.getEnrollmentReport,
    staleTime: 30_000,
    enabled: view === 'enrollment',
  });

  const { data: carrierAudit, isLoading: carrierLoading } = useQuery({
    queryKey: ['reports', 'carrier-audit'],
    queryFn: reportsApi.getCarrierAuditReport,
    staleTime: 30_000,
    enabled: view === 'carrier',
  });

  const { data: compliance, isLoading: complianceLoading } = useQuery({
    queryKey: ['reports', 'compliance'],
    queryFn: reportsApi.getComplianceReport,
    staleTime: 30_000,
    enabled: view === 'compliance',
  });

  const VIEWS: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'executive', label: 'Executive Summary', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'enrollment', label: 'Enrollment', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'carrier', label: 'Carrier Audit', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'compliance', label: 'Compliance & ACA', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const isLoading =
    (view === 'executive' && execLoading) ||
    (view === 'enrollment' && enrollLoading) ||
    (view === 'carrier' && carrierLoading) ||
    (view === 'compliance' && complianceLoading);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Executive dashboard, enrollment analytics, carrier audit, and compliance reporting.
        </p>
      </div>

      {/* View switcher */}
      <div data-testid="reports-view-switcher" className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {VIEWS.map(({ id, label, icon }) => (
          <button
            key={id}
            data-testid={`reports-view-${id}`}
            onClick={() => setView(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${view === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {view === 'executive' && executive && <ExecutiveView data={executive} />}
          {view === 'enrollment' && enrollment && <EnrollmentView data={enrollment} />}
          {view === 'carrier' && carrierAudit && <CarrierAuditView data={carrierAudit} />}
          {view === 'compliance' && compliance && <ComplianceView data={compliance} />}
        </>
      )}
    </div>
  );
}
