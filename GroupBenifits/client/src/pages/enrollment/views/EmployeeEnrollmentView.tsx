import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, ClipboardCheck, BarChart2, PlayCircle } from 'lucide-react';
import type { Persona } from '../../../types';
import { enrollmentApi } from '../../../api/enrollment';
import MyBenefits from '../MyBenefits';
import EnrollmentWizard from '../EnrollmentWizard';
import PlanComparison from '../PlanComparison';

type Tab = 'my-benefits' | 'enroll' | 'compare';

const TABS = [
  { id: 'my-benefits' as Tab, label: 'My Benefits', icon: ClipboardCheck },
  { id: 'enroll' as Tab,      label: 'Open Enrollment', icon: PlayCircle },
  { id: 'compare' as Tab,     label: 'Compare Plans', icon: BarChart2 },
];

interface Props {
  persona: Persona;
}

export default function EmployeeEnrollmentView({ persona }: Props) {
  const employeeId = persona.employeeId ?? 'ACM-E004';
  const [tab, setTab] = useState<Tab>('my-benefits');
  const [wizardDone, setWizardDone] = useState(false);

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', 'employee', employeeId],
    queryFn: () => enrollmentApi.getByEmployee(employeeId),
    staleTime: 30_000,
  });

  const isPending = enrollment?.enrollment?.status === 'Pending' || !enrollment?.enrollment;

  return (
    <div data-testid="enrollment-employee-view" className="space-y-5">
      {/* Waiting period banner */}
      {isPending && (
        <div
          data-testid="employee-waiting-period-banner"
          className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">New Hire Waiting Period</p>
            <p className="text-sm text-amber-700 mt-0.5">
              You are within your 30-day new hire waiting period. Coverage begins{' '}
              <strong>January 1, 2027</strong>. You may still complete your elections now — they will
              take effect on your coverage start date.
            </p>
          </div>
        </div>
      )}

      {/* Enrolled confirmation */}
      {wizardDone && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-green-800">
            Elections submitted successfully. Effective January 1, 2027.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div
        data-testid="employee-enrollment-tabs"
        className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit"
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'my-benefits' && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            My Benefits — Plan Year 2027
          </h2>
          <MyBenefits employeeId={employeeId} />
        </div>
      )}

      {tab === 'enroll' && (
        <div className="max-w-3xl">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-gray-800">Open Enrollment Wizard</h2>
            <p className="text-sm text-gray-500 mt-0.5">Plan Year 2027 · Acme Corp</p>
          </div>
          <EnrollmentWizard
            employeeId={employeeId}
            onComplete={() => {
              setWizardDone(true);
              setTab('my-benefits');
            }}
            onCancel={() => setTab('my-benefits')}
          />
        </div>
      )}

      {tab === 'compare' && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-4">Medical Plan Comparison</h2>
          <PlanComparison initialPlans={['MED-PPO-500', 'MED-PPO-1000', 'MED-HDHP-3000']} />
        </div>
      )}
    </div>
  );
}
