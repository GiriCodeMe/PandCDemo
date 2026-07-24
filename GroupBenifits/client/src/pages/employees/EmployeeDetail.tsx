import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User, Heart, Eye, Shield, Briefcase } from 'lucide-react';
import { employeesApi } from '../../api/employees';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import StatusDot from '../../components/ui/StatusDot';
import type { Employee } from '../../types';

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
];

function avatarColor(id: string) {
  const n = parseInt(id.replace(/\D/g, ''), 10) || 0;
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function initials(first: string, last: string) {
  return (first[0] ?? '') + (last[0] ?? '');
}

function eligibilityVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status?.toLowerCase()) {
    case 'eligible': return 'success';
    case 'partial': return 'warning';
    case 'ineligible': case 'terminated': return 'error';
    default: return 'default';
  }
}

function enrollmentVariant(status: string): 'success' | 'warning' | 'info' | 'default' {
  switch (status?.toLowerCase()) {
    case 'enrolled': return 'success';
    case 'partial': return 'warning';
    case 'pending': return 'info';
    default: return 'default';
  }
}

interface CoveragePillProps {
  label: string;
  eligible: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

function CoveragePill({ label, eligible, icon: Icon }: CoveragePillProps) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${eligible ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}

export default function EmployeeDetail() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  const { data: employee, isLoading, isError } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => employeesApi.get(employeeId!),
    enabled: !!employeeId,
  });

  const { data: dependents, isLoading: depsLoading } = useQuery({
    queryKey: ['dependents', employeeId],
    queryFn: () => employeesApi.dependents(employeeId!),
    enabled: !!employeeId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Employee not found</p>
          <button onClick={() => navigate('/employees')} className="text-brand-600 hover:text-brand-700 text-sm">
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  const annualSalaryFmt = employee.annualSalary
    ? '$' + employee.annualSalary.toLocaleString()
    : '—';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${avatarColor(employee.employeeId)}`}>
            {initials(employee.firstName, employee.lastName)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h1>
              <Badge variant={eligibilityVariant(employee.eligibilityStatus)}>{employee.eligibilityStatus}</Badge>
              <Badge variant={enrollmentVariant(employee.enrollmentStatus)}>{employee.enrollmentStatus}</Badge>
            </div>
            <p className="text-gray-500 text-sm">{employee.email} · {employee.phone}</p>
            <p className="text-gray-400 text-xs mt-0.5">{employee.employeeId} · {employee.department} · {employee.location}</p>
          </div>
        </div>
      </div>

      {/* Coverage eligibility pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <CoveragePill label="Medical" eligible={employee.medicalEligible ?? false} icon={Heart} />
        <CoveragePill label="Dental" eligible={employee.dentalEligible ?? false} icon={Shield} />
        <CoveragePill label="Vision" eligible={employee.visionEligible ?? false} icon={Eye} />
        <CoveragePill label="Life" eligible={employee.lifeEligible ?? false} icon={Briefcase} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Employment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Employment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2.5 text-sm">
              {[
                { label: 'Hire Date', value: employee.hireDate },
                { label: 'Status', value: employee.employmentStatus },
                { label: 'Type', value: employee.employmentType ?? '—' },
                { label: 'Job Class', value: employee.jobClass ?? '—' },
                { label: 'Department', value: employee.department ?? '—' },
                { label: 'Hours / Week', value: employee.hoursPerWeek != null ? employee.hoursPerWeek + ' hrs' : '—' },
                { label: 'Annual Salary', value: annualSalaryFmt },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="text-gray-900 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2.5 text-sm">
              {[
                { label: 'Date of Birth', value: employee.dateOfBirth },
                { label: 'SSN', value: employee.ssn },
                { label: 'Location', value: employee.location },
                { label: 'Division', value: employee.divisionId ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="text-gray-900">{value}</dd>
                </div>
              ))}
              <div className="pt-1.5 border-t border-gray-100">
                <dt className="text-gray-500 mb-0.5">Address</dt>
                <dd className="text-gray-900 text-xs leading-relaxed">
                  {employee.address.street}<br />
                  {employee.address.city}, {employee.address.state} {employee.address.zip}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Dependents */}
      <Card>
        <CardHeader>
          <CardTitle>Dependents</CardTitle>
          {depsLoading && <Spinner size="sm" />}
        </CardHeader>
        <CardContent className="p-0">
          {!depsLoading && dependents && dependents.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Relationship</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date of Birth</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dependents.map((dep) => (
                  <tr key={dep.dependentId}>
                    <td className="px-4 py-3 font-medium text-gray-900">{dep.firstName} {dep.lastName}</td>
                    <td className="px-4 py-3 text-gray-600">{dep.relationship}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{dep.dob}</td>
                    <td className="px-4 py-3">
                      <StatusDot
                        status={dep.status === 'Active' ? 'active' : 'inactive'}
                        label={dep.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : !depsLoading ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">No dependents on file</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
