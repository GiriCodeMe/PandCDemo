import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Save, Play, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const FIELDS = [
  { value: 'employmentType', label: 'Employment Type' },
  { value: 'hoursPerWeek', label: 'Hours Per Week' },
  { value: 'jobClass', label: 'Job Class' },
  { value: 'department', label: 'Department' },
  { value: 'employmentStatus', label: 'Employment Status' },
  { value: 'location', label: 'Location' },
  { value: 'annualSalary', label: 'Annual Salary' },
];

const OPERATORS: Record<string, { value: string; label: string }[]> = {
  employmentType:   [{ value: 'equals', label: '=' }, { value: 'in', label: 'in' }],
  hoursPerWeek:     [{ value: 'greater_than_or_equal', label: '≥' }, { value: 'less_than_or_equal', label: '≤' }, { value: 'equals', label: '=' }],
  jobClass:         [{ value: 'in', label: 'in' }, { value: 'equals', label: '=' }],
  department:       [{ value: 'equals', label: '=' }, { value: 'in', label: 'in' }],
  employmentStatus: [{ value: 'equals', label: '=' }],
  location:         [{ value: 'equals', label: '=' }, { value: 'in', label: 'in' }],
  annualSalary:     [{ value: 'greater_than_or_equal', label: '≥' }, { value: 'less_than_or_equal', label: '≤' }],
};

const VALUE_HINTS: Record<string, string> = {
  employmentType: 'Full-Time, Part-Time, Contract',
  hoursPerWeek: '30',
  jobClass: 'Executive, Professional, Hourly',
  department: 'Engineering, Sales, HR',
  employmentStatus: 'Active',
  location: 'Princeton, NJ',
  annualSalary: '50000',
};

const WAITING_PERIODS = [
  { value: 'Immediate', label: 'Immediate' },
  { value: 'Days30', label: '30 calendar days' },
  { value: 'Days60', label: '60 calendar days' },
  { value: 'Days90', label: '90 calendar days' },
  { value: 'FirstOfMonthFollowing30', label: '1st of month after 30 days' },
];

const STATUSES = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED'];

const nextId = () => Math.random().toString(36).slice(2, 8);

const FIELD_LABEL = Object.fromEntries(FIELDS.map((f) => [f.value, f.label]));
const OP_LABEL: Record<string, string> = {
  equals: '=', in: 'in', greater_than_or_equal: '≥', less_than_or_equal: '≤', not_equals: '≠',
};

function humanReadableRule(conditions: Condition[], waitingPeriod: string, then: string): string {
  if (conditions.length === 0) return 'Define at least one condition to preview the rule.';
  const parts = conditions.map((c) =>
    `${FIELD_LABEL[c.field] ?? c.field} ${OP_LABEL[c.operator] ?? c.operator} "${c.value}"`
  );
  const wp = WAITING_PERIODS.find((w) => w.value === waitingPeriod)?.label ?? waitingPeriod;
  return `IF ${parts.join(' AND ')} THEN ${then} — Waiting Period: ${wp}`;
}

