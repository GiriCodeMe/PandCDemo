import React, { useState } from 'react';
import { Check, Upload, Database, Users, AlertCircle, CheckCircle2, Brain, XCircle, AlertTriangle } from 'lucide-react';
import { WizardState, CensusEmployee, CensusIssue } from '../types';
import { SmartTip } from '../SmallBusinessWizard';

interface Props {
  state: WizardState;
  update: (partial: Partial<WizardState>) => void;
}

const PROVIDERS = [
  { id: 'adp', label: 'ADP Workforce Now', logo: '🅰', desc: 'Connect via ADP API' },
  { id: 'quickbooks', label: 'QuickBooks Payroll', logo: '🔵', desc: 'QuickBooks Online integration' },
  { id: 'ukg', label: 'UKG Pro / Kronos', logo: '🟣', desc: 'UKG workforce management' },
  { id: 'upload', label: 'Upload CSV / Excel', logo: '📄', desc: 'Drag & drop your employee file' },
  { id: 'manual', label: 'Manual Entry', logo: '✏️', desc: 'Enter employees one by one' },
] as const;

type ProviderId = (typeof PROVIDERS)[number]['id'];

const MOCK_EMPLOYEES: CensusEmployee[] = [
  { id: 'EMP-001', name: 'Alice Johnson', jobTitle: 'Software Engineer', email: 'alice@company.com', hireDate: '2022-03-15', salary: '$95,000', status: 'Active', employmentClass: 'FULL_TIME', weeklyHours: 40, selected: true },
  { id: 'EMP-002', name: 'Bob Martinez', jobTitle: 'Product Manager', email: 'bob@company.com', hireDate: '2021-07-01', salary: '$110,000', status: 'Active', employmentClass: 'FULL_TIME', weeklyHours: 40, selected: true },
  { id: 'EMP-003', name: 'Carol Davis', jobTitle: 'UX Designer', email: 'carol@company.com', hireDate: '2023-01-20', salary: '$88,000', status: 'Active', employmentClass: 'FULL_TIME', weeklyHours: 22, selected: true },
  { id: 'EMP-004', name: 'David Lee', jobTitle: 'DevOps Engineer', email: 'david@company.com', hireDate: '2022-09-10', salary: '$105,000', status: 'Active', employmentClass: 'FULL_TIME', weeklyHours: 40, selected: true },
  { id: 'EMP-005', name: 'Emma Wilson', jobTitle: 'Marketing Analyst', email: 'emma@company.com', hireDate: '2023-05-01', salary: '$75,000', status: 'Active', employmentClass: 'FULL_TIME', weeklyHours: 40, selected: true },
  { id: 'EMP-006', name: 'Frank Torres', jobTitle: 'Owner / Founder', email: 'frank@company.com', hireDate: '2018-01-01', salary: '$130,000', status: 'Active', employmentClass: 'FULL_TIME', weeklyHours: 50, selected: true },
  { id: 'EMP-007', name: 'Grace Kim', jobTitle: 'HR Coordinator', email: 'grace@company.com', hireDate: '2022-06-01', salary: '$68,000', status: 'Active', employmentClass: 'FULL_TIME', weeklyHours: 40, selected: true },
  { id: 'EMP-008', name: 'Henry Patel', jobTitle: 'Finance Analyst', email: 'henry@company.com', hireDate: '2023-03-15', salary: '$82,000', status: 'Active', employmentClass: 'FULL_TIME', weeklyHours: 40, selected: true },
  { id: 'EMP-009', name: 'Iris Chen', jobTitle: 'QA Engineer', email: 'iris@company.com', hireDate: '2022-12-01', salary: '$90,000', status: 'Active', employmentClass: 'FULL_TIME', weeklyHours: 40, selected: true },
  { id: 'EMP-010', name: 'James Brown', jobTitle: 'Customer Support', email: 'james@company.com', hireDate: '2023-08-01', salary: '$58,000', status: 'Active', employmentClass: 'PART_TIME', weeklyHours: 40, selected: false },
];

const MOCK_AI_ISSUES: CensusIssue[] = [
  { type: 'WARNING', employeeId: 'EMP-003', employeeName: 'Carol Davis', message: 'Classified as FULL_TIME but records show 22 weekly hours — may not meet the 30-hour eligibility threshold.' },
  { type: 'WARNING', employeeId: 'EMP-006', employeeName: 'Frank Torres', message: 'Job title "Owner / Founder" indicates possible owner. Not marked as OWNER class — verify for carrier reporting.' },
  { type: 'ERROR', employeeId: 'EMP-010', employeeName: 'James Brown', message: 'Classified as PART_TIME but records show 40 weekly hours — update employment class or verify hours.' },
  { type: 'WARNING', employeeId: 'EMP-010', employeeName: 'James Brown', message: 'Currently deselected. If classification is corrected to full-time, this employee becomes eligible for benefits.' },
];

