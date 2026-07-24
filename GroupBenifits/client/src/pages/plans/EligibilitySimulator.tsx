import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, CheckCircle2, XCircle, AlertTriangle, ChevronDown, User } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { eligibilityApi } from '../../api/planConfig';
import Badge from '../../components/ui/Badge';
import type { EligibilityRule } from '../../types';

function authHeader() {
  return { Authorization: `Bearer ${sessionStorage.getItem('persona_token') ?? 'P-001'}` };
}

async function fetchEmployees() {
  const res = await fetch('/api/employees', { headers: authHeader() });
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

interface SimResult {
  eligible: boolean;
  failedConditions: { field: string; operator: string; value: unknown }[];
  waitingPeriodEndDate?: string;
  effectiveCoverageDate?: string;
  rule?: EligibilityRule;
}

const WAITING_PERIOD_LABELS: Record<string, string> = {
  FirstOfMonthFollowing30: '1st of month after 30 days',
  Immediate: 'Immediate',
  Days30: '30 calendar days',
  Days60: '60 calendar days',
  Days90: '90 calendar days',
};

const OP_LABEL: Record<string, string> = {
  equals: '=', in: 'in', greater_than_or_equal: '≥', less_than_or_equal: '≤',
};

function calcWaitingPeriodEnd(hireDate: string, wpType: string): string {
  const d = new Date(hireDate);
  if (!hireDate || isNaN(d.getTime())) return 'N/A';
  switch (wpType) {
    case 'Immediate': return hireDate;
    case 'Days30': {
      d.setDate(d.getDate() + 30);
      return d.toISOString().slice(0, 10);
    }
    case 'Days60': {
      d.setDate(d.getDate() + 60);
      return d.toISOString().slice(0, 10);
    }
    case 'Days90': {
      d.setDate(d.getDate() + 90);
      return d.toISOString().slice(0, 10);
    }
    case 'FirstOfMonthFollowing30': {
      d.setDate(d.getDate() + 30);
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().slice(0, 10);
    }
    default: return 'N/A';
  }
}

function firstOfNextMonth(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export default function EligibilitySimulator() {
  const [selectedRule, setSelectedRule] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [customData, setCustomData] = useState({
    employmentType: 'Full-Time',
    hoursPerWeek: '40',
    jobClass: 'Professional',
    employmentStatus: 'Active',
    hireDate: '2026-01-15',
    annualSalary: '75000',
  });
  const [mode, setMode] = useState<'employee' | 'custom'>('custom');
  const [result, setResult] = useState<SimResult | null>(null);
  const [running, setRunning] = useState(false);

  const { data: rules = [] } = useQuery({
    queryKey: ['eligibility-rules', 'ACM-001'],
    queryFn: () => eligibilityApi.getRules('ACM-001'),
    staleTime: 60_000,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
    staleTime: 60_000,
  });

  const activeRule = rules.find((r) => r.ruleId === selectedRule);

  async function runSimulation() {
    if (!selectedRule) return;
    setRunning(true);
    setResult(null);

    let payload: Record<string, unknown> = { ...customData, hoursPerWeek: Number(customData.hoursPerWeek), annualSalary: Number(customData.annualSalary) };

    if (mode === 'employee' && selectedEmployee) {
      const emp = (employees as Record<string, unknown>[]).find((e) => (e as Record<string, string>).employeeId === selectedEmployee);
      if (emp) {
        payload = {
          employmentType: (emp as Record<string, string>).employmentType ?? (emp as Record<string, string>).employmentStatus,
          hoursPerWeek: (emp as Record<string, number>).hoursPerWeek ?? 40,
          jobClass: (emp as Record<string, string>).jobClass ?? 'Professional',
          employmentStatus: (emp as Record<string, string>).employmentStatus ?? 'Active',
          hireDate: (emp as Record<string, string>).hireDate,
          annualSalary: (emp as Record<string, number>).annualSalary ?? 0,
        };
      }
    }

    try {
      const res = await eligibilityApi.evaluate(selectedRule, payload);
      const rawResult = res as unknown as {
        eligible: boolean;
        rule?: EligibilityRule;
        failedConditions?: { field: string; operator: string; value: unknown }[];
      };
      const wpEnd = rawResult.rule
        ? calcWaitingPeriodEnd(payload.hireDate as string, rawResult.rule.waitingPeriodType)
        : undefined;
      setResult({
        eligible: rawResult.eligible,
        failedConditions: rawResult.failedConditions ?? [],
        rule: rawResult.rule,
        waitingPeriodEndDate: wpEnd,
        effectiveCoverageDate: wpEnd && wpEnd !== 'N/A' ? firstOfNextMonth(wpEnd) : undefined,
      });
    } catch {
      setResult({ eligible: false, failedConditions: [], rule: undefined });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="eligibility-simulator">
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-4">
          {/* Rule selector */}
          <Card className="p-4">
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Select Eligibility Rule</label>
            <div className="relative">
              <select
                value={selectedRule}
                onChange={(e) => { setSelectedRule(e.target.value); setResult(null); }}
                className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-brand-300"
              >
                <option value="">— Choose a rule —</option>
                {rules.map((r) => (
                  <option key={r.ruleId} value={r.ruleId}>
                    [{r.ruleId}] {r.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {activeRule && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">{activeRule.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {activeRule.conditions.map((c, i) => (
                    <span key={i} className="text-[10px] bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded-full font-mono">
                      {c.field} {OP_LABEL[c.operator] ?? c.operator} {String(Array.isArray(c.value) ? c.value.join(', ') : c.value)}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Waiting period: <span className="font-medium text-gray-700">{WAITING_PERIOD_LABELS[activeRule.waitingPeriodType] ?? activeRule.waitingPeriodType}</span>
                </p>
                {activeRule.conflictsWith && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-700">
                    <AlertTriangle className="w-3 h-3" />
                    Conflicts with {activeRule.conflictsWith}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Employee data */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Employee Data</label>
              <div className="ml-auto flex bg-gray-100 rounded-lg p-0.5">
                {(['custom', 'employee'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setResult(null); }}
                    className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${mode === m ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {m === 'custom' ? 'Custom' : 'From Employee'}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'employee' ? (
              <div>
                <div className="relative">
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 bg-white appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-brand-300"
                  >
                    <option value="">— Choose an employee —</option>
                    {(employees as Record<string, string>[]).map((e) => (
                      <option key={e.employeeId} value={e.employeeId}>
                        {e.firstName} {e.lastName} ({e.employeeId})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {selectedEmployee && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3.5 h-3.5" />
                    Employee data will be used for simulation.
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'employmentType', label: 'Employment Type' },
                  { key: 'hoursPerWeek', label: 'Hours / Week' },
                  { key: 'jobClass', label: 'Job Class' },
                  { key: 'employmentStatus', label: 'Status' },
                  { key: 'hireDate', label: 'Hire Date', type: 'date' },
                  { key: 'annualSalary', label: 'Annual Salary' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">{label}</label>
                    <input
                      type={type ?? 'text'}
                      value={customData[key as keyof typeof customData]}
                      onChange={(e) => { setCustomData((prev) => ({ ...prev, [key]: e.target.value })); setResult(null); }}
                      className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300 bg-gray-50"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <button
            onClick={runSimulation}
            disabled={!selectedRule || running || (mode === 'employee' && !selectedEmployee)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            {running ? 'Running...' : 'Run Simulation'}
          </button>
        </div>

        {/* Right: Result */}
        <div>
          {!result && !running && (
            <Card className="p-8 flex flex-col items-center justify-center text-center h-full bg-gray-50 border-dashed">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                <Play className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">Select a rule and employee data,</p>
              <p className="text-sm text-gray-400">then click Run Simulation.</p>
            </Card>
          )}

          {running && (
            <Card className="p-8 flex flex-col items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-500">Evaluating eligibility...</p>
            </Card>
          )}

          {result && !running && (
            <Card className="overflow-hidden h-full">
              {/* Verdict */}
              <div className={`px-5 py-5 flex items-center gap-4 ${result.eligible ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.eligible ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {result.eligible
                    ? <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    : <XCircle className="w-6 h-6 text-red-600" />}
                </div>
                <div>
                  <p className={`text-lg font-bold ${result.eligible ? 'text-emerald-700' : 'text-red-700'}`}>
                    {result.eligible ? 'Eligible' : 'Not Eligible'}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Rule: <span className="font-medium">{result.rule?.name ?? activeRule?.name ?? selectedRule}</span>
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Waiting period / effective date */}
                {result.eligible && result.waitingPeriodEndDate && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-brand-50 border border-brand-100 rounded-xl p-3">
                      <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-wide mb-1">Waiting Period Ends</p>
                      <p className="text-sm font-bold text-brand-800">{result.waitingPeriodEndDate}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide mb-1">Coverage Effective</p>
                      <p className="text-sm font-bold text-emerald-800">{result.effectiveCoverageDate ?? 'TBD'}</p>
                    </div>
                  </div>
                )}

                {/* Conditions check */}
                {result.rule && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Condition Evaluation</p>
                    <div className="space-y-1.5">
                      {result.rule.conditions.map((c, i) => {
                        const failed = result.failedConditions.some(
                          (f) => f.field === c.field && f.operator === c.operator
                        );
                        return (
                          <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${failed ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {failed
                              ? <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              : <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                            <span className="font-mono">
                              {c.field} {OP_LABEL[c.operator] ?? c.operator} {String(Array.isArray(c.value) ? c.value.join(', ') : c.value)}
                            </span>
                            <span className="ml-auto font-medium">{failed ? 'FAIL' : 'PASS'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Failed conditions detail */}
                {!result.eligible && result.failedConditions.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-amber-700 mb-1">
                      {result.failedConditions.length} condition{result.failedConditions.length > 1 ? 's' : ''} not met
                    </p>
                    <p className="text-xs text-amber-600">
                      Review the failed conditions above and adjust the employee's data or the rule definition.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
