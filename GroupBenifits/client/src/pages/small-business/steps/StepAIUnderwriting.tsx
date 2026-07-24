import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2, AlertTriangle, XCircle, FileText, Sparkles, ShieldCheck } from 'lucide-react';
import { WizardState, UnderwritingResult } from '../types';
import { SmartTip } from '../SmallBusinessWizard';

interface Props {
  state: WizardState;
  update: (partial: Partial<WizardState>) => void;
}

function deriveUnderwritingResult(state: WizardState): UnderwritingResult {
  const employees = state.census.employees.filter((e) => e.selected);
  const openExceptions = state.enrollmentExceptions.filter((e) => !e.resolved);
  const exceptionCount = openExceptions.length;

  const enrolledProducts = state.products.filter((p) => p.selectedPlan);
  const totalEnrollments = state.enrollments.filter((r) => r.enrolled).length;
  const hasDocIssues = state.census.aiIssues.some((i) => i.type === 'ERROR');

  if (exceptionCount >= 2 || hasDocIssues) {
    return {
      decision: 'CONDITIONAL_APPROVAL',
      confidence: 78,
      reasons: [
        `${exceptionCount} employee eligibility exception${exceptionCount !== 1 ? 's' : ''} detected — require documentation to confirm eligibility.`,
        'Employment classification inconsistencies identified in census data.',
        'Carrier underwriting requires proof of prior coverage for affected employees.',
      ],
      requiredDocuments: [
        'Proof of prior group coverage for all employees',
        'Employment classification verification for flagged employees',
        'Completed Statement of Health (SOH) for employees without prior coverage',
      ],
      approvedCount: employees.length - exceptionCount,
      exceptionCount,
      summary: `Application is eligible for conditional approval. ${exceptionCount} employee${exceptionCount !== 1 ? 's' : ''} require additional documentation before coverage can be bound.`,
    };
  }

  return {
    decision: 'APPROVE',
    confidence: 94,
    reasons: [
      `All ${employees.length} employees meet standard eligibility requirements.`,
      `${enrolledProducts.length} benefit products properly configured with compliant plan selections.`,
      `${totalEnrollments} enrollment elections recorded — participation rate meets carrier minimums.`,
      'Business profile and census data complete and consistent.',
    ],
    requiredDocuments: [],
    approvedCount: employees.length,
    exceptionCount: 0,
    summary: `Application appears complete and meets all configured eligibility requirements. Recommend approval pending carrier confirmation.`,
  };
}