type SubStep = 'select' | 'connect' | 'review';

export default function Step3Census({ state, update }: Props) {
  const census = state.census;
  const [subStep, setSubStep] = useState<SubStep>(census.connected ? 'review' : census.provider ? 'connect' : 'select');
  const [connecting, setConnecting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function selectProvider(id: ProviderId) {
    update({ census: { ...census, provider: id, connected: false, employees: [], aiIssues: [], aiValidated: false } });
    setSubStep('connect');
  }

  function handleConnect() {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      update({
        census: { ...census, connected: true, employees: MOCK_EMPLOYEES, aiIssues: [], aiValidated: false },
        applicationStatus: 'CENSUS_VALIDATION',
      });
      setSubStep('review');
      // Auto-trigger AI validation after short delay
      setTimeout(() => runAIValidation(), 800);
    }, 2200);
  }

  function runAIValidation() {
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      update({
        census: {
          ...state.census,
          connected: true,
          employees: MOCK_EMPLOYEES,
          aiIssues: MOCK_AI_ISSUES,
          aiValidated: true,
        },
      });
    }, 2400);
  }

  function toggleEmployee(id: string) {
    update({ census: { ...census, employees: census.employees.map((e) => e.id === id ? { ...e, selected: !e.selected } : e) } });
  }

  function toggleAll(val: boolean) {
    update({ census: { ...census, employees: census.employees.map((e) => ({ ...e, selected: val })) } });
  }

  const employees = census.employees.length > 0 ? census.employees : MOCK_EMPLOYEES;
  const selectedCount = employees.filter((e) => e.selected).length;
  const allSelected = employees.every((e) => e.selected);
  const provider = PROVIDERS.find((p) => p.id === census.provider);
  const errors = census.aiIssues.filter((i) => i.type === 'ERROR');
  const warnings = census.aiIssues.filter((i) => i.type === 'WARNING');

  const SUB_STEPS: { id: SubStep; label: string }[] = [
    { id: 'select', label: 'Select Provider' },
    { id: 'connect', label: 'Import Data' },
    { id: 'review', label: 'Review Census' },
  ];
  const subStepIdx = SUB_STEPS.findIndex((s) => s.id === subStep);

  return (
    <div data-testid="step-census" className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Employee Census</h2>
        <p className="text-sm text-gray-500 mt-1">Import employee data. Our AI will validate records and flag issues before enrollment.</p>
      </div>

      <SmartTip>
        We support direct API connections to major HRIS platforms. The AI census validator checks for eligibility conflicts, missing data, duplicate records, and classification mismatches — automatically.
      </SmartTip>

      {/* Sub-step progress */}
      <div className="flex items-center gap-2">
        {SUB_STEPS.map((s, idx) => {
          const done = idx < subStepIdx;
          const active = idx === subStepIdx;
          return (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? 'bg-emerald-500 text-white' : active ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? <Check className="w-3 h-3" /> : idx + 1}
                </div>
                <span className={`text-xs font-medium ${active ? 'text-brand-700' : done ? 'text-emerald-600' : 'text-gray-400'}`}>{s.label}</span>
              </div>
              {idx < SUB_STEPS.length - 1 && <div className={`flex-1 h-px ${idx < subStepIdx ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Select Provider */}
      {subStep === 'select' && (
        <div className="grid grid-cols-1 gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => selectProvider(p.id as ProviderId)}
              className={`flex items-center gap-4 p-4 border-2 rounded-xl text-left hover:border-brand-400 hover:bg-brand-50 transition-all ${census.provider === p.id ? 'border-brand-400 bg-brand-50' : 'border-gray-200'}`}
            >
              <span className="text-2xl w-8 text-center">{p.logo}</span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">{p.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
              </div>
              {census.provider === p.id && <Check className="w-5 h-5 text-brand-600 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {/* Connect */}
      {subStep === 'connect' && provider && (
        <div className="space-y-4">
          <button onClick={() => setSubStep('select')} className="text-xs text-brand-600 hover:text-brand-800">← Change provider</button>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <span className="text-4xl mb-3 block">{provider.logo}</span>
            <h3 className="text-base font-semibold text-gray-900">{provider.label}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-5">
              {provider.id === 'upload' ? 'Upload a CSV or Excel file with employee records' : provider.id === 'manual' ? 'Add employee records manually' : `Authorize Claude Benefits to read from ${provider.label}`}
            </p>
            {provider.id === 'upload' ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleConnect(); }}
                className={`border-2 border-dashed rounded-lg p-8 mb-4 transition-colors ${dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200'}`}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Drag file here or <button onClick={handleConnect} className="text-brand-600 hover:underline">browse</button></p>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {connecting ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> Connecting...</>
                ) : (
                  <><Database className="w-4 h-4" /> Connect & Import</>
                )}
              </button>
            )}
            {connecting && (
              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p className="animate-pulse">✓ Authenticating with {provider.label}…</p>
                <p className="animate-pulse" style={{ animationDelay: '0.4s' }}>✓ Fetching employee records…</p>
                <p className="animate-pulse" style={{ animationDelay: '0.8s' }}>⟳ Validating data fields…</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Census */}
      {subStep === 'review' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-700">{employees.length} employees imported from {provider?.label ?? 'file'}</span>
            </div>
            <button onClick={() => setSubStep('select')} className="text-xs text-brand-600 hover:text-brand-800">← Change source</button>
          </div>

          {/* AI Census Health Panel */}
          {validating && (
            <div className="border border-violet-200 bg-violet-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-violet-600 animate-pulse" />
                <span className="text-sm font-semibold text-violet-800">AI Census Validation in Progress…</span>
              </div>
              <div className="text-xs text-violet-600 space-y-1 animate-pulse">
                <p>→ Checking employment classifications…</p>
                <p>→ Validating weekly hours vs. class…</p>
                <p>→ Scanning for duplicate records…</p>
                <p>→ Verifying eligibility dates…</p>
              </div>
            </div>
          )}

          {census.aiValidated && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-semibold text-gray-800">AI Census Health</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" /> {employees.length - errors.length - warnings.length} Valid</span>
                  <span className="flex items-center gap-1 text-amber-700"><AlertTriangle className="w-3.5 h-3.5" /> {warnings.length} Warnings</span>
                  <span className="flex items-center gap-1 text-red-700"><XCircle className="w-3.5 h-3.5" /> {errors.length} Errors</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {census.aiIssues.map((issue, idx) => (
                  <div key={idx} className={`flex items-start gap-3 px-4 py-3 ${issue.type === 'ERROR' ? 'bg-red-50' : 'bg-amber-50/60'}`}>
                    {issue.type === 'ERROR'
                      ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      : <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-gray-800">{issue.employeeName} ({issue.employeeId})</span>
                      <p className="text-xs text-gray-600 mt-0.5">{issue.message}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${issue.type === 'ERROR' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{issue.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employee table */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{selectedCount} of {employees.length} selected</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => toggleAll(true)} className="text-xs text-brand-600 hover:text-brand-800">Select All</button>
              <button onClick={() => toggleAll(false)} className="text-xs text-gray-500 hover:text-gray-700">Deselect All</button>
              {!census.aiValidated && (
                <button onClick={runAIValidation} className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium">
                  <Brain className="w-3.5 h-3.5" /> Run AI Validation
                </button>
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-10 px-3 py-2.5">
                    <input type="checkbox" checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} className="rounded border-gray-300" />
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Class</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Hrs/Wk</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Hire Date</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((emp) => {
                  const hasIssue = census.aiIssues.some((i) => i.employeeId === emp.id);
                  const isError = census.aiIssues.some((i) => i.employeeId === emp.id && i.type === 'ERROR');
                  return (
                    <tr key={emp.id} onClick={() => toggleEmployee(emp.id)} className={`cursor-pointer transition-colors ${emp.selected ? 'bg-brand-50/40' : 'hover:bg-gray-50'} ${isError ? 'border-l-2 border-red-300' : hasIssue ? 'border-l-2 border-amber-300' : ''}`}>
                      <td className="px-3 py-2.5">
                        <input type="checkbox" checked={emp.selected} onChange={() => toggleEmployee(emp.id)} onClick={(e) => e.stopPropagation()} className="rounded border-gray-300" />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-medium text-gray-900 text-xs">{emp.name}</div>
                            <div className="text-[10px] text-gray-400">{emp.jobTitle}</div>
                          </div>
                          {hasIssue && (
                            isError
                              ? <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                              : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 text-xs hidden sm:table-cell">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${emp.employmentClass === 'FULL_TIME' ? 'bg-brand-100 text-brand-700' : emp.employmentClass === 'OWNER' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'}`}>
                          {emp.employmentClass.replace(/_/g, '-')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 text-xs hidden md:table-cell">
                        <span className={emp.weeklyHours < 30 ? 'text-amber-600 font-semibold' : ''}>{emp.weeklyHours}h</span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-500 text-xs hidden lg:table-cell">{emp.hireDate}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{emp.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedCount === 0 && (
            <div className="flex items-center gap-2 text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Select at least one employee to continue.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
