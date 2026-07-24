import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { enrollmentApi } from '../../api/enrollment';
import type { Plan, PlanRate } from '../../types';

const TIER_OPTIONS = ['EE Only', 'EE + Spouse', 'EE + Child', 'Family'];

const MEDICAL_CODES = ['MED-PPO-500', 'MED-PPO-1000', 'MED-HDHP-3000'];

type ComparisonPlan = Plan & { rate?: PlanRate };

const FEATURES = [
  { label: 'Monthly Employee Cost', key: (p: ComparisonPlan) => p.rate ? `$${p.rate.employeeContribution}/mo` : '—' },
  { label: 'Employer Pays', key: (p: ComparisonPlan) => p.rate ? `$${p.rate.employerContribution}/mo` : '—' },
  { label: 'Annual Deductible', key: (p: ComparisonPlan) => p.deductible != null ? `$${p.deductible}` : '—' },
  { label: 'Out-of-Pocket Max', key: (p: ComparisonPlan) => p.outOfPocketMax != null ? `$${p.outOfPocketMax}` : '—' },
  { label: 'Primary Copay', key: (p: ComparisonPlan) => p.copay != null && p.copay > 0 ? `$${p.copay}` : p.copay === 0 ? 'After deductible' : '—' },
  { label: 'Specialist Copay', key: (p: ComparisonPlan) => p.specialistCopay != null && p.specialistCopay > 0 ? `$${p.specialistCopay}` : p.specialistCopay === 0 ? 'After deductible' : '—' },
  { label: 'ER Copay', key: (p: ComparisonPlan) => p.erCopay != null && p.erCopay > 0 ? `$${p.erCopay}` : p.erCopay === 0 ? 'After deductible' : '—' },
  { label: 'Coinsurance', key: (p: ComparisonPlan) => p.coinsurance != null ? `${p.coinsurance}%` : '—' },
  { label: 'HSA Eligible', key: (p: ComparisonPlan) => p.hsaEligible ? 'yes' : 'no' },
];

function BooleanCell({ value }: { value: string }) {
  if (value === 'yes') return <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />;
  if (value === 'no') return <XCircle className="w-4 h-4 text-gray-300 mx-auto" />;
  return <span className="text-gray-700">{value}</span>;
}

function highlight(values: string[], idx: number): string {
  const nums = values.map((v) => parseFloat(v.replace(/[^0-9.]/g, '')));
  const validNums = nums.filter((n) => !isNaN(n));
  if (validNums.length < 2) return '';
  const min = Math.min(...validNums);
  return !isNaN(nums[idx]) && nums[idx] === min ? 'bg-green-50 font-semibold text-green-800' : '';
}

function costHighlight(values: string[], idx: number): string {
  const nums = values.map((v) => parseFloat(v.replace(/[^0-9.]/g, '')));
  const validNums = nums.filter((n) => !isNaN(n));
  if (validNums.length < 2) return '';
  const min = Math.min(...validNums);
  return !isNaN(nums[idx]) && nums[idx] === min ? 'bg-brand-50 font-bold text-brand-700' : '';
}

interface PlanComparisonProps {
  initialPlans?: string[];
  onSelectPlan?: (planCode: string) => void;
  highlightPlan?: string;
  showOnly?: 'differences' | 'all';
}

export default function PlanComparison({
  initialPlans = MEDICAL_CODES,
  onSelectPlan,
  highlightPlan,
  showOnly = 'all',
}: PlanComparisonProps) {
  const [tierType, setTierType] = useState('EE Only');
  const [diffOnly, setDiffOnly] = useState(showOnly === 'differences');

  const { data, isLoading } = useQuery({
    queryKey: ['enrollment', 'comparison', initialPlans, tierType],
    queryFn: () => enrollmentApi.getComparison(initialPlans, tierType),
    staleTime: 30_000,
  });

  const plans = data?.plans ?? [];

  const displayFeatures = diffOnly
    ? FEATURES.filter((f) => {
        const vals = plans.map((p) => f.key(p));
        return new Set(vals).size > 1;
      })
    : FEATURES;

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {TIER_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => setTierType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tierType === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={() => setDiffOnly((d) => !d)}
          className={`ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${diffOnly ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
        >
          <Info className="w-3.5 h-3.5" />
          {diffOnly ? 'Showing differences only' : 'Show differences only'}
        </button>
      </div>

      {/* Table */}
      {plans.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No plans available for comparison.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 w-40">Feature</th>
                {plans.map((p) => (
                  <th
                    key={p.planCode}
                    className={`px-4 py-3 font-semibold text-center ${highlightPlan === p.planCode ? 'bg-brand-50 text-brand-700' : 'text-gray-700'}`}
                  >
                    <div>{p.name}</div>
                    <div className="text-[10px] font-normal text-gray-400">{p.planCode}</div>
                    {p.hsaEligible && (
                      <div className="inline-flex items-center gap-1 mt-1 bg-yellow-50 text-yellow-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-yellow-200">
                        HSA eligible
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayFeatures.map((feature, fi) => {
                const values = plans.map((p) => feature.key(p));
                return (
                  <tr key={feature.label} className={`border-b border-gray-100 ${fi % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="px-4 py-2.5 text-xs text-gray-500 font-medium">{feature.label}</td>
                    {plans.map((p, pi) => {
                      const val = feature.key(p);
                      const isCost = feature.label.includes('Cost') || feature.label.includes('Employer Pays');
                      const hl = isCost
                        ? costHighlight(values, pi)
                        : highlight(values, pi);
                      return (
                        <td key={p.planCode} className={`px-4 py-2.5 text-center ${hl} ${highlightPlan === p.planCode ? 'bg-brand-50/60' : ''}`}>
                          {val === 'yes' || val === 'no' ? <BooleanCell value={val} /> : val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Select buttons */}
      {onSelectPlan && (
        <div className="grid gap-3" style={{ gridTemplateColumns: `160px ${plans.map(() => '1fr').join(' ')}` }}>
          <div />
          {plans.map((p) => (
            <button
              key={p.planCode}
              onClick={() => onSelectPlan(p.planCode)}
              className={`py-2 rounded-xl text-sm font-semibold transition-colors ${highlightPlan === p.planCode ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-white border-2 border-brand-300 text-brand-700 hover:bg-brand-50'}`}
            >
              Select {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