export default function RuleBuilder() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([
    { id: nextId(), field: 'employmentType', operator: 'equals', value: 'Full-Time' },
    { id: nextId(), field: 'hoursPerWeek', operator: 'greater_than_or_equal', value: '30' },
  ]);
  const [waitingPeriod, setWaitingPeriod] = useState('FirstOfMonthFollowing30');
  const [thenClause, setThenClause] = useState('Employee is Eligible');
  const [status, setStatus] = useState('DRAFT');
  const [saved, setSaved] = useState(false);
  const [validated, setValidated] = useState<null | 'pass' | 'fail'>(null);

  function addCondition() {
    setConditions((prev) => [...prev, { id: nextId(), field: 'employmentType', operator: 'equals', value: '' }]);
  }

  function removeCondition(id: string) {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  }

  function updateCondition(id: string, key: keyof Condition, val: string) {
    setConditions((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (key === 'field') {
          const ops = OPERATORS[val] ?? [];
          return { ...c, field: val, operator: ops[0]?.value ?? 'equals', value: '' };
        }
        return { ...c, [key]: val };
      })
    );
    setValidated(null);
    setSaved(false);
  }

  function handleSave() {
    if (!name.trim()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleValidate() {
    const allFilled = conditions.every((c) => c.field && c.operator && c.value.trim());
    setValidated(allFilled && conditions.length > 0 ? 'pass' : 'fail');
  }

  const canSave = name.trim() && conditions.length > 0 && conditions.every((c) => c.value.trim());

  return (
    <div className="space-y-6" data-testid="rule-builder">
      {/* Header */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <span className="text-violet-600 font-bold text-xs">IF</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Rule Builder</h2>
            <p className="text-xs text-gray-500">Define conditions and waiting periods for eligibility</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rule Name *</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
              placeholder="e.g. Full-Time Employee Eligibility"
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">THEN (Result)</label>
            <input
              value={thenClause}
              onChange={(e) => { setThenClause(e.target.value); setSaved(false); }}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the rule's intent"
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
      </Card>

      {/* Conditions */}
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">IF conditions (AND logic)</span>
          <button
            onClick={addCondition}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Condition
          </button>
        </div>

        <div className="p-4 space-y-3">
          {conditions.map((cond, idx) => {
            const ops = OPERATORS[cond.field] ?? [{ value: 'equals', label: '=' }];
            return (
              <div key={cond.id} className="flex items-center gap-3">
                {idx > 0 && (
                  <span className="text-[10px] font-bold text-gray-400 w-8 text-right flex-shrink-0">AND</span>
                )}
                {idx === 0 && (
                  <span className="text-[10px] font-bold text-violet-600 w-8 text-right flex-shrink-0">IF</span>
                )}
                <select
                  value={cond.field}
                  onChange={(e) => updateCondition(cond.id, 'field', e.target.value)}
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
                >
                  {FIELDS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <select
                  value={cond.operator}
                  onChange={(e) => updateCondition(cond.id, 'operator', e.target.value)}
                  className="w-24 text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
                >
                  {ops.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  value={cond.value}
                  onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                  placeholder={VALUE_HINTS[cond.field] ?? 'value'}
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
                <button
                  onClick={() => removeCondition(cond.id)}
                  disabled={conditions.length === 1}
                  className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* THEN + Waiting Period */}
        <div className="px-4 pb-4 pt-0 border-t border-dashed border-gray-200 mx-4 mt-2 pt-3 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-emerald-600 w-8 text-right flex-shrink-0">THEN</span>
            <div className="flex-1 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 font-medium">
              {thenClause || 'Employee is Eligible'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-400 w-8 text-right flex-shrink-0">WAIT</span>
            <select
              value={waitingPeriod}
              onChange={(e) => { setWaitingPeriod(e.target.value); setSaved(false); }}
              className="flex-1 text-sm border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              {WAITING_PERIODS.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card className="p-4 bg-gray-50 border border-dashed border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rule Preview</p>
        <p className="text-sm text-gray-700 font-mono leading-relaxed">
          {humanReadableRule(conditions, waitingPeriod, thenClause)}
        </p>
      </Card>

      {/* Validation result */}
      {validated && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${validated === 'pass' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
          {validated === 'pass'
            ? <><CheckCircle className="w-4 h-4" /> Rule structure is valid — all conditions are complete.</>
            : <><AlertTriangle className="w-4 h-4" /> Some conditions are missing values. Fill in all fields before saving.</>}
        </div>
      )}

      {/* Saved banner */}
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-brand-50 text-brand-700 border border-brand-200">
          <CheckCircle className="w-4 h-4" />
          Rule saved as Draft — "{name}"
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleValidate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Play className="w-4 h-4" />
          Validate Structure
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Save Draft
        </button>
        <div className="ml-auto">
          <Badge variant="default">
            {conditions.length} condition{conditions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
    </div>
  );
}
