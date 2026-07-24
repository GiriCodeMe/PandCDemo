import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Users, DollarSign, CheckCircle2, AlertCircle, BarChart2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';

function authHeaders() {
  const token = sessionStorage.getItem('persona_token') ?? 'P-001';
  return { Authorization: `Bearer ${token}` };
}

interface ExecutiveSummary {
  planYear: number;
  employees: { total: number; eligible: number; eligibilityRate: number };
  enrollment: { fullyEnrolled: number; enrollmentRate: number; exceptions: number };
  carrier: { successRate: number };
  payroll: { reconciliationExceptions: number };
}

async function fetchExecutiveSummary(): Promise<ExecutiveSummary> {
  const resp = await fetch('/api/reports/executive-summary', { headers: authHeaders() });
  const json = await resp.json();
  return json.data as ExecutiveSummary;
}

const WEEK_BARS = [
  { week: 'Sep 15', pct: 0 },
  { week: 'Sep 22', pct: 12 },
  { week: 'Sep 29', pct: 34 },
  { week: 'Oct 6', pct: 61 },
  { week: 'Oct 13', pct: 84 },
  { week: 'Oct 15', pct: 97.8, current: true },
];

export default function ExecutiveEnrollmentView() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['reports', 'executive-summary'],
    queryFn: fetchExecutiveSummary,
    staleTime: 60_000,
  });

  const enrollmentRate = summary?.enrollment.enrollmentRate ?? 97.8;
  const enrolled = summary?.enrollment.fullyEnrolled ?? 0;
  const eligible = summary?.employees.eligible ?? 0;
  const carrierSuccess = summary?.carrier.successRate ?? 94.3;
  const exceptions = summary?.enrollment.exceptions ?? 3;
  const payrollExceptions = summary?.payroll.reconciliationExceptions ?? 32;

  const kpis = [
    {
      label: 'Enrollment Rate',
      value: `${enrollmentRate.toFixed(1)}%`,
      sub: 'of eligible employees',
      icon: BarChart2,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      testid: 'executive-enrollment-rate',
    },
    {
      label: 'Employees Enrolled',
      value: enrolled.toLocaleString(),
      sub: `of ${eligible.toLocaleString()} eligible`,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Carrier Success',
      value: `${carrierSuccess.toFixed(1)}%`,
      sub: '1 open rejection (CT-10045)',
      icon: CheckCircle2,
      color: carrierSuccess >= 99 ? 'text-green-600' : 'text-amber-600',
      bg: carrierSuccess >= 99 ? 'bg-green-50' : 'bg-amber-50',
    },
    {
      label: 'Eligibility Exceptions',
      value: exceptions.toString(),
      sub: 'require HR review',
      icon: AlertCircle,
      color: exceptions === 0 ? 'text-green-600' : 'text-red-500',
      bg: exceptions === 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'Payroll Reconciliation',
      value: payrollExceptions.toString(),
      sub: 'deduction mismatches',
      icon: DollarSign,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'vs Last Year',
      value: '+2.3%',
      sub: 'enrollment rate improvement',
      icon: TrendingUp,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
  ];

  return (
    <div data-testid="enrollment-executive-view" className="space-y-6">
      {/* KPI Grid */}
      <div data-testid="executive-kpi-grid" className="grid grid-cols-3 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg, testid }) => (
          <Card key={label} className="p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p
              data-testid={testid}
              className="text-3xl font-extrabold text-gray-900 tracking-tight"
            >
              {isLoading ? '—' : value}
            </p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </Card>
        ))}
      </div>

      {/* Weekly pace chart */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-800">OE Completion Pace — 2026</h3>
          <span className="ml-auto text-xs text-gray-400">Weekly cumulative %</span>
        </div>
        <div className="flex items-end gap-3 h-28">
          {WEEK_BARS.map(({ week, pct, current }) => (
            <div key={week} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-gray-700">{pct > 0 ? `${pct}%` : ''}</span>
              <div className="w-full relative" style={{ height: `${Math.max(pct, 2)}%`, minHeight: pct > 0 ? 4 : 0 }}>
                <div
                  className={`w-full rounded-t-md ${current ? 'bg-brand-500' : 'bg-brand-200'} transition-all`}
                  style={{ height: `${Math.max(pct, 2) / 100 * 112}px` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 text-center leading-tight">{week}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Top issues */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Open Issues Requiring Attention</h3>
        <div className="space-y-2">
          {[
            { label: 'Carrier rejection — Linda White (ACM-E012)', severity: 'high', action: 'CT-10045 pending retry' },
            { label: `${payrollExceptions} payroll deduction mismatches`, severity: 'medium', action: 'Reconciliation required before Nov 1' },
            { label: `${exceptions} eligibility exceptions`, severity: 'medium', action: 'HR review pending' },
          ].map(({ label, severity, action }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${severity === 'high' ? 'bg-red-500' : 'bg-amber-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{action}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
