import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Building2, DollarSign, Network, History, Shield, CheckCircle2, Clock, AlertTriangle, ChevronDown } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

function authHeader() {
  return { Authorization: `Bearer ${sessionStorage.getItem('persona_token') ?? 'P-001'}` };
}

async function fetchProduct(planId: string) {
  const res = await fetch(`/api/products?employerId=ACM-001`, { headers: authHeader() });
  const json = await res.json();
  const products: Record<string, unknown>[] = Array.isArray(json.data) ? json.data : [];
  for (const p of products) {
    const plans = (p.plans as Record<string, unknown>[]) ?? [];
    const plan = plans.find((pl) => pl.planId === planId);
    if (plan) return { product: p, plan };
  }
  return null;
}

async function fetchRates() {
  const res = await fetch(`/api/plan-config?employerId=ACM-001`, { headers: authHeader() });
  const json = await res.json();
  return json.data ?? {};
}

async function fetchCarrier(carrierId: string) {
  const res = await fetch(`/api/integrations/carriers`, { headers: authHeader() });
  const json = await res.json();
  const carriers: Record<string, string>[] = Array.isArray(json.data) ? json.data : [];
  return carriers.find((c) => c.carrierId === carrierId) ?? null;
}

const TABS = ['Overview', 'Coverage', 'Premiums', 'Eligibility', 'Versions'] as const;
type Tab = (typeof TABS)[number];

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  PUBLISHED: 'success',
  ACTIVE: 'success',
  REVIEW: 'warning',
  CONFIGURED: 'warning',
  DRAFT: 'default',
  PENDING: 'warning',
  REJECTED: 'error',
};

const COVERAGE_ROWS = [
  { label: 'Deductible', key: 'deductible', format: 'dollar' },
  { label: 'Out-of-Pocket Max', key: 'outOfPocketMax', format: 'dollar' },
  { label: 'Copay', key: 'copay', format: 'dollar' },
  { label: 'Coinsurance', key: 'coinsurance', format: 'percent' },
  { label: 'Network', key: 'network', format: 'text' },
];

const TIER_LABELS: Record<string, string> = {
  'EE Only': 'Employee Only',
  'EE + Spouse': 'Employee + Spouse',
  'EE + Child': 'Employee + Child(ren)',
  'EE + Family': 'Employee + Family',
};

const MOCK_VERSIONS = [
  { version: 'v2.0', status: 'PUBLISHED', effectiveDate: '2027-01-01', change: 'Deductible increased $500 → $750, premium +$25/mo', author: 'Sarah Chen' },
  { version: 'v1.0', status: 'SUPERSEDED', effectiveDate: '2026-01-01', change: 'Initial plan configuration published', author: 'Admin' },
];

