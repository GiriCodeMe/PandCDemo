import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, DollarSign, Heart, Eye, Smile, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { enrollmentApi } from '../../api/enrollment';
import type { EnrollmentElection } from '../../types';

const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  Medical: <Heart className="w-4 h-4 text-red-500" />,
  Dental: <Smile className="w-4 h-4 text-blue-500" />,
  Vision: <Eye className="w-4 h-4 text-purple-500" />,
  Life: <Shield className="w-4 h-4 text-green-500" />,
  HSA: <DollarSign className="w-4 h-4 text-yellow-500" />,
};

const STATUS_COLOR: Record<string, string> = {
  Active: 'bg-green-50 text-green-700 border border-green-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Terminated: 'bg-red-50 text-red-700 border border-red-200',
};

function ElectionCard({ election }: { election: EnrollmentElection }) {
  const icon = PRODUCT_ICONS[election.productType] ?? <Shield className="w-4 h-4 text-gray-400" />;
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white hover:border-brand-200 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{election.productType}</p>
        <p className="text-xs text-gray-500 truncate">{election.planCode} · {election.tierType}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">${election.monthlyEmployeeContribution}/mo</p>
        <p className="text-xs text-gray-400">employee cost</p>
      </div>
    </div>
  );
}

interface MyBenefitsProps {
  employeeId?: string;
}

export default function MyBenefits({ employeeId = 'ACM-E001' }: MyBenefitsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['enrollment', 'employee', employeeId],
    queryFn: () => enrollmentApi.getByEmployee(employeeId),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">No enrollment record found for this employee.</span>
      </div>
    );
  }

  const { enrollment, premiumSummary } = data;

  return (
    <div className="space-y-5">
      {/* Status Banner */}
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">Benefits Active for Plan Year {enrollment.planYear}</p>
          <p className="text-xs text-green-600">
            Effective {enrollment.effectiveDate} · Source: {enrollment.enrollmentSource}
          </p>
        </div>
        <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[enrollment.status] ?? STATUS_COLOR.Pending}`}>
          {enrollment.status}
        </span>
      </div>

      {/* Premium Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">${premiumSummary.monthlyEmployeeTotal}</p>
          <p className="text-xs text-gray-500 mt-0.5">Your monthly cost</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-brand-600">${premiumSummary.monthlyEmployerTotal}</p>
          <p className="text-xs text-gray-500 mt-0.5">Employer contribution</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">${premiumSummary.perPaycheck}</p>
          <p className="text-xs text-gray-500 mt-0.5">Per paycheck (26/yr)</p>
        </Card>
      </div>

      {/* Elections */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Elections</h3>
        <div className="space-y-2">
          {enrollment.elections.map((election) => (
            <ElectionCard key={election.planCode} election={election} />
          ))}
          {enrollment.elections.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No elections on file.</p>
          )}
        </div>
      </div>
    </div>
  );
}