export default function StepAIUnderwriting({ state, update }: Props) {
  const [reviewing, setReviewing] = useState(false);
  const [reviewed, setReviewed] = useState(!!state.underwritingResult);
  const [reviewPhase, setReviewPhase] = useState(0);

  useEffect(() => {
    if (!reviewed) {
      startReview();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const REVIEW_PHASES = [
    'Scanning enrollment records…',
    'Checking eligibility rules for each employee…',
    'Validating carrier participation minimums…',
    'Reviewing census classifications…',
    'Analyzing underwriting risk factors…',
    'Generating recommendation…',
  ];

  function startReview() {
    setReviewing(true);
    setReviewPhase(0);
    let phase = 0;
    const interval = setInterval(() => {
      phase += 1;
      setReviewPhase(phase);
      if (phase >= REVIEW_PHASES.length - 1) clearInterval(interval);
    }, 420);
    setTimeout(() => {
      clearInterval(interval);
      const result = deriveUnderwritingResult(state);
      update({
        underwritingResult: result,
        applicationStatus: result.decision === 'CONDITIONAL_APPROVAL' ? 'DOCUMENTS_REQUIRED' : 'READY_FOR_SUBMISSION',
      });
      setReviewing(false);
      setReviewed(true);
    }, 2800);
  }

  const result = state.underwritingResult;
  const employees = state.census.employees.filter((e) => e.selected);

  return (
    <div data-testid="step-ai-underwriting" className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">AI Underwriting Review</h2>
        <p className="text-sm text-gray-500 mt-1">Our AI reviews the completed application for eligibility compliance, completeness, and carrier requirements.</p>
      </div>

      <SmartTip>
        AI provides a recommendation with supporting evidence — a human reviewer (you) must approve before the application is submitted. Final carrier decision is separate and binding.
      </SmartTip>

      {/* Reviewing animation */}
      {reviewing && (
        <div className="border border-violet-200 bg-violet-50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-violet-600 animate-pulse" />
            <span className="text-sm font-semibold text-violet-800">AI Underwriting Review in Progress…</span>
          </div>
          <div className="space-y-2">
            {REVIEW_PHASES.map((phase, idx) => (
              <div key={idx} className={`flex items-center gap-2 text-xs transition-all ${idx <= reviewPhase ? 'text-violet-700' : 'text-violet-300'}`}>
                {idx < reviewPhase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                ) : idx === reviewPhase ? (
                  <Sparkles className="w-3.5 h-3.5 text-violet-500 animate-pulse flex-shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                {phase}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application summary while reviewing */}
      {reviewing && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Employees', value: employees.length, color: 'text-gray-900' },
            { label: 'Products', value: state.products.length, color: 'text-gray-900' },
            { label: 'Enrollments', value: state.enrollments.filter((r) => r.enrolled).length, color: 'text-brand-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Decision */}
      {reviewed && result && (
        <div className="space-y-4">
          {/* Decision banner */}
          <div className={`rounded-xl p-5 ${result.decision === 'APPROVE' ? 'bg-emerald-50 border-2 border-emerald-300' : result.decision === 'CONDITIONAL_APPROVAL' ? 'bg-amber-50 border-2 border-amber-300' : 'bg-red-50 border-2 border-red-300'}`}>
            <div className="flex items-center gap-3 mb-3">
              {result.decision === 'APPROVE' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : result.decision === 'CONDITIONAL_APPROVAL' ? (
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              <div>
                <div className={`text-base font-bold ${result.decision === 'APPROVE' ? 'text-emerald-800' : result.decision === 'CONDITIONAL_APPROVAL' ? 'text-amber-800' : 'text-red-800'}`}>
                  AI Recommendation: {result.decision === 'APPROVE' ? 'APPROVE' : result.decision === 'CONDITIONAL_APPROVAL' ? 'CONDITIONAL APPROVAL' : 'REJECT'}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">{result.confidence}% confidence · {result.approvedCount} of {employees.length} employees approved</div>
              </div>
            </div>
            <p className={`text-sm ${result.decision === 'APPROVE' ? 'text-emerald-700' : result.decision === 'CONDITIONAL_APPROVAL' ? 'text-amber-700' : 'text-red-700'}`}>
              {result.summary}
            </p>
          </div>

          {/* Evidence */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-800">Supporting Evidence</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {result.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-3 px-4 py-3">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${result.decision === 'APPROVE' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                    {result.decision === 'APPROVE'
                      ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      : <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />}
                  </div>
                  <p className="text-xs text-gray-700">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Required Documents (if conditional) */}
          {result.requiredDocuments.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Documents Required</span>
              </div>
              <ul className="space-y-1.5">
                {result.requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-amber-700">
                    <span className="text-amber-400 font-bold">•</span>
                    {doc}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-amber-600 mt-3 font-medium">
                You'll be prompted to upload these documents in the next step.
              </p>
            </div>
          )}

          {/* Human approval note */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600">
                <span className="font-semibold text-gray-800">AI Guardrail:</span> This recommendation was generated by AI and does not constitute a legally binding eligibility determination or carrier approval. The CFO/Authorized Signatory must review and approve before submission. Final coverage is subject to carrier underwriting.
              </div>
            </div>
          </div>

          <button onClick={startReview} className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1">
            <Brain className="w-3.5 h-3.5" /> Re-run AI Review
          </button>
        </div>
      )}
    </div>
  );
}