export default function PlanDetail() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('Overview');

  const { data: planData, isLoading } = useQuery({
    queryKey: ['plan-detail', planId],
    queryFn: () => fetchProduct(planId!),
    staleTime: 60_000,
    enabled: !!planId,
  });

  const plan = planData?.plan as Record<string, unknown> | undefined;
  const product = planData?.product as Record<string, unknown> | undefined;

  const { data: carrier } = useQuery({
    queryKey: ['carrier', product?.carrierId],
    queryFn: () => fetchCarrier(product?.carrierId as string),
    staleTime: 60_000,
    enabled: !!product?.carrierId,
  });

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <button onClick={() => navigate('/plans')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Plans
        </button>
        <Card className="p-8 text-center">
          <p className="text-gray-500">Plan not found: {planId}</p>
        </Card>
      </div>
    );
  }

  const rates = (plan.rates as Record<string, unknown>[]) ?? [];
  const planStatus = (plan.status as string) ?? 'DRAFT';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back nav */}
      <button onClick={() => navigate('/plans')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Plans
      </button>

      {/* Header card */}
      <Card className="p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-brand-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-gray-900">{String(plan.name ?? planId)}</h1>
              <Badge variant={STATUS_VARIANT[planStatus] ?? 'default'}>{planStatus}</Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{String(product?.name ?? '')} · {String(product?.type ?? '')}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span className="font-mono">{String(plan.planId ?? '')}</span>
              {carrier && <span>Carrier: {carrier.name}</span>}
              {plan.planCode ? <span>Code: {String(plan.planCode)}</span> : null}
              {plan.network ? <span>Network: {String(plan.network)}</span> : null}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-2 gap-5">
          <Card className="p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> Plan Information
            </h3>
            <dl className="space-y-2">
              {[
                { label: 'Plan Name', value: String(plan.name ?? '—') },
                { label: 'Plan Code', value: String(plan.planCode ?? '—') },
                { label: 'Product Type', value: String(product?.type ?? '—') },
                { label: 'Network', value: String(plan.network ?? '—') },
                { label: 'Status', value: planStatus },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {carrier && (
            <Card className="p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Network className="w-3.5 h-3.5" /> Carrier
              </h3>
              <dl className="space-y-2">
                {[
                  { label: 'Carrier', value: carrier.name },
                  { label: 'Type', value: carrier.type },
                  { label: 'Status', value: carrier.status ?? 'Active' },
                  { label: 'Email', value: carrier.contactEmail ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-medium text-gray-900 truncate max-w-[180px]">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          <Card className="col-span-2 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Configuration Checklist
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Plan details configured', done: true },
                { label: 'Rates loaded', done: rates.length > 0 },
                { label: 'Carrier assigned', done: !!carrier },
                { label: 'Eligibility rules linked', done: true },
                { label: 'Open enrollment configured', done: true },
                { label: 'Published', done: planStatus === 'PUBLISHED' || planStatus === 'ACTIVE' },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    : <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                  <span className={done ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Coverage tab */}
      {tab === 'Coverage' && (
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-800">Coverage Details</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {COVERAGE_ROWS.map(({ label, key, format }) => {
              const val = plan[key];
              let display = '—';
              if (val !== undefined && val !== null) {
                if (format === 'dollar') display = `$${Number(val).toLocaleString()}`;
                else if (format === 'percent') display = `${val}%`;
                else display = String(val);
              }
              return (
                <div key={key} className="px-5 py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="text-sm font-semibold text-gray-900">{display}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Premiums tab */}
      {tab === 'Premiums' && (
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-800">Rate Tiers</h3>
            <span className="ml-auto text-xs text-gray-400">{rates.length} tiers</span>
          </div>
          {rates.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-400">No rate tiers configured for this plan.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Coverage Tier</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Monthly Premium</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Employer</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(rates as Record<string, unknown>[]).map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-800 font-medium">{TIER_LABELS[r.tierType as string] ?? String(r.tierType)}</td>
                    <td className="px-5 py-3 text-right text-gray-900 font-semibold">${Number(r.monthlyPremium).toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-emerald-700 font-medium">${Number(r.employerContribution).toFixed(2)}</td>
                    <td className="px-5 py-3 text-right text-brand-700 font-medium">${Number(r.employeeContribution).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* Eligibility tab */}
      {tab === 'Eligibility' && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm font-semibold text-gray-800">Eligibility Rules linked to this plan</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            The following eligibility rules govern who can enroll in <strong>{String(plan.name)}</strong>.
          </p>
          <div className="p-4 bg-violet-50 border border-violet-100 rounded-xl">
            <p className="text-xs font-semibold text-violet-700">Full-Time Employee — Standard</p>
            <p className="text-xs text-violet-600 mt-1">
              IF Employment Type = Full-Time AND Hours Per Week ≥ 30 THEN Eligible
              — Waiting Period: 1st of month after 30 days
            </p>
          </div>
          <button
            onClick={() => navigate('/plans?tab=eligibility')}
            className="mt-4 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Manage Eligibility Rules →
          </button>
        </Card>
      )}

      {/* Versions tab */}
      {tab === 'Versions' && (
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <History className="w-4 h-4 text-brand-500" />
            <h3 className="text-sm font-semibold text-gray-800">Version History</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {MOCK_VERSIONS.map((v) => (
              <div key={v.version} className="px-5 py-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold font-mono text-gray-700">{v.version}</span>
                  <Badge variant={STATUS_VARIANT[v.status] ?? 'default'}>{v.status}</Badge>
                  <span className="text-xs text-gray-400 ml-auto">Effective {v.effectiveDate}</span>
                </div>
                <p className="text-sm text-gray-700">{v.change}</p>
                <p className="text-xs text-gray-400 mt-1">By {v.author}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
