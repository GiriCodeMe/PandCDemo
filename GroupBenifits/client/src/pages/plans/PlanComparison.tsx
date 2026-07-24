import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitCompare, CheckCircle2, XCircle, Minus } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

function authHeader() {
  return { Authorization: `Bearer ${sessionStorage.getItem('persona_token') ?? 'P-001'}` };
}

async function fetchProducts() {
  const res = await fetch(`/api/products?employerId=ACM-001`, { headers: authHeader() });
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

type Product = Record<string, unknown>;
type Plan = Record<string, unknown>;

function flatPlans(products: Product[]): { label: string; planId: string; plan: Plan; productType: string }[] {
  const out: { label: string; planId: string; plan: Plan; productType: string }[] = [];
  for (const p of products) {
    const plans = (p.plans as Plan[]) ?? [];
    for (const plan of plans) {
      out.push({
        label: `${String(p.type ?? '')} — ${String(plan.name ?? plan.planId)}`,
        planId: String(plan.planId),
        plan,
        productType: String(p.type ?? ''),
      });
    }
  }
  return out;
}

interface CompareRow {
  category: string;
  label: string;
  key: string;
  format: 'dollar' | 'percent' | 'text' | 'tier';
}

const SECTIONS: { title: string; rows: CompareRow[] }[] = [
  {
    title: 'Plan Overview',
    rows: [
      { category: 'Plan Overview', label: 'Plan Name', key: 'name', format: 'text' },
      { category: 'Plan Overview', label: 'Plan Code', key: 'planCode', format: 'text' },
      { category: 'Plan Overview', label: 'Network', key: 'network', format: 'text' },
      { category: 'Plan Overview', label: 'Status', key: 'status', format: 'text' },
    ],
  },
  {
    title: 'Coverage',
    rows: [
      { category: 'Coverage', label: 'Deductible', key: 'deductible', format: 'dollar' },
      { category: 'Coverage', label: 'Out-of-Pocket Max', key: 'outOfPocketMax', format: 'dollar' },
      { category: 'Coverage', label: 'Copay', key: 'copay', format: 'dollar' },
      { category: 'Coverage', label: 'Coinsurance', key: 'coinsurance', format: 'percent' },
    ],
  },
  {
    title: 'Premiums (EE Only)',
    rows: [
      { category: 'Premiums', label: 'Monthly Premium', key: '_eeMonthly', format: 'dollar' },
      { category: 'Premiums', label: 'Employer Contribution', key: '_eeEmployer', format: 'dollar' },
      { category: 'Premiums', label: 'Employee Cost', key: '_eeEmployee', format: 'dollar' },
    ],
  },
  {
    title: 'HSA / FSA',
    rows: [
      { category: 'HSA/FSA', label: 'HSA Eligible', key: 'hsaEligible', format: 'text' },
      { category: 'HSA/FSA', label: 'FSA Eligible', key: 'fsaEligible', format: 'text' },
      { category: 'HSA/FSA', label: 'Employer HSA Contribution', key: 'employerHsaContribution', format: 'dollar' },
    ],
  },
];

function getPlanValue(plan: Plan, key: string): string {
  if (key === '_eeMonthly' || key === '_eeEmployer' || key === '_eeEmployee') {
    const rates = (plan.rates as Plan[]) ?? [];
    const ee = rates.find((r) => r.tierType === 'EE Only');
    if (!ee) return '—';
    if (key === '_eeMonthly') return `$${Number(ee.monthlyPremium).toFixed(2)}`;
    if (key === '_eeEmployer') return `$${Number(ee.employerContribution).toFixed(2)}`;
    if (key === '_eeEmployee') return `$${Number(ee.employeeContribution).toFixed(2)}`;
  }
  const val = plan[key];
  if (val === undefined || val === null || val === '') return '—';
  if (key === 'deductible' || key === 'outOfPocketMax' || key === 'copay') return `$${Number(val).toLocaleString()}`;
  if (key === 'coinsurance') return `${val}%`;
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return String(val);
}

function isDiff(values: string[]): boolean {
  const defined = values.filter((v) => v !== '—');
  return defined.length > 1 && new Set(defined).size > 1;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'default'> = {
  PUBLISHED: 'success', ACTIVE: 'success', CONFIGURED: 'warning', DRAFT: 'default',
};

export default function PlanComparison() {
  const [selected, setSelected] = useState<string[]>([]);
  const [diffsOnly, setDiffsOnly] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products-compare'],
    queryFn: fetchProducts,
    staleTime: 60_000,
  });

  const allPlans = flatPlans(products as Product[]);
  const comparePlans = allPlans.filter((p) => selected.includes(p.planId));

  function togglePlan(planId: string) {
    setSelected((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : prev.length < 4 ? [...prev, planId] : prev
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div data-testid="plan-comparison">
      {/* Plan selector */}
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Select up to 4 plans to compare</p>
          {selected.length > 0 && (
            <button onClick={() => setSelected([])} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {allPlans.map(({ planId, label, productType }) => {
            const active = selected.includes(planId);
            const disabled = !active && selected.length >= 4;
            return (
              <button
                key={planId}
                onClick={() => !disabled && togglePlan(planId)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? 'bg-brand-50 border-brand-400 text-brand-700'
                    : disabled
                    ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Controls */}
      {comparePlans.length >= 2 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-brand-500" />
            <p className="text-sm font-semibold text-gray-800">
              Comparing {comparePlans.length} plan{comparePlans.length > 1 ? 's' : ''}
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm text-gray-500">Differences only</span>
            <div
              onClick={() => setDiffsOnly((v) => !v)}
              className={`w-9 h-5 rounded-full transition-colors relative ${diffsOnly ? 'bg-brand-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${diffsOnly ? 'translate-x-4' : ''}`} />
            </div>
          </label>
        </div>
      )}

      {/* Comparison table */}
      {comparePlans.length >= 2 ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Feature</th>
                {comparePlans.map(({ planId, plan }) => (
                  <th key={planId} className="px-4 py-3 text-center">
                    <p className="font-bold text-gray-900 text-sm">{String(plan.name ?? planId)}</p>
                    <Badge variant={STATUS_VARIANT[String(plan.status ?? 'DRAFT')] ?? 'default'} className="mt-1 text-[10px]">
                      {String(plan.status ?? 'DRAFT')}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map(({ title, rows }) => {
                const visibleRows = diffsOnly
                  ? rows.filter((row) => isDiff(comparePlans.map((cp) => getPlanValue(cp.plan, row.key))))
                  : rows;

                if (visibleRows.length === 0) return null;

                return (
                  <React.Fragment key={title}>
                    <tr className="bg-gray-50">
                      <td colSpan={comparePlans.length + 1} className="px-4 py-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{title}</span>
                      </td>
                    </tr>
                    {visibleRows.map((row) => {
                      const values = comparePlans.map((cp) => getPlanValue(cp.plan, row.key));
                      const hasDiff = isDiff(values);
                      return (
                        <tr key={row.key} className={`border-t border-gray-50 ${hasDiff ? 'bg-amber-50/50' : 'hover:bg-gray-50/50'} transition-colors`}>
                          <td className="px-4 py-3 text-gray-500 font-medium text-xs">{row.label}</td>
                          {values.map((val, idx) => (
                            <td key={idx} className="px-4 py-3 text-center">
                              <span className={`text-sm font-semibold ${val === '—' ? 'text-gray-300' : hasDiff ? 'text-amber-700' : 'text-gray-900'}`}>
                                {val}
                              </span>
                              {hasDiff && val !== '—' && (
                                <span className="block text-[10px] text-amber-500 mt-0.5">differs</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {diffsOnly && SECTIONS.every(({ rows }) =>
            rows.every((row) => !isDiff(comparePlans.map((cp) => getPlanValue(cp.plan, row.key))))
          ) && (
            <div className="px-6 py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">All values are identical across selected plans.</p>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <GitCompare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Select at least 2 plans above to start comparing</p>
          <p className="text-xs text-gray-400 mt-1">You can compare up to 4 plans side-by-side</p>
        </Card>
      )}
    </div>
  );
}
