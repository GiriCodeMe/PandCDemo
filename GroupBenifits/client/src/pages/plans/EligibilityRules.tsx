import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Clock, Users, ChevronDown, ChevronUp, BookOpen, FileWarning } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { eligibilityApi } from '../../api/planConfig';
import { EligibilityRule, DependentRule } from '../../types';

const WAITING_PERIOD_LABELS: Record<string, string> = {
  FirstOfMonthFollowing30: '1st of month after 30 days',
  Immediate: 'Immediate',
  Days30: '30 calendar days',
  Days60: '60 calendar days',
  Days90: '90 calendar days',
};

const OPERATOR_LABELS: Record<string, string> = {
  equals: '=',
  greater_than_or_equal: '≥',
  less_than_or_equal: '≤',
  not_equals: '≠',
  in: 'in',
  contains: 'contains',
};

function ConditionPills({ conditions }: { conditions: EligibilityRule['conditions'] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {conditions.map((cond, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-[10px] font-bold text-gray-400 self-center">AND</span>}
          <span className="inline-flex items-center gap-1 bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-medium px-2 py-1 rounded-full">
            <span className="text-brand-500">{cond.field}</span>
            <span className="text-gray-400">{OPERATOR_LABELS[cond.operator] ?? cond.operator}</span>
            <span className="font-bold">{Array.isArray(cond.value) ? (cond.value as unknown[]).join(', ') : String(cond.value)}</span>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

function RuleCard({ rule }: { rule: EligibilityRule }) {
  const [open, setOpen] = useState(false);
  const hasConflict = !!rule.conflictsWith;
  const hasAmbiguity = !!rule.ambiguityFlag;

  return (
    <Card className={`overflow-hidden ${hasConflict ? 'border-l-4 border-l-amber-400' : hasAmbiguity ? 'border-l-4 border-l-purple-400' : ''}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-gray-100 mt-0.5">
          {hasConflict || hasAmbiguity
            ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            : <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-gray-400">{rule.ruleId}</span>
            {rule.productId && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{rule.productId}</span>}
            {hasConflict && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">CONFLICT</span>}
            {hasAmbiguity && <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded">AMBIGUOUS</span>}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rule.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{rule.status}</span>
          </div>
          <div className="text-sm font-medium text-gray-900 mt-1">{rule.name}</div>
          <ConditionPills conditions={rule.conditions} />
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50 space-y-3 pt-3">
          <p className="text-sm text-gray-700">{rule.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            Waiting period: <span className="font-medium">{WAITING_PERIOD_LABELS[rule.waitingPeriodType] ?? rule.waitingPeriodType}</span>
            ({rule.waitingPeriodDays} days)
          </div>
          {rule.sourceDocumentRef && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <BookOpen className="w-3.5 h-3.5 text-gray-400" />
              Source: {rule.sourceDocumentRef}
            </div>
          )}
          {hasConflict && rule.conflictDescription && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <div className="text-xs font-semibold text-amber-700 mb-0.5">Conflict with {rule.conflictsWith}</div>
              <p className="text-xs text-amber-600">{rule.conflictDescription}</p>
            </div>
          )}
          {hasAmbiguity && rule.ambiguityNote && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
              <div className="text-xs font-semibold text-purple-700 mb-0.5">Ambiguity note</div>
              <p className="text-xs text-purple-600">{rule.ambiguityNote}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function DependentRuleCard({ rule }: { rule: DependentRule }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Users className="w-3.5 h-3.5 text-indigo-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-gray-400">{rule.ruleId}</span>
            <span className="text-xs font-semibold text-gray-700">{rule.ruleType}</span>
            {rule.ageLimit != null && (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">Age limit: {rule.ageLimit}</span>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-1">{rule.description}</p>
          {rule.documentationRequired.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {rule.documentationRequired.map((doc) => (
                <span key={doc} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{doc}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

const TABS = ['Eligibility Rules', 'Dependent Rules'] as const;
type Tab = (typeof TABS)[number];

export default function EligibilityRules() {
  const [tab, setTab] = useState<Tab>('Eligibility Rules');

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['eligibility-rules'],
    queryFn: () => eligibilityApi.getRules('ACM-001'),
    staleTime: 30_000,
  });

  const { data: depRules = [], isLoading: depLoading } = useQuery({
    queryKey: ['dependent-rules'],
    queryFn: () => eligibilityApi.getDependentRules(),
    staleTime: 30_000,
  });

  const conflicts = rules.filter((r) => !!r.conflictsWith);
  const ambiguous = rules.filter((r) => !!r.ambiguityFlag);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{rules.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Eligibility rules</div>
        </Card>
        <Card className="p-4">
          <div className={`text-2xl font-bold ${conflicts.length > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{conflicts.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Conflicting rules</div>
        </Card>
        <Card className="p-4">
          <div className={`text-2xl font-bold ${ambiguous.length > 0 ? 'text-purple-600' : 'text-gray-900'}`}>{ambiguous.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Ambiguous rules</div>
        </Card>
      </div>

      {(conflicts.length > 0 || ambiguous.length > 0) && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <FileWarning className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}</span> and{' '}
            <span className="font-semibold">{ambiguous.length} ambiguit{ambiguous.length !== 1 ? 'ies' : 'y'}</span> detected by AI during document analysis.
            Review and resolve before publishing plan configuration.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm font-medium pb-3 border-b-2 transition-colors ${tab === t ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t}
              {t === 'Eligibility Rules' && conflicts.length > 0 && (
                <span className="ml-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{conflicts.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {tab === 'Eligibility Rules' && (
        <div>
          {rulesLoading ? (
            <div className="text-sm text-gray-400 py-8 text-center">Loading rules...</div>
          ) : (
            <div className="space-y-2">
              {rules.map((r) => <RuleCard key={r.ruleId} rule={r} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'Dependent Rules' && (
        <div>
          {depLoading ? (
            <div className="text-sm text-gray-400 py-8 text-center">Loading dependent rules...</div>
          ) : (
            <div className="space-y-2">
              {depRules.map((r) => <DependentRuleCard key={r.ruleId} rule={r} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
