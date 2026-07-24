import React, { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CheckCircle2, ChevronRight, ChevronLeft, Heart, Smile, Eye,
  Shield, DollarSign, Users, FileText, Send, AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { enrollmentApi } from '../../api/enrollment';
import type { Plan, PlanRate, WizardElection, WizardSession, PremiumSummary } from '../../types';

const TIER_OPTIONS = ['EE Only', 'EE + Spouse', 'EE + Child', 'Family'];

const STEPS = [
  { id: 1, label: 'Welcome',     icon: FileText },
  { id: 2, label: 'Medical',     icon: Heart },
  { id: 3, label: 'Dental',      icon: Smile },
  { id: 4, label: 'Vision',      icon: Eye },
  { id: 5, label: 'Life',        icon: Shield },
  { id: 6, label: 'Savings',     icon: DollarSign },
  { id: 7, label: 'Dependents',  icon: Users },
  { id: 8, label: 'Review',      icon: CheckCircle2 },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-brand-600 text-white' : active ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-400' : 'bg-gray-100 text-gray-400'}`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? 'text-brand-700' : done ? 'text-gray-500' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mt-[-12px] mx-1 ${step.id < current ? 'bg-brand-400' : 'bg-gray-200'}`} style={{ minWidth: 8 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function PlanOptionCard({
  plan, rate, selected, onSelect,
}: {
  plan: Plan;
  rate?: PlanRate;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{plan.name}</p>
          <p className="text-xs text-gray-500">{plan.planCode}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {plan.deductible != null && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                ${plan.deductible} deductible
              </span>
            )}
            {plan.copay != null && plan.copay > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                ${plan.copay} copay
              </span>
            )}
            {plan.hsaEligible && (
              <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200 font-semibold">
                HSA eligible
              </span>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          {rate ? (
            <>
              <p className="text-lg font-bold text-gray-900">${rate.employeeContribution}<span className="text-xs font-normal text-gray-400">/mo</span></p>
              <p className="text-[11px] text-gray-400">Employer: ${rate.employerContribution}/mo</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
        </div>
      </div>
      {selected && (
        <div className="mt-2 flex items-center gap-1 text-brand-600 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Selected
        </div>
      )}
    </button>
  );
}

function WaiveCard({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-700">Waive Coverage</p>
          <p className="text-xs text-gray-400">I decline this benefit for Plan Year 2027</p>
        </div>
        {selected && <CheckCircle2 className="w-4 h-4 text-red-400 ml-auto" />}
      </div>
    </button>
  );
}

interface StepContentProps {
  step: number;
  elections: WizardElection[];
  tierType: string;
  plans: Plan[];
  rates: PlanRate[];
  premiumSummary?: PremiumSummary;
  onSetElection: (productType: string, planCode: string | null, waived: boolean) => void;
  onSetTier: (tierType: string) => void;
}

function PlansForProduct({
  productType,
  prefix,
  elections,
  tierType,
  plans,
  rates,
  onSetElection,
  onSetTier,
}: StepContentProps & { prefix: string }) {
  const filtered = plans.filter((p) => p.planCode.startsWith(prefix));
  const current = elections.find((e) => e.productType === productType);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Coverage Tier</p>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {TIER_OPTIONS.map((t) => (
            <button key={t} onClick={() => onSetTier(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tierType === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map((plan) => {
          const rate = rates.find((r) => r.planCode === plan.planCode && r.tierType === tierType);
          return (
            <PlanOptionCard
              key={plan.planCode}
              plan={plan}
              rate={rate}
              selected={!current?.waived && current?.planCode === plan.planCode}
              onSelect={() => onSetElection(productType, plan.planCode, false)}
            />
          );
        })}
        <WaiveCard selected={current?.waived === true} onSelect={() => onSetElection(productType, null, true)} />
      </div>
    </div>
  );
}

function ReviewStep({ elections, plans, rates, premiumSummary, tierType }: Omit<StepContentProps, 'onSetElection' | 'onSetTier' | 'step'>) {
  return (
    <div className="space-y-4">
      {premiumSummary && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <p className="text-xl font-bold text-gray-900">${premiumSummary.monthlyEmployeeTotal}</p>
            <p className="text-xs text-gray-500 mt-0.5">Your monthly cost</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xl font-bold text-brand-600">${premiumSummary.monthlyEmployerTotal}</p>
            <p className="text-xs text-gray-500 mt-0.5">Employer contribution</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xl font-bold text-gray-900">${premiumSummary.perPaycheck}</p>
            <p className="text-xs text-gray-500 mt-0.5">Per paycheck (26/yr)</p>
          </Card>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Elections</h3>
        <div className="space-y-2">
          {elections.map((e) => {
            const plan = plans.find((p) => p.planCode === e.planCode);
            const rate = rates.find((r) => r.planCode === e.planCode && r.tierType === tierType);
            return (
              <div key={e.productType} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{e.productType}</span>
                  {e.waived ? (
                    <span className="ml-2 text-xs text-red-500 font-medium">Waived</span>
                  ) : (
                    <span className="ml-2 text-xs text-gray-500">{plan?.name ?? e.planCode} · {e.tierType}</span>
                  )}
                </div>
                {!e.waived && rate && (
                  <span className="text-sm font-bold text-gray-900">${rate.employeeContribution}/mo</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>By submitting, you confirm your benefit elections for Plan Year 2027. Elections are effective January 1, 2027. Changes after this window require a Qualifying Life Event.</p>
      </div>
    </div>
  );
}

function StepContent(props: StepContentProps) {
  const { step, elections, tierType, plans, rates, premiumSummary, onSetElection, onSetTier } = props;
  const medicalElection = elections.find((e) => e.productType === 'Medical');

  if (step === 1) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl">
          <p className="text-sm font-semibold text-brand-800">Acme Corp 2027 Open Enrollment</p>
          <p className="text-xs text-brand-600 mt-1">Enrollment window: Oct 1 – Oct 15, 2026. Coverage effective Jan 1, 2027.</p>
        </div>
        <p className="text-sm text-gray-600">
          Welcome to Open Enrollment! Use this wizard to select or update your benefits for the 2027 plan year.
          You can navigate back and forth between steps at any time until you submit.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Medical', desc: 'PPO or HDHP options' },
            { label: 'Dental', desc: 'Basic or Premium' },
            { label: 'Vision', desc: 'Standard coverage' },
            { label: 'Life Insurance', desc: 'Basic (employer-paid) + voluntary' },
            { label: 'HSA / FSA', desc: 'Tax-advantaged savings' },
            { label: 'Dependents', desc: 'Spouse, children, domestic partners' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl bg-white">
              <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <PlansForProduct
        {...props}
        productType="Medical"
        prefix="MED-"
      />
    );
  }

  if (step === 3) {
    return (
      <PlansForProduct
        {...props}
        productType="Dental"
        prefix="DEN-"
      />
    );
  }

  if (step === 4) {
    return (
      <PlansForProduct
        {...props}
        productType="Vision"
        prefix="VIS-"
      />
    );
  }

  if (step === 5) {
    const current = elections.find((e) => e.productType === 'Life');
    const lifePlan = plans.find((p) => p.planCode === 'LIFE-BASIC');
    return (
      <div className="space-y-3">
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm font-semibold text-green-800">Basic Life Insurance — Employer Paid</p>
          <p className="text-xs text-green-600 mt-1">1× annual salary coverage. Automatically included at no cost to you.</p>
        </div>
        {lifePlan && (
          <PlanOptionCard
            plan={lifePlan}
            rate={rates.find((r) => r.planCode === 'LIFE-BASIC' && r.tierType === 'EE Only')}
            selected={!current?.waived && current?.planCode === 'LIFE-BASIC'}
            onSelect={() => onSetElection('Life', 'LIFE-BASIC', false)}
          />
        )}
        <WaiveCard selected={current?.waived === true} onSelect={() => onSetElection('Life', null, true)} />
      </div>
    );
  }

  if (step === 6) {
    const isHdhp = !medicalElection?.waived && medicalElection?.planCode === 'MED-HDHP-3000';
    const hsaElection = elections.find((e) => e.productType === 'HSA');
    const fsaElection = elections.find((e) => e.productType === 'FSA');
    return (
      <div className="space-y-3">
        {isHdhp ? (
          <>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
              You selected HDHP 3000 — you are eligible for an HSA (Health Savings Account). HSA and FSA cannot be combined.
            </div>
            <div className="space-y-2">
              {[{ planCode: 'SAV-HSA', name: 'Health Savings Account (HSA)', desc: 'Triple tax advantage. 2027 limit: $4,300 individual / $8,550 family.', productType: 'HSA' }].map(({ planCode, name, desc, productType }) => (
                <button
                  key={planCode}
                  onClick={() => onSetElection(productType, planCode, false)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${!hsaElection?.waived && hsaElection?.planCode === planCode ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                >
                  <p className="text-sm font-bold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  {!hsaElection?.waived && hsaElection?.planCode === planCode && (
                    <div className="mt-2 flex items-center gap-1 text-brand-600 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                    </div>
                  )}
                </button>
              ))}
              <WaiveCard selected={hsaElection?.waived === true} onSelect={() => onSetElection('HSA', null, true)} />
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl text-xs text-brand-700">
              FSA (Flexible Spending Account) — available with any health plan. 2027 limit: $3,300. Set your annual election below.
            </div>
            <div className="space-y-2">
              {[{ planCode: 'SAV-FSA', name: 'Flexible Spending Account (FSA)', desc: 'Use pre-tax dollars for eligible medical expenses. Use it or lose it (up to $610 rollover).', productType: 'FSA' }].map(({ planCode, name, desc, productType }) => (
                <button
                  key={planCode}
                  onClick={() => onSetElection(productType, planCode, false)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${!fsaElection?.waived && fsaElection?.planCode === planCode ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                >
                  <p className="text-sm font-bold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  {!fsaElection?.waived && fsaElection?.planCode === planCode && (
                    <div className="mt-2 flex items-center gap-1 text-brand-600 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                    </div>
                  )}
                </button>
              ))}
              <WaiveCard selected={fsaElection?.waived === true} onSelect={() => onSetElection('FSA', null, true)} />
            </div>
          </>
        )}
      </div>
    );
  }

  if (step === 7) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Dependents are managed through your HR system. Changes during open enrollment require supporting documentation.
        </p>
        <div className="space-y-2">
          {[
            { rel: 'Spouse', doc: 'Marriage certificate required', covered: tierType === 'EE + Spouse' || tierType === 'Family' },
            { rel: 'Child (under 26)', doc: 'Birth certificate or adoption paperwork', covered: tierType === 'EE + Child' || tierType === 'Family' },
            { rel: 'Domestic Partner', doc: 'Affidavit of domestic partnership', covered: false },
          ].map(({ rel, doc, covered }) => (
            <div key={rel} className={`flex items-center gap-3 p-3 border rounded-xl ${covered ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <Users className={`w-4 h-4 flex-shrink-0 ${covered ? 'text-green-500' : 'text-gray-400'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{rel}</p>
                <p className="text-xs text-gray-400">{doc}</p>
              </div>
              {covered && <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Covered by your tier</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          To add or remove dependents, contact HR at benefits@acme.com or call (555) 123-4567.
        </p>
      </div>
    );
  }

  return (
    <ReviewStep
      elections={elections}
      tierType={tierType}
      plans={plans}
      rates={rates}
      premiumSummary={premiumSummary}
    />
  );
}

interface EnrollmentWizardProps {
  employeeId?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function EnrollmentWizard({
  employeeId = 'ACM-E001',
  onComplete,
  onCancel,
}: EnrollmentWizardProps) {
  const [session, setSession] = useState<WizardSession | null>(null);
  const [step, setStep] = useState(1);
  const [tierType, setTierType] = useState('EE Only');
  const [premiumSummary, setPremiumSummary] = useState<PremiumSummary>();
  const [submitted, setSubmitted] = useState(false);
  const [confirmationId, setConfirmationId] = useState('');
  const [elections, setElections] = useState<WizardElection[]>([
    { productType: 'Medical', planCode: null, tierType, waived: false },
    { productType: 'Dental', planCode: null, tierType, waived: false },
    { productType: 'Vision', planCode: null, tierType, waived: false },
    { productType: 'Life', planCode: 'LIFE-BASIC', tierType: 'EE Only', waived: false },
    { productType: 'HSA', planCode: null, tierType: 'EE Only', waived: true },
    { productType: 'FSA', planCode: null, tierType: 'EE Only', waived: true },
  ]);

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['enrollment', 'plans'],
    queryFn: () => enrollmentApi.getPlans(),
    staleTime: 60_000,
  });

  const startMutation = useMutation({
    mutationFn: () => enrollmentApi.startWizard(employeeId),
    onSuccess: (s) => setSession(s),
  });

  const updateMutation = useMutation({
    mutationFn: ({ s, next, el }: { s: string; next: number; el: WizardElection[] }) =>
      enrollmentApi.updateStep(s, next, el),
    onSuccess: (data) => {
      setSession(data.session);
      setPremiumSummary(data.premiumSummary);
    },
  });

  const submitMutation = useMutation({
    mutationFn: (s: string) => enrollmentApi.submitWizard(s),
    onSuccess: (data) => {
      setConfirmationId(data.enrollmentId);
      setSubmitted(true);
      onComplete?.();
    },
  });

  useEffect(() => {
    startMutation.mutate();
  }, []);

  const handleSetElection = useCallback((productType: string, planCode: string | null, waived: boolean) => {
    setElections((prev) => prev.map((e) =>
      e.productType === productType ? { ...e, planCode, waived, tierType: productType === 'Life' || productType === 'HSA' || productType === 'FSA' ? 'EE Only' : tierType } : e
    ));
  }, [tierType]);

  const handleSetTier = useCallback((t: string) => {
    setTierType(t);
    setElections((prev) => prev.map((e) => ['Medical', 'Dental', 'Vision'].includes(e.productType) ? { ...e, tierType: t } : e));
  }, []);

  const next = async () => {
    if (step === 8) {
      if (session) submitMutation.mutate(session.sessionId);
      return;
    }
    const nextStep = step + 1;
    if (session) {
      await updateMutation.mutateAsync({ s: session.sessionId, next: nextStep, el: elections });
    }
    setStep(nextStep);
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const plans = plansData?.plans ?? [];
  const rates = plansData?.rates ?? [];

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Enrollment Submitted!</h2>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          Your benefits elections for Plan Year 2027 have been received. Coverage is effective January 1, 2027.
        </p>
        <p className="text-xs font-mono bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">
          Confirmation: {confirmationId}
        </p>
        <button
          onClick={onComplete}
          className="mt-2 px-6 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          View My Benefits
        </button>
      </div>
    );
  }

  if (plansLoading || startMutation.isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stepLabel = STEPS.find((s) => s.id === step)?.label ?? '';

  return (
    <div className="space-y-5">
      <StepBar current={step} />

      <Card className="p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          Step {step} of 8 — {stepLabel}
        </h3>
        <StepContent
          step={step}
          elections={elections}
          tierType={tierType}
          plans={plans}
          rates={rates}
          premiumSummary={premiumSummary}
          onSetElection={handleSetElection}
          onSetTier={handleSetTier}
        />
      </Card>

      <div className="flex items-center gap-3">
        <button
          onClick={back}
          disabled={step === 1}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {onCancel && step === 1 && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          onClick={next}
          disabled={updateMutation.isPending || submitMutation.isPending}
          className="ml-auto flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {step === 8 ? (
            <>
              <Send className="w-4 h-4" /> Submit Enrollment
            </>
          ) : (
            <>
              {stepLabel === STEPS[step - 1]?.label ? `Continue to ${STEPS[step]?.label ?? 'Next'}` : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
