import React, { useState, useEffect } from 'react';
import { Users, Check, Brain, AlertTriangle, X } from 'lucide-react';
import { WizardState, EnrollmentRecord, EnrollmentException } from '../types';
import { SmartTip } from '../SmallBusinessWizard';

interface Props {
  state: WizardState;
  update: (partial: Partial<WizardState>) => void;
}

function generateExceptions(state: WizardState): EnrollmentException[] {
  const exceptions: EnrollmentException[] = [];
  const employees = state.census.employees.filter((e) => e.selected);
  for (const emp of employees) {
    if (emp.employmentClass === 'PART_TIME' || emp.weeklyHours < 30) {
      exceptions.push({
        employeeId: emp.id,
        employeeName: emp.name,
        message: `${emp.weeklyHours < 30 ? `Only ${emp.weeklyHours} weekly hours — below 30-hour eligibility threshold` : 'Part-time classification — verify eligibility under plan rules'}.`,
        severity: 'warning',
        resolved: false,
      });
    }
  }
  return exceptions;
}

export default function Step5Enrollment({ state, update }: Props) {
  const [bulkApplied, setBulkApplied] = useState(false);
  const [aiDismissed, setAiDismissed] = useState(false);

  const employees = state.census.employees.filter((e) => e.selected);
  const products = state.products;

  useEffect(() => {
    if (state.enrollmentExceptions.length === 0 && employees.length > 0) {
      const ex = generateExceptions(state);
      if (ex.length > 0) update({ enrollmentExceptions: ex, applicationStatus: 'ENROLLMENT_IN_PROGRESS' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function isEnrolled(employeeId: string, productId: string): boolean {
    return state.enrollments.some((r) => r.employeeId === employeeId && r.productId === productId && r.enrolled);
  }

  function toggle(employeeId: string, productId: string) {
    const existing = state.enrollments.find((r) => r.employeeId === employeeId && r.productId === productId);
    if (existing) {
      update({ enrollments: state.enrollments.map((r) => r.employeeId === employeeId && r.productId === productId ? { ...r, enrolled: !r.enrolled } : r) });
    } else {
      update({ enrollments: [...state.enrollments, { employeeId, productId, enrolled: true }] });
    }
  }

  function bulkEnrollAll() {
    const records: EnrollmentRecord[] = [];
    for (const emp of employees) {
      for (const prod of products) {
        records.push({ employeeId: emp.id, productId: prod.productId, enrolled: true });
      }
    }
    update({ enrollments: records });
    setBulkApplied(true);
    setTimeout(() => setBulkApplied(false), 2500);
  }

  function resolveException(employeeId: string) {
    update({
      enrollmentExceptions: state.enrollmentExceptions.map((e) =>
        e.employeeId === employeeId ? { ...e, resolved: true } : e
      ),
    });
  }

  function getEnrollmentCount(productId: string): number {
    return employees.filter((e) => isEnrolled(e.id, productId)).length;
  }

  const openExceptions = state.enrollmentExceptions.filter((e) => !e.resolved);
  const totalEnrolled = state.enrollments.filter((r) => r.enrolled).length;

  if (employees.length === 0 || products.length === 0) {
    return (
      <div data-testid="step-enrollment" className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Employee Enrollment</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          {employees.length === 0 ? 'No employees selected. Go back to Census.' : 'No benefits selected. Go back to Benefits.'}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="step-enrollment" className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Employee Enrollment</h2>
        <p className="text-sm text-gray-500 mt-1">Assign benefits to employees. The AI assistant flags exceptions and missing elections proactively.</p>
      </div>

      <SmartTip>
        Bulk Enroll applies all selected benefits to all eligible employees. Employees with eligibility exceptions are flagged below for your review before submission.
      </SmartTip>

      {/* AI Enrollment Assistant */}
      {!aiDismissed && (
        <div className="border border-violet-200 bg-violet-50 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-violet-200">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-800">AI Enrollment Assistant</span>
            </div>
            <button onClick={() => setAiDismissed(true)} className="text-violet-400 hover:text-violet-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 py-3 space-y-2">
            {openExceptions.length > 0 ? (
              <>
                <p className="text-xs text-violet-700 mb-2">I found {openExceptions.length} enrollment exception{openExceptions.length !== 1 ? 's' : ''} that need your attention:</p>
                {openExceptions.map((ex) => (
                  <div key={ex.employeeId} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${ex.severity === 'error' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                    <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${ex.severity === 'error' ? 'text-red-500' : 'text-amber-500'}`} />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">{ex.employeeName}</span>
                      <span className="text-gray-600"> — {ex.message}</span>
                    </div>
                    <button onClick={() => resolveException(ex.employeeId)} className="text-[10px] font-medium text-brand-600 hover:text-brand-800 whitespace-nowrap">Mark Reviewed</button>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <Check className="w-3.5 h-3.5" />
                All {employees.length} employees are eligible — no exceptions detected. You're cleared to enroll.
              </div>
            )}
            <div className="text-xs text-violet-600 mt-2 border-t border-violet-100 pt-2">
              <span className="font-semibold">Proactive check:</span> {totalEnrolled} of {employees.length * products.length} possible enrollments recorded.
              {totalEnrolled === 0 && ' Use Bulk Enroll to enroll all employees at once.'}
            </div>
          </div>
        </div>
      )}

      {/* Stats + Bulk action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{employees.length} employees · {products.length} benefits</span>
          {openExceptions.length > 0 && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">{openExceptions.length} exception{openExceptions.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <button
          onClick={bulkEnrollAll}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${bulkApplied ? 'bg-emerald-600 text-white' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
        >
          {bulkApplied ? <><Check className="w-4 h-4" /> Enrolled!</> : 'Bulk Enroll All'}
        </button>
      </div>

      {/* Progress bars per product */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {products.map((prod) => {
          const count = getEnrollmentCount(prod.productId);
          const pct = employees.length > 0 ? Math.round((count / employees.length) * 100) : 0;
          return (
            <div key={prod.productId} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-700">{prod.name}</span>
                <span className="text-xs text-gray-500">{count}/{employees.length} ({pct}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div className="bg-brand-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Enrollment grid */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="w-full text-xs min-w-max">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="sticky left-0 bg-gray-50 px-3 py-2.5 text-left font-semibold text-gray-600 w-40 border-r border-gray-200">Employee</th>
              {products.map((prod) => (
                <th key={prod.productId} className="px-3 py-2.5 text-center font-medium text-gray-600 min-w-[90px]">
                  <div className="leading-tight">{prod.name}</div>
                  {prod.selectedPlan && <div className="text-[9px] text-gray-400 font-normal">{prod.selectedPlan.price}</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map((emp) => {
              const hasException = openExceptions.some((e) => e.employeeId === emp.id);
              return (
                <tr key={emp.id} className={`hover:bg-gray-50/50 ${hasException ? 'border-l-2 border-amber-300' : ''}`}>
                  <td className="sticky left-0 bg-white px-3 py-2.5 border-r border-gray-100">
                    <div className="flex items-center gap-1.5">
                      {hasException && <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                      <div>
                        <div className="font-medium text-gray-900">{emp.name}</div>
                        <div className="text-[10px] text-gray-400">{emp.jobTitle}</div>
                      </div>
                    </div>
                  </td>
                  {products.map((prod) => {
                    const enrolled = isEnrolled(emp.id, prod.productId);
                    const isStatutory = prod.type === 'statutory';
                    return (
                      <td key={prod.productId} className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => !isStatutory && toggle(emp.id, prod.productId)}
                          disabled={isStatutory}
                          title={isStatutory ? 'Statutory — required' : enrolled ? 'Click to waive' : 'Click to enroll'}
                          className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto transition-all ${isStatutory ? 'bg-emerald-100 cursor-default' : enrolled ? 'bg-brand-500 hover:bg-brand-600' : 'border-2 border-gray-300 hover:border-brand-400'}`}
                        >
                          {(enrolled || isStatutory) && <Check className={`w-3.5 h-3.5 ${isStatutory ? 'text-emerald-600' : 'text-white'}`} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-gray-400">
        Green = statutory (auto-enrolled). Blue = voluntary enrolled. Empty = waived. Yellow border = eligibility exception — review before submitting.
      </p>
    </div>
  );
}
