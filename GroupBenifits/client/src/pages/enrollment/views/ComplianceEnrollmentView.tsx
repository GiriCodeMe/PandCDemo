import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import type { Employee, Enrollment } from '../../../types';
import { enrollmentApi } from '../../../api/enrollment';

function authHeaders() {
  const token = sessionStorage.getItem('persona_token') ?? 'P-001';
  return { Authorization: `Bearer ${token}` };
}

async function fetchEmployees(): Promise<Employee[]> {
  const resp = await fetch('/api/employees', { headers: authHeaders() });
  const json = await resp.json();
  return (Array.isArray(json.data) ? json.data : []) as Employee[];
}

interface EvidenceItem {
  check: string;
  passed: boolean;
}

const EVIDENCE: Record<string, EvidenceItem[]> = {
  'ACM-E012': [
    { check: 'Hire Date verified', passed: true },
    { check: 'Employment Class eligible', passed: true },
    { check: 'Hours per week ≥ 30', passed: true },
    { check: 'Carrier enrollment accepted', passed: false },
  ],
};

function defaultEvidence(emp: Employee): EvidenceItem[] {
  return [
    { check: 'Hire Date verified', passed: true },
    { check: 'Employment Class eligible', passed: emp.eligibilityStatus === 'Eligible' },
    { check: `Hours per week ≥ 30 (${emp.hoursPerWeek ?? '—'})`, passed: (emp.hoursPerWeek ?? 40) >= 30 },
    { check: 'Carrier enrollment accepted', passed: emp.enrollmentStatus === 'Active' },
  ];
}

function getDecision(emp: Employee, enrollments: Enrollment[]): { label: string; variant: 'success' | 'error' | 'warning' | 'default' } {
  if (emp.employeeId === 'ACM-E012') return { label: 'Blocked', variant: 'error' };
  const enr = enrollments.find((e) => e.employeeId === emp.employeeId);
  if (!enr) return { label: 'No Record', variant: 'default' };
  if (enr.status === 'Active') return { label: 'Approved', variant: 'success' };
  if (enr.status === 'Pending') return { label: 'Pending', variant: 'warning' };
  return { label: enr.status, variant: 'default' };
}

export default function ComplianceEnrollmentView() {
  const [expanded, setExpanded] = useState<string | null>('ACM-E012');

  const { data: employees = [] } = useQuery({
    queryKey: ['employees', 'all'],
    queryFn: fetchEmployees,
    staleTime: 30_000,
  });

  const { data: allEnrollments } = useQuery({
    queryKey: ['enrollment', 'all'],
    queryFn: () => enrollmentApi.getAll('ACM-001'),
    staleTime: 30_000,
  });

  const enrollments = allEnrollments?.enrollments ?? [];

  const auditRows = employees.slice(0, 12);

  return (
    <div data-testid="enrollment-compliance-view" className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-3 p-4 bg-brand-50 border border-brand-200 rounded-xl">
        <Shield className="w-5 h-5 text-brand-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-brand-800">Eligibility Audit — Plan Year 2027</p>
          <p className="text-xs text-brand-600 mt-0.5">
            {auditRows.length} eligibility decisions on record · Rule version 2.1 · Last reviewed Oct 15, 2026
          </p>
        </div>
        <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full bg-brand-100 text-brand-700">
          {auditRows.length} records
        </span>
      </div>

      {/* Audit table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table data-testid="compliance-audit-table" className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Rule Ver.</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Decision</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Effective</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {auditRows.map((emp: Employee) => {
                const decision = getDecision(emp, enrollments);
                const isLinda = emp.employeeId === 'ACM-E012';
                const isExpanded = expanded === emp.employeeId;
                const evidence = EVIDENCE[emp.employeeId] ?? defaultEvidence(emp);
                return (
                  <React.Fragment key={emp.employeeId}>
                    <tr
                      data-testid={`compliance-row-${emp.employeeId}`}
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${isLinda ? 'bg-amber-50/70' : ''}`}
                      onClick={() => setExpanded(isExpanded ? null : emp.employeeId)}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-800">
                            {emp.firstName} {emp.lastName}
                            {isLinda && (
                              <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">Demo</span>
                            )}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">{emp.employeeId}</p>
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500 font-mono">v2.1</td>
                      <td className="px-5 py-3">
                        <Badge variant={decision.variant}>{decision.label}</Badge>
                        {isLinda && (
                          <p className="text-[10px] text-red-600 mt-0.5 font-medium">Carrier rejection pending</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-gray-500">Jan 1, 2027</td>
                      <td className="px-5 py-3">
                        <button className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          {isExpanded ? 'Hide' : 'View'}
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="px-5 pb-4 pt-0 bg-gray-50/50">
                          <div
                            data-testid={emp.employeeId === 'ACM-E012' ? 'compliance-detail-panel' : undefined}
                            className="mt-2 p-4 bg-white border border-gray-200 rounded-xl"
                          >
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Evidence Trail</p>
                            <div className="space-y-2">
                              {evidence.map(({ check, passed }) => (
                                <div key={check} className="flex items-center gap-2.5">
                                  {passed
                                    ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                                  <span className={`text-xs ${passed ? 'text-gray-700' : 'text-red-700 font-semibold'}`}>
                                    {check}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {isLinda && (
                              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-amber-700">
                                    <strong>Blocker:</strong> Carrier transaction CT-10045 rejected — invalid dependent ID submitted to Aetna.
                                    HR must correct dependent record and resubmit before coverage can be confirmed.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
