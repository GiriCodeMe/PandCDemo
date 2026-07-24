import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, Users, Shield, CreditCard, Truck, DollarSign, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';

function authHeader() {
  return { Authorization: `Bearer ${sessionStorage.getItem('persona_token') ?? 'P-001'}` };
}

async function fetchRules() {
  const res = await fetch('/api/eligibility-rules?employerId=ACM-001', { headers: authHeader() });
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

async function fetchProducts() {
  const res = await fetch('/api/products?employerId=ACM-001', { headers: authHeader() });
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

type WhatIfType = 'waiting_period' | 'employee_class' | 'premium_rate' | 'plan_deductible';

interface ImpactScenario {
  type: WhatIfType;
  label: string;
  description: string;
  from: string;
  to: string;
}

const SCENARIOS: ImpactScenario[] = [
  {
    type: 'waiting_period',
    label: 'Extend Waiting Period',
    description: 'Change new-hire waiting period from 30 days to 60 days',
    from: '30 days',
    to: '60 days',
  },
  {
    type: 'employee_class',
    label: 'Add Part-Time Eligibility',
    description: 'Extend eligibility to employees working ≥20 hours/week (currently ≥30)',
    from: '≥30 hrs/week',
    to: '≥20 hrs/week',
  },
  {
    type: 'premium_rate',
    label: 'Increase Employer Contribution',
    description: 'Raise employer contribution from 80% to 90% for employee-only tier',
    from: '80%',
    to: '90%',
  },
  {
    type: 'plan_deductible',
    label: 'Lower Medical Deductible',
    description: 'Reduce medical plan deductible from $750 to $500',
    from: '$750',
    to: '$500',
  },
];

interface ImpactResult {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  items: string[];
  severity: 'high' | 'medium' | 'low';
  detail: string;
}

function computeImpact(scenario: ImpactScenario, ruleCount: number, planCount: number): ImpactResult[] {
  switch (scenario.type) {
    case 'waiting_period':
      return [
        { category: 'Eligibility Rules', icon: Shield, count: ruleCount, items: ['RULE-FT-001 — Full-Time Standard', 'RULE-FT-002 — Management Fast-Track'], severity: 'high', detail: 'All rules referencing a 30-day waiting period must be updated. Rule conditions reference a specific value.' },
        { category: 'Active Enrollments', icon: Users, count: 23, items: ['23 employees currently in 30-day waiting period would be affected', 'Coverage effective dates shift by 30 days'], severity: 'high', detail: 'All employees who started in the last 30 days would have their coverage effective date pushed forward.' },
        { category: 'Carrier Transmissions', icon: Truck, count: 23, items: ['834 EDI files for these 23 employees need resubmission', 'Carrier must be notified of effective date change'], severity: 'medium', detail: 'Pending 834 transactions for affected employees must be voided and resubmitted.' },
        { category: 'Payroll Deductions', icon: DollarSign, count: 23, items: ['Deduction start dates shift for 23 employees', 'Payroll file regeneration required for next pay cycle'], severity: 'medium', detail: 'Payroll deductions won\'t start until the new effective date, extending the period with no employee contribution.' },
        { category: 'Notifications', icon: AlertTriangle, count: 3, items: ['HR Admin notification: 23 affected employees', 'Payroll Admin alert: deduction date change', 'Compliance event: eligibility rule version change'], severity: 'low', detail: 'System will generate audit events and notifications for all affected stakeholders.' },
      ];
    case 'employee_class':
      return [
        { category: 'Newly Eligible Employees', icon: Users, count: 47, items: ['47 part-time employees become eligible', 'New enrollment window must be opened'], severity: 'high', detail: 'These employees have never been offered coverage. A special enrollment period must be created.' },
        { category: 'Eligibility Rules', icon: Shield, count: ruleCount, items: ['RULE-PT-001 must be created', 'RULE-FT-001 conditions updated'], severity: 'high', detail: 'New rule set required for part-time class. Existing full-time rule needs renaming to avoid ambiguity.' },
        { category: 'Plans', icon: CreditCard, count: planCount, items: ['All plans must include part-time premium tier', 'Rate cards require actuarial revision'], severity: 'high', detail: 'Part-time employees typically have different contribution rates. Premium tables need new tiers.' },
        { category: 'Carrier Transmissions', icon: Truck, count: 47, items: ['834 EDI enrollment files for 47 new enrollees', 'Carrier must acknowledge new class definition'], severity: 'medium', detail: 'Mass enrollment transaction required. Carrier processing time estimated 3–5 business days.' },
        { category: 'Cost Impact', icon: DollarSign, count: 47, items: ['Est. +$47,000/mo employer premium exposure', 'Depends on enrollment rate (est. 65%)'], severity: 'low', detail: 'If 65% of eligible part-timers enroll, monthly employer cost increases by approximately $30,550.' },
      ];
    case 'premium_rate':
      return [
        { category: 'Monthly Cost Delta', icon: DollarSign, count: planCount, items: ['+$45.00/mo per enrolled employee', 'Estimated total: +$24,750/mo across all enrolled'], severity: 'high', detail: 'Based on 550 enrolled employees at employee-only tier. Total annual employer cost increase: $297,000.' },
        { category: 'Payroll Deductions', icon: DollarSign, count: 550, items: ['All 550 enrolled employees have lower deduction', 'Payroll file regeneration at next plan year'], severity: 'medium', detail: 'Employee take-home pay increases slightly. Deduction amounts must be updated in payroll system.' },
        { category: 'Carrier Transmissions', icon: Truck, count: 0, items: ['No carrier transmission required', 'Premium change is administrative only'], severity: 'low', detail: 'Carrier is not notified of internal contribution splits. This is purely an employer policy change.' },
        { category: 'Notifications', icon: AlertTriangle, count: 1, items: ['Employee communication required: benefit value increased'], severity: 'low', detail: 'Best practice: notify employees of the improved employer contribution via benefits portal.' },
      ];
    case 'plan_deductible':
      return [
        { category: 'Carrier Impact', icon: Truck, count: 1, items: ['Medical carrier must acknowledge SBC update', 'New 834 plan code or addendum required'], severity: 'high', detail: 'Deductible is a material plan term. Carrier must issue updated Summary of Benefits and Coverage (SBC).' },
        { category: 'Enrolled Employees', icon: Users, count: 550, items: ['All 550 medical plan enrollees benefit immediately', 'HSA eligibility unaffected (plan remains HDHP-compliant)'], severity: 'low', detail: 'The $500 deductible is above the 2027 IRS minimum HDHP threshold. HSA eligibility is maintained.' },
        { category: 'Carrier Transmissions', icon: Truck, count: 550, items: ['834 eligibility files include plan detail', 'Re-submission required only if plan code changes'], severity: 'medium', detail: 'Depends on whether carrier requires a new plan ID for the revised terms.' },
        { category: 'Compliance', icon: Shield, count: 1, items: ['ACA reporting: deductible change is a material modification', 'SPD must be updated within 60 days of change'], severity: 'medium', detail: 'Summary Plan Description update is legally required within 60 days of a material plan modification.' },
      ];
  }
}

const SEV_COLORS = { high: 'text-red-600', medium: 'text-amber-600', low: 'text-gray-500' };
const SEV_BG = { high: 'bg-red-50 border-red-100', medium: 'bg-amber-50 border-amber-100', low: 'bg-gray-50 border-gray-100' };

export default function ImpactAnalysis() {
  const [selected, setSelected] = useState<ImpactScenario | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { data: rules = [] } = useQuery({ queryKey: ['rules-impact'], queryFn: fetchRules, staleTime: 60_000 });
  const { data: products = [] } = useQuery({ queryKey: ['products-impact'], queryFn: fetchProducts, staleTime: 60_000 });
  const allPlans = (products as Record<string, unknown>[]).flatMap((p) => (p.plans as unknown[]) ?? []);

  const impacts = selected ? computeImpact(selected, (rules as unknown[]).length, allPlans.length) : [];
  const totalAffected = impacts.reduce((s, i) => s + i.count, 0);
  const highCount = impacts.filter((i) => i.severity === 'high').length;

  function toggleExpand(cat: string) {
    setExpanded((prev) => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  }

  return (
    <div data-testid="impact-analysis">
      <div className="grid grid-cols-2 gap-5">
        {/* Scenario selector */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Select a what-if scenario</p>
          <div className="space-y-2">
            {SCENARIOS.map((s) => {
              const active = selected?.type === s.type;
              return (
                <button
                  key={s.type}
                  onClick={() => { setSelected(active ? null : s); setExpanded(new Set()); }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${active ? 'border-brand-400 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className={`w-3.5 h-3.5 ${active ? 'text-brand-500' : 'text-gray-400'}`} />
                    <p className={`text-sm font-semibold ${active ? 'text-brand-700' : 'text-gray-800'}`}>{s.label}</p>
                  </div>
                  <p className="text-xs text-gray-500">{s.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-mono bg-red-50 text-red-600 px-2 py-0.5 rounded">{s.from}</span>
                    <span className="text-xs text-gray-400">→</span>
                    <span className="text-xs font-mono bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">{s.to}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Impact results */}
        <div>
          {!selected ? (
            <Card className="p-10 text-center h-full flex flex-col items-center justify-center">
              <Zap className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">Select a scenario on the left to run the impact analysis</p>
              <p className="text-xs text-gray-400 mt-1">See which rules, plans, enrollments, and integrations would be affected</p>
            </Card>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-sm font-bold text-gray-900">{selected.label}</p>
                {highCount > 0 && (
                  <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{highCount} critical impacts</span>
                )}
                <span className="ml-auto text-xs text-gray-400">{totalAffected} total items</span>
              </div>
              <div className="space-y-2">
                {impacts.map((impact) => {
                  const Icon = impact.icon;
                  const isOpen = expanded.has(impact.category);
                  return (
                    <div key={impact.category} className={`border rounded-xl overflow-hidden ${SEV_BG[impact.severity]}`}>
                      <button
                        onClick={() => toggleExpand(impact.category)}
                        className="w-full px-4 py-3 flex items-center gap-3 text-left"
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${SEV_COLORS[impact.severity]}`} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800">{impact.category}</p>
                        </div>
                        <span className={`text-sm font-bold ${SEV_COLORS[impact.severity]}`}>{impact.count > 0 ? impact.count : '—'}</span>
                        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-3 border-t border-gray-200/60">
                          <p className="text-xs text-gray-600 mt-2 mb-2">{impact.detail}</p>
                          <ul className="space-y-1">
                            {impact.items.map((item, i) => (
                              <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                                <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${impact.severity === 'high' ? 'bg-red-400' : impact.severity === 'medium' ? 'bg-amber-400' : 'bg-gray-300'}`} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
