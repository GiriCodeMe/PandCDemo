import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, Clock, Settings, Shield, Calendar, ArrowRight, BarChart2,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { enrollmentApi } from '../../../api/enrollment';

const PIPELINE_STEPS = [
  { key: 'configure', label: 'Configure Plans',    desc: '3 products · 8 plans' },
  { key: 'rates',     label: 'Set Rates',          desc: 'Rate versions current' },
  { key: 'eligibility', label: 'Eligibility Rules', desc: '5 rules active' },
  { key: 'window',    label: 'OE Window',          desc: 'Oct 1 – Oct 15, 2026' },
  { key: 'published', label: 'Published',          desc: 'Employees notified' },
];

function ProgressBar({ value, total, color = 'bg-brand-500' }: { value: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function BenefitsAdminEnrollmentView() {
  const { data: oePeriod } = useQuery({
    queryKey: ['enrollment', 'open-period'],
    queryFn: () => enrollmentApi.getOpenPeriod('ACM-001'),
    staleTime: 30_000,
  });

  const progress = oePeriod?.progress;
  const total = progress?.eligibleEmployees ?? 100;

  return (
    <div data-testid="enrollment-benefits-admin-view" className="space-y-6">
      {/* Plan Year Pipeline */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-5">
          <Settings className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-800">Plan Year 2027 — Configuration Pipeline</h3>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Published</span>
        </div>
        <div data-testid="plan-year-pipeline" className="flex items-start gap-0">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.key} className="flex-1 flex items-start gap-0 min-w-0">
              <div className="flex flex-col items-center w-full min-w-0">
                <div className="flex items-center w-full">
                  <div className="w-7 h-7 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 bg-green-300 mx-1" />
                  )}
                </div>
                <div className="mt-2 px-1 w-full">
                  <p className="text-xs font-semibold text-gray-700 truncate">{step.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Enrollment Completion */}
      {progress && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-800">Enrollment Completion — OE 2026</h3>
            <span className="ml-auto text-xs text-gray-400">{total.toLocaleString()} eligible</span>
          </div>
          <div data-testid="enrollment-progress-bar" className="space-y-3">
            {[
              { label: 'Completed', value: progress.submitted + progress.completed, color: 'bg-green-500' },
              { label: 'In Progress', value: progress.inProgress, color: 'bg-brand-400' },
              { label: 'Not Started', value: progress.notStarted, color: 'bg-gray-300' },
              { label: 'Exceptions', value: progress.exceptions, color: 'bg-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{label}</span>
                  <span className="font-semibold text-gray-700">{value.toLocaleString()}</span>
                </div>
                <ProgressBar value={value} total={total} color={color} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Plan Configuration', desc: 'Manage products, plans, and rates', icon: Settings, href: '/plans' },
          { label: 'Eligibility Rules', desc: 'Waiting periods, class conditions', icon: Shield, href: '/employees' },
          { label: 'Enrollment Analytics', desc: 'Reports and executive summary', icon: BarChart2, href: '/reports' },
        ].map(({ label, desc, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-brand-300 hover:bg-brand-50/30 transition-colors group cursor-pointer"
          >
            <Icon className="w-5 h-5 text-brand-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors" />
          </div>
        ))}
      </div>

      {/* Timeline reminder */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-800">OE Calendar</h3>
        </div>
        <div className="space-y-0">
          {[
            { date: 'Sep 15, 2026', label: 'Plan configuration published', done: true },
            { date: 'Oct 1, 2026',  label: 'Open enrollment window opens', done: true },
            { date: 'Oct 15, 2026', label: 'Enrollment window closes', done: false },
            { date: 'Nov 1, 2026',  label: 'Elections finalized with carriers', done: false },
            { date: 'Jan 1, 2027',  label: 'Coverage effective date', done: false },
          ].map(({ date, label, done }, i) => (
            <div key={i} className="flex items-start gap-3 pb-3">
              <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${done ? 'bg-green-500' : 'bg-gray-200'}`}>
                {done ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-gray-400" />}
              </div>
              <div>
                <p className="text-sm text-gray-800 font-medium">{label}</p>
                <p className="text-xs text-gray-400">{date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
