import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, User, ChevronRight } from 'lucide-react';
import { employeesApi } from '../../api/employees';
import { Card, CardContent } from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

type EligibilityStatus = string;

function eligibilityVariant(status: EligibilityStatus): 'success' | 'warning' | 'error' | 'default' {
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

function initials(first: string, last: string) {
  return (first[0] ?? '') + (last[0] ?? '');
}

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

export default function EmployeeDirectory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: employees, isLoading, isError, error } = useQuery({
    queryKey: ['employees', search],
    queryFn: () => employeesApi.list('ACM-001', search || undefined),
    staleTime: 30_000,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">
            {employees?.length ?? 0} employee(s) — Acme Corporation
          </p>
        </div>
        <div className="relative w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employees..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-400 bg-white"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center h-48">
          <p className="text-red-600 text-sm">{(error as Error)?.message ?? 'Failed to load employees'}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Department</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Type</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Eligibility</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Enrollment</th>
                <th className="px-4 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees?.map((emp, idx) => (
                <tr
                  key={emp.employeeId}
                  onClick={() => navigate('/employees/' + emp.employeeId)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor(emp.employeeId)}`}>
                        {initials(emp.firstName, emp.lastName)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{emp.department ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{emp.employmentType ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={eligibilityVariant(emp.eligibilityStatus)}>{emp.eligibilityStatus}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant={enrollmentVariant(emp.enrollmentStatus)}>{emp.enrollmentStatus}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {employees?.length === 0 && (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
              No employees match your search
            </div>
          )}
        </div>
      )}
    </div>
  );
}
