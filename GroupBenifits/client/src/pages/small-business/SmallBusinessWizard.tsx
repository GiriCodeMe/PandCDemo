import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Lightbulb, Save } from 'lucide-react';
import { INITIAL_STATE, WizardState, ApplicationStatus } from './types';
import Step1Owner from './steps/Step1Owner';
import Step2Business from './steps/Step2Business';
import Step3Census from './steps/Step3Census';
import Step4Benefits from './steps/Step4Benefits';
import StepAIPlanRec from './steps/StepAIPlanRec';
import Step5Enrollment from './steps/Step5Enrollment';
import StepAIUnderwriting from './steps/StepAIUnderwriting';
import StepDocuments from './steps/StepDocuments';
import Step6Billing from './steps/Step6Billing';
import Step7Payment from './steps/Step7Payment';
import Step8Confirm from './steps/Step8Confirm';
import SmallBusinessConfirmation from './SmallBusinessConfirmation';

const STEPS = [
  { label: 'Owner', shortLabel: 'Owner' },
  { label: 'Business', shortLabel: 'Business' },
  { label: 'Census', shortLabel: 'Census' },
  { label: 'Benefits', shortLabel: 'Benefits' },
  { label: 'AI Plan & Quote', shortLabel: 'Quote' },
  { label: 'Enrollment', shortLabel: 'Enroll' },
  { label: 'AI Review', shortLabel: 'AI Review' },
  { label: 'Documents', shortLabel: 'Docs' },
  { label: 'Billing', shortLabel: 'Billing' },
  { label: 'Payment', shortLabel: 'Payment' },
  { label: 'Review & Submit', shortLabel: 'Submit' },
];

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  CENSUS_VALIDATION: 'bg-blue-100 text-blue-700',
  QUOTE_GENERATED: 'bg-cyan-100 text-cyan-700',
  ENROLLMENT_IN_PROGRESS: 'bg-brand-100 text-brand-700',
  AI_REVIEW: 'bg-violet-100 text-violet-700',
  DOCUMENTS_REQUIRED: 'bg-amber-100 text-amber-700',
  READY_FOR_SUBMISSION: 'bg-emerald-100 text-emerald-700',
  PENDING_SIGNATURE: 'bg-indigo-100 text-indigo-700',
  SUBMITTED: 'bg-brand-100 text-brand-700',
  UNDER_REVIEW: 'bg-violet-100 text-violet-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  CONDITIONALLY_APPROVED: 'bg-amber-100 text-amber-700',
  PAYMENT_PENDING: 'bg-orange-100 text-orange-700',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
};

interface StepperProps {
  current: number;
}

