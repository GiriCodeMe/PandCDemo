import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, ChevronRight } from 'lucide-react';
import { employersApi } from '../../api/employers';
import { Card, CardContent } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import StatusDot from '../../components/ui/StatusDot';

function statusToVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status?.toUpperCase()) {
    case 'ACTIVE': return 'success';
    case 'PENDING': return 'warning';
    case 'INACTIVE': return 'error';
    default: return 'default';
  }
}

function statusToDot(status: string): 'active' | 'inactive' | 'pending' | 'error' {
  switch (status?.toUpperCase()) {
    case 'ACTIVE': return 'active';
    case 'INACTIVE': return 'inactive';
    case 'PENDING': return 'pending';
    default: return 'inactive';
  }
}

export default function EmployerDirectory() {
  const navigate = useNavigate();

  const { data: employers, isLoading, isError, error } = useQuery({
    queryKey: ['employers'],
    queryFn: employersApi.list,
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
          <p className="text-red-600 font-medium mb-1">Failed to load employers</p>
          <p className="text-gray-500 text-sm">{(error as Error)?.message ?? 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employers</h1>
        <p className="text-gray-500 text-sm mt-1">{employers?.length ?? 0} employer(s)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {employers?.map((employer) => (
          <button
            key={employer.employerId}
            onClick={() => navigate(`/employers/${employer.employerId}`)}
            className="text-left w-full group"
          >
            <Card className="hover:border-brand-300 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-700 transition-colors">
                        {employer.name}
                      </h2>
                      <p className="text-xs text-gray-400 truncate">{employer.employerId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant={statusToVariant(employer.status)}>{employer.status}</Badge>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
                  </div>
                </div>

                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Industry</dt>
                    <dd className="text-gray-700 truncate ml-4 max-w-[60%] text-right">{employer.industry}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">States</dt>
                    <dd className="text-gray-700">{employer.states.join(', ')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Active Employees</dt>
                    <dd className="text-gray-900 font-medium">{employer.activeEmployees.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Plan Year</dt>
                    <dd className="text-gray-700">{employer.effectiveDate} – {employer.renewalDate}</dd>
                  </div>
                </dl>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <StatusDot
                    status={statusToDot(employer.status)}
                    label={employer.payrollFrequency + ' payroll'}
                  />
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {employers?.length === 0 && (
        <div className="flex items-center justify-center h-48 text-gray-400">
          No employers found
        </div>
      )}
    </div>
  );
}
