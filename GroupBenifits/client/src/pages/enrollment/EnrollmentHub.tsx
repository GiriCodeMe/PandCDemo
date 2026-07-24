import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ClipboardCheck, Users, BarChart2, Clock, AlertCircle,
  PlayCircle, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { enrollmentApi } from '../../api/enrollment';
import MyBenefits from './MyBenefits';
import EnrollmentWizard from './EnrollmentWizard';
import PlanComparison from './PlanComparison';

type View = 'overview' | 'wizard' | 'my-benefits' | 'comparison';

const VIEWS = [
  { id: 'overview' as View,      label: 'Enrollment Overview',  icon: BarChart2 },
  { id: 'my-benefits' as View,   label: 'My Benefits',          icon: ClipboardCheck },
  { id: 'comparison' as View,    label: 'Compare Plans',        icon: BarChart2 },
];

function ProgressBar({ value, total, color = 'bg-brand-500' }: { value: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-8 text-right">{pct}%</span>
    </div>
  );
}

const STATUS_BADGE: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-700',
  CLOSING_SOON: 'bg-amber-100 text-amber-700',
  CLOSED: 'bg-gray-100 text-gray-500',
  DRAFT: 'bg-gray-100 text-gray-500',
};

export default function EnrollmentHub() {
  const [view, setView] = useState<View>('overview');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardDone, setWizardDone] = useState(false);

  const { data: oePeriod, isLoading: oeLoading } = useQuery({
    queryKey: ['enrollment', 'open-period'],
    queryFn: () => enrollmentApi.getOpenPeriod('ACM-001'),
    staleTime: 30_000,
  });

  if (showWizard) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Open Enrollment Wizard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Plan Year 2027 · Acme Corp</p>
        </div>
        <EnrollmentWizard
          employeeId="ACM-E001"
          onComplete={() => {
            setShowWizard(false);
            setWizardDone(true);
            setView('my-benefits');
          }}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Enrollment</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Open enrollment period management, employee elections, and plan comparison.
        </p>
      </div>

      {/* View Switcher */}
      <div data-testid="enrollment-view-switcher" className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            data-testid={`enrollment-view-${id}`}
            onClick={() => setView(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {view === 'overview' && (
        <div className="space-y-5">
          {/* OE Period Banner */}
          {oeLoading ? (
            <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ) : oePeriod ? (
            <div className="p-5 bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[oePeriod.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {oePeriod.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold">{oePeriod.enrollmentName}</h2>
                  <p className="text-sm text-brand-200 mt-0.5">
                    {new Date(oePeriod.startDateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    {' – '}
                    {new Date(oePeriod.endDateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                {oePeriod.status === 'OPEN' && !wizardDone && (
                  <button
                    onClick={() => setShowWizard(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-brand-700 rounded-xl text-sm font-bold hover:bg-brand-50 transition-colors flex-shrink-0"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Enroll Now
                  </button>
                )}
                {wizardDone && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Submitted
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              No active open enrollment period found.
            </div>
          )}

          {/* Enrollment Progress */}
          {oePeriod && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-brand-500" />
                  <h3 className="text-sm font-semibold text-gray-700">Enrollment Progress</h3>
                  <span className="ml-auto text-xs text-gray-400">{oePeriod.progress.eligibleEmployees.toLocaleString()} eligible</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Submitted', value: oePeriod.progress.submitted, color: 'bg-green-500' },
                    { label: 'In Progress', value: oePeriod.progress.inProgress, color: 'bg-brand-400' },
                    { label: 'Not Started', value: oePeriod.progress.notStarted, color: 'bg-gray-300' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{label}</span>
                        <span className="font-semibold text-gray-700">{value.toLocaleString()}</span>
                      </div>
                      <ProgressBar value={value} total={oePeriod.progress.eligibleEmployees} color={color} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-700">Exceptions & Pending</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Eligibility exceptions', value: oePeriod.progress.exceptions, badge: 'bg-red-50 text-red-700' },
                    { label: 'Pending HR review', value: 18, badge: 'bg-amber-50 text-amber-700' },
                    { label: 'Plan version changes', value: 12, badge: 'bg-blue-50 text-blue-700' },
                  ].map(({ label, value, badge }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Enroll / Update Elections', desc: 'Open enrollment wizard', action: () => setShowWizard(true), icon: PlayCircle, disabled: wizardDone },
              { label: 'My Current Benefits', desc: 'View active elections', action: () => setView('my-benefits'), icon: ClipboardCheck, disabled: false },
              { label: 'Compare Plans', desc: 'Side-by-side plan comparison', action: () => setView('comparison'), icon: BarChart2, disabled: false },
            ].map(({ label, desc, action, icon: Icon, disabled }) => (
              <button
                key={label}
                onClick={action}
                disabled={disabled}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-brand-300 hover:bg-brand-50/30 text-left transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors" />
              </button>
            ))}
          </div>

          {/* Timeline */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-brand-500" />
              <h3 className="text-sm font-semibold text-gray-700">Enrollment Timeline</h3>
            </div>
            <div className="space-y-0">
              {[
                { date: 'Sep 15, 2026', label: 'Plan configuration published', done: true },
                { date: 'Oct 1, 2026', label: 'Open enrollment window opens', done: true },
                { date: 'Oct 10, 2026', label: 'Progress snapshot: 84% submitted', done: true },
                { date: 'Oct 15, 2026', label: 'Enrollment window closes', done: false },
                { date: 'Nov 1, 2026', label: 'Elections finalized with carriers', done: false },
                { date: 'Jan 1, 2027', label: 'Coverage effective date', done: false },
              ].map(({ date, label, done }, i) => (
                <div key={i} className="flex items-start gap-3 pb-3">
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${done ? 'bg-green-500' : 'bg-gray-200'}`}>
                    {done ? <CheckCircle2 className="w-3 h-3 text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium">{label}</p>
                    <p className="text-xs text-gray-400">{date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* My Benefits */}
      {view === 'my-benefits' && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">My Benefits — Plan Year 2027</h2>
          <MyBenefits employeeId="ACM-E001" />
        </div>
      )}

      {/* Plan Comparison */}
      {view === 'comparison' && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Medical Plan Comparison</h2>
          <PlanComparison initialPlans={['MED-PPO-500', 'MED-PPO-1000', 'MED-HDHP-3000']} />
        </div>
      )}
    </div>
  );
}