function Stepper({ current }: StepperProps) {
  return (
    <div className="flex items-center w-full overflow-x-auto py-1 gap-0">
      {STEPS.map((step, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0 min-w-[40px]">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${done ? 'bg-brand-600 text-white' : active ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-gray-100 text-gray-400'}`}>
                {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className={`text-[9px] font-medium hidden md:block text-center leading-tight max-w-[48px] ${active ? 'text-brand-700' : done ? 'text-brand-400' : 'text-gray-300'}`}>
                {step.shortLabel}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${idx < current ? 'bg-brand-400' : 'bg-gray-200'}`} style={{ minWidth: '8px' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

interface SmartTipProps {
  children: React.ReactNode;
}

export function SmartTip({ children }: SmartTipProps) {
  return (
    <div className="flex items-start gap-2.5 bg-brand-50 border border-brand-100 rounded-lg p-3 text-sm text-brand-800">
      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-500" />
      <span>{children}</span>
    </div>
  );
}

// Draft save simulation
function saveDraft(state: WizardState, step: number) {
  try {
    sessionStorage.setItem('sb_wizard_draft', JSON.stringify({ state, step, savedAt: new Date().toISOString() }));
  } catch {
    // ignore quota errors
  }
}

function loadDraft(): { state: WizardState; step: number } | null {
  try {
    const raw = sessionStorage.getItem('sb_wizard_draft');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function SmallBusinessWizard() {
  const navigate = useNavigate();
  const draft = loadDraft();

  const [currentStep, setCurrentStep] = useState(draft?.step ?? 0);
  const [submitted, setSubmitted] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>(draft?.state ?? INITIAL_STATE);
  const [savedFlash, setSavedFlash] = useState(false);

  function updateState(partial: Partial<WizardState>) {
    setWizardState((prev) => {
      const next = { ...prev, ...partial };
      return next;
    });
  }

  function handleNext() {
    const nextStep = Math.min(currentStep + 1, STEPS.length - 1);
    setCurrentStep(nextStep);
    saveDraft(wizardState, nextStep);
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function handleSaveDraft() {
    saveDraft(wizardState, currentStep);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  function handleSubmit() {
    updateState({ applicationStatus: 'SUBMITTED' });
    sessionStorage.removeItem('sb_wizard_draft');
    setSubmitted(true);
  }

  if (submitted) {
    return <SmallBusinessConfirmation wizardState={wizardState} onDone={() => navigate('/')} />;
  }

  const stepProps = { state: wizardState, update: updateState };

  const steps: React.ReactNode[] = [
    <Step1Owner key="s1" {...stepProps} />,
    <Step2Business key="s2" {...stepProps} />,
    <Step3Census key="s3" {...stepProps} />,
    <Step4Benefits key="s4" {...stepProps} />,
    <StepAIPlanRec key="s5" {...stepProps} />,
    <Step5Enrollment key="s6" {...stepProps} />,
    <StepAIUnderwriting key="s7" {...stepProps} />,
    <StepDocuments key="s8" {...stepProps} />,
    <Step6Billing key="s9" {...stepProps} />,
    <Step7Payment key="s10" {...stepProps} />,
    <Step8Confirm key="s11" {...stepProps} onSubmit={handleSubmit} />,
  ];

  const isLastStep = currentStep === STEPS.length - 1;
  const statusColor = STATUS_COLORS[wizardState.applicationStatus] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="max-w-3xl mx-auto" data-testid="small-business-wizard">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="hover:text-gray-600">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-600 font-medium">Small Business Enrollment</span>
          </div>
          <button onClick={() => navigate('/small-business/portfolio')} className="text-xs text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1">
            My Portfolio →
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Group Benefits Application</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep].label}
              {wizardState.business.legalName && <span className="ml-2 text-gray-400">· {wizardState.business.legalName}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor}`}>
              {wizardState.applicationStatus.replace(/_/g, ' ')}
            </span>
            <button
              onClick={handleSaveDraft}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border rounded-lg transition-colors ${savedFlash ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <Save className="w-3.5 h-3.5" />
              {savedFlash ? 'Saved!' : 'Save Draft'}
            </button>
          </div>
        </div>
      </div>

      {/* Draft resume banner */}
      {draft && currentStep === draft.step && draft.step > 0 && (
        <div className="mb-4 bg-brand-50 border border-brand-200 rounded-xl p-3 flex items-center justify-between">
          <div className="text-sm text-brand-800">
            <span className="font-semibold">Draft resumed</span> — saved at step {draft.step + 1} ({STEPS[draft.step].label}).
          </div>
          <button onClick={() => { setCurrentStep(0); setWizardState(INITIAL_STATE); }} className="text-xs text-brand-600 hover:text-brand-800 font-medium">Start over</button>
        </div>
      )}

      {/* Stepper */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
        <Stepper current={currentStep} />
      </div>

      {/* Step content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-5">
        {steps[currentStep]}
      </div>

      {/* Navigation */}
      {!isLastStep && (
        <div className="flex items-center justify-between">
          <button
            onClick={currentStep === 0 ? () => navigate('/') : handleBack}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {currentStep === 0 ? 'Cancel' : '← Back'}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleSaveDraft} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <Save className="w-3 h-3" /> Save
            </button>
            <button onClick={handleNext} className="px-6 py-2.5 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
              Continue →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
