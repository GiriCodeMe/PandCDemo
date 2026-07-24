import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { employersApi } from '../../api/employers';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import type { PlanYear } from '../../types';

function planYearStatusVariant(status: PlanYear['status']): 'default' | 'success' | 'warning' | 'info' | 'error' {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'OPEN_ENROLLMENT': return 'warning';
    case 'DRAFT':
    case 'CONFIGURATION': return 'info';
    default: return 'default';
  }
}

function employerStatusVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status?.toUpperCase()) {
    case 'ACTIVE': return 'success';
    case 'PENDING': return 'warning';
    case 'INACTIVE': return 'error';
    default: return 'default';
  }
}

export default function EmployerDetail() {
  const { employerId } = useParams<{ employerId: string }>();
  const navigate = useNavigate();

  const { data: employer, isLoading: employerLoading, isError: employerError } = useQuery({
    queryKey: ['employer', employerId],
    queryFn: () => employersApi.get(employerId!),
    enabled: !!employerId,
  });

  const { data: planYears, isLoading: planYearsLoading } = useQuery({
    queryKey: ['plan-years', employerId],
    queryFn: () => employersApi.planYears(employerId!),
    enabled: !!employerId,
  });

  if (employerLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (employerError || !employer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-1">Failed to load employer</p>
          <button onClick={() => navigate('/employers')} className="text-brand-600 hover:text-brand-700 text-sm">
            Back to Employers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/employers')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employers
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{employer.name}</h1>
          <Badge variant={employerStatusVariant(employer.status)}>{employer.status}</Badge>
        </div>
        <p className="text-gray-400 text-sm mt-1">{employer.employerId}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Employer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Industry</dt>
                <dd className="text-gray-900">{employer.industry}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Address</dt>
                <dd className="text-gray-900 text-right">
                  {employer.address.street}<br />
                  {employer.address.city}, {employer.address.state} {employer.address.zip}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">States</dt>
                <dd className="text-gray-900">{employer.states.join(', ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Payroll Frequency</dt>
                <dd className="text-gray-900">{employer.payrollFrequency}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Counts</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Total Employees</dt>
                <dd className="text-gray-900 font-medium">{employer.numberOfEmployees.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Active Employees</dt>
                <dd className="text-emerald-700 font-medium">{employer.activeEmployees.toLocaleString()}</dd>
              </div>
              <div className="border-t border-gray-100 pt-2.5 flex justify-between">
                <dt className="text-gray-500">Effective Date</dt>
                <dd className="text-gray-900">{employer.effectiveDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Renewal Date</dt>
                <dd className="text-gray-900">{employer.renewalDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Enrollment Period</dt>
                <dd className="text-gray-900 text-right">
                  {employer.enrollmentPeriodStart} – {employer.enrollmentPeriodEnd}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Years</CardTitle>
          {planYearsLoading && <Spinner size="sm" />}
        </CardHeader>
        <CardContent className="p-0">
          {!planYearsLoading && planYears && planYears.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left bg-gray-50">
                    <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Period</th>
                    <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Period</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {planYears.map((py) => (
                    <tr key={py.planYearId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{py.year}</td>
                      <td className="px-4 py-3">
                        <Badge variant={planYearStatusVariant(py.status)}>
                          {py.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{py.startDate} – {py.endDate}</td>
                      <td className="px-4 py-3 text-gray-600">{py.openEnrollmentStart} – {py.openEnrollmentEnd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !planYearsLoading ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">No plan years found</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
