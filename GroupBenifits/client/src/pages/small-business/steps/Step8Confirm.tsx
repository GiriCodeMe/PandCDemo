import React, { useRef } from 'react';
import { User, Building2, Users, Package, CreditCard, FileText, ChevronDown, ShieldCheck, Brain } from 'lucide-react';
import { WizardState } from '../types';
import { SmartTip } from '../SmallBusinessWizard';

interface Props {
  state: WizardState;
  update: (partial: Partial<WizardState>) => void;
  onSubmit: () => void;
}

const TERMS = `GROUP BENEFITS APPLICATION AGREEMENT

This Group Benefits Application ("Agreement") is entered into between the Employer identified herein and Claude Benefits Insurance Services, LLC ("Administrator").

1. COVERAGE AUTHORIZATION
By submitting this application, Employer authorizes the Administrator to arrange for the placement of the employee benefit products selected with the applicable insurance carriers.

2. PREMIUM PAYMENT OBLIGATIONS
Employer agrees to pay all applicable premiums on the dates specified. Failure to remit payment within 30 days may result in cancellation of coverage per state requirements.

3. ELIGIBILITY AND ENROLLMENT
Employer agrees to maintain accurate employee records and promptly notify the Administrator of changes in employee eligibility, including new hires, terminations, and qualifying life events within specified timeframes.

4. ERISA COMPLIANCE
Where applicable, Employer acknowledges responsibility for ERISA plan document maintenance, SPD distribution, and Form 5500 annual reporting for plans subject to ERISA requirements.

5. DATA PRIVACY AND SECURITY
Employee personal information including names, dates of birth, encrypted Social Security Numbers, and health information will be shared with Carriers per HIPAA regulations and the Administrator's Privacy Policy.

6. COBRA ADMINISTRATION
For groups subject to COBRA, Employer acknowledges responsibility for timely qualifying event notification.

7. REGULATORY COMPLIANCE
Employer agrees to comply with all applicable federal, state, and local laws governing employee benefit plans, including ACA, HIPAA, ERISA, COBRA, and applicable state continuation coverage laws.

8. TERM AND TERMINATION
This Agreement shall remain in effect for the plan year and shall renew automatically unless either party provides 60 days written notice prior to the renewal date.

9. AI GUARDRAIL ACKNOWLEDGEMENT
Employer acknowledges that AI-generated recommendations provided during this application process are advisory in nature, do not constitute legally binding eligibility determinations or carrier approvals, and are subject to human review and carrier underwriting. Final coverage and premiums are determined by the applicable insurance carrier.

10. LIMITATION OF LIABILITY
The Administrator's liability under this Agreement shall not exceed total premiums paid in the 12 months preceding the event giving rise to the claim.

11. GOVERNING LAW
This Agreement is governed by the laws of the state of the Employer's principal place of business.

By providing your electronic signature below, you confirm that you have read, understood, and agree to be bound by the terms of this Agreement, and that you are authorized to execute this Agreement on behalf of the Employer.`;

function SummaryCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-brand-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[11px] text-gray-400">{label}</span>
      <span className="text-[11px] font-medium text-gray-800 text-right">{value}</span>
    </div>
  );
}

const CFO_TITLES = ['CFO', 'CEO', 'COO', 'President', 'Owner', 'Other Authorized Officer'];

export default function Step8Confirm({ state, update, onSubmit }: Props) {
  const termsRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = React.useState(false);

  function handleTermsScroll() {
    const el = termsRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setScrolled(true);
  }

  const canSubmit = state.agreedToTerms && state.signature.trim().length > 3 && state.cfoApproval.approved && state.cfoApproval.signature.trim().length > 3;

  const enrolledCount = (() => {
    const empIds = new Set(state.census.employees.filter((e) => e.selected).map((e) => e.id));
    return state.enrollments.filter((r) => r.enrolled && empIds.has(r.employeeId)).length;
  })();

  const totalMonthly = state.quoteLines.reduce((sum, l) => sum + l.monthlyTotal, 0);
  const underwritingDecision = state.underwritingResult?.decision ?? 'APPROVE';

  const setCfo = (field: keyof typeof state.cfoApproval, value: string | boolean) => {
    update({ cfoApproval: { ...state.cfoApproval, [field]: value } });
  };

  return (
    <div data-testid="step-confirm" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Final Review & Submission</h2>
        <p className="text-sm text-gray-500 mt-1">Review your application, obtain CFO/Authorized Signatory approval, and submit.</p>
      </div>

      <SmartTip>
        By submitting, you authorize Claude Benefits to process your group benefits application with the selected carriers. Coverage is effective upon carrier approval.
      </SmartTip>

      {/* AI Underwriting Summary Banner */}
      {state.underwritingResult && (
        <div className={`rounded-xl p-4 flex items-start gap-3 ${underwritingDecision === 'APPROVE' ? 'bg-emerald-50 border border-emerald-200' : underwritingDecision === 'CONDITIONAL_APPROVAL' ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
          <Brain className={`w-5 h-5 flex-shrink-0 mt-0.5 ${underwritingDecision === 'APPROVE' ? 'text-emerald-600' : underwritingDecision === 'CONDITIONAL_APPROVAL' ? 'text-amber-600' : 'text-red-600'}`} />
          <div>
            <p className={`text-sm font-semibold ${underwritingDecision === 'APPROVE' ? 'text-emerald-800' : underwritingDecision === 'CONDITIONAL_APPROVAL' ? 'text-amber-800' : 'text-red-800'}`}>
              AI Recommendation: {underwritingDecision.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">{state.underwritingResult.summary}</p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SummaryCard icon={User} title="Authorized Signer">
          <Row label="Name" value={`${state.owner.firstName} ${state.owner.lastName}`.trim() || '—'} />
          <Row label="Title" value={state.owner.title || '—'} />
          <Row label="Email" value={state.owner.email || '—'} />
        </SummaryCard>
        <SummaryCard icon={Building2} title="Business">
          <Row label="Legal Name" value={state.business.legalName || '—'} />
          <Row label="Entity" value={state.business.entityType || '—'} />
          <Row label="EIN" value={state.business.ein ? `**-***${state.business.ein.slice(-4)}` : '—'} />
        </SummaryCard>
        <SummaryCard icon={Users} title="Census & Enrollment">
          <Row label="Eligible Employees" value={state.census.employees.filter((e) => e.selected).length} />
          <Row label="Enrollment Elections" value={enrolledCount} />
          <Row label="Exceptions Resolved" value={`${state.enrollmentExceptions.filter((e) => e.resolved).length}/${state.enrollmentExceptions.length}`} />
        </SummaryCard>
        <SummaryCard icon={Package} title="Benefits & Quote">
          <Row label="Products Selected" value={state.products.length} />
          <Row label="Estimated Monthly" value={totalMonthly > 0 ? `$${totalMonthly.toLocaleString()}` : '—'} />
          <Row label="Documents Uploaded" value={state.documents.filter((d) => d.status === 'accepted').length} />
        </SummaryCard>
        <SummaryCard icon={CreditCard} title="Payment">
          <Row label="Method" value={state.payment.method === 'ach' ? 'ACH Bank Transfer' : 'Credit/Debit Card'} />
          <Row label="Billing Frequency" value={state.billing.employerBillingFrequency} />
          <Row label="Payroll Deductions" value={state.billing.payrollDeductionEnabled ? state.billing.payrollFrequency : 'Disabled'} />
        </SummaryCard>
        <SummaryCard icon={ShieldCheck} title="AI Review">
          <Row label="Decision" value={state.underwritingResult?.decision.replace(/_/g, ' ') ?? '—'} />
          <Row label="Confidence" value={state.underwritingResult ? `${state.underwritingResult.confidence}%` : '—'} />
          <Row label="Approved Employees" value={state.underwritingResult?.approvedCount ?? '—'} />
        </SummaryCard>
      </div>

      {/* CFO / Authorized Signatory Approval */}
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">CFO / Authorized Signatory Approval</h3>
              <p className="text-xs text-gray-500 mt-0.5">Required before application can be submitted to the carrier.</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Approver Full Name <span className="text-red-500">*</span></label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={state.cfoApproval.approverName}
                onChange={(e) => setCfo('approverName', e.target.value)}
                placeholder="Sarah Johnson"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Approver Title <span className="text-red-500">*</span></label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                value={state.cfoApproval.approverTitle}
                onChange={(e) => setCfo('approverTitle', e.target.value)}
              >
                {CFO_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              CFO/Authorized Signatory E-Signature <span className="text-red-500">*</span>
            </label>
            <p className="text-[10px] text-gray-400 mb-1">Type your full legal name to apply your electronic signature as the authorized signatory.</p>
            <input
              type="text"
              value={state.cfoApproval.signature}
              onChange={(e) => setCfo('signature', e.target.value)}
              placeholder={state.cfoApproval.approverName || 'Authorized signatory full name'}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
            />
          </div>

          <label className={`flex items-start gap-3 cursor-pointer p-3 border-2 rounded-xl transition-colors ${state.cfoApproval.approved ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
            <input
              type="checkbox"
              checked={state.cfoApproval.approved}
              onChange={(e) => setCfo('approved', e.target.checked)}
              className="mt-0.5 rounded border-gray-300 text-brand-600"
            />
            <span className="text-sm text-gray-700">
              I, as {state.cfoApproval.approverTitle || 'the Authorized Signatory'}, have reviewed the AI underwriting recommendation, application summary, and estimated premiums, and hereby authorize the submission of this group benefits application.
            </span>
          </label>
        </div>
      </div>

      {/* Terms & Agreement */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Terms & Agreement</h3>
          {!scrolled && (
            <div className="flex items-center gap-1 text-xs text-gray-400 animate-bounce">
              <ChevronDown className="w-3.5 h-3.5" />
              Scroll to read
            </div>
          )}
        </div>
        <div ref={termsRef} onScroll={handleTermsScroll} className="h-40 overflow-y-auto p-4 text-xs text-gray-600 leading-relaxed whitespace-pre-line font-mono bg-white">
          {TERMS}
        </div>
      </div>

      {/* Owner agreement checkbox */}
      <label className={`flex items-start gap-3 cursor-pointer p-4 border-2 rounded-xl transition-colors ${state.agreedToTerms ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
        <input
          type="checkbox"
          checked={state.agreedToTerms}
          onChange={(e) => update({ agreedToTerms: e.target.checked })}
          className="mt-0.5 rounded border-gray-300 text-brand-600"
        />
        <span className="text-sm text-gray-700">
          I have read and agree to the Terms and Conditions. I confirm that I am the Business Owner / authorized representative and have the authority to execute this Agreement.
        </span>
      </label>

      {/* Owner e-signature */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          Business Owner E-Signature <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">Type your full legal name exactly as listed on the application.</p>
        <input
          type="text"
          value={state.signature}
          onChange={(e) => update({ signature: e.target.value })}
          placeholder={`${state.owner.firstName} ${state.owner.lastName}`.trim() || 'Your full legal name'}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
        />
        {state.signature.trim().length > 0 && (
          <p className="text-[10px] text-gray-400 mt-1">Signed by: {state.signature} · {new Date().toLocaleDateString()}</p>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className={`w-full py-3.5 text-sm font-bold rounded-xl transition-all ${canSubmit ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
      >
        {!state.agreedToTerms
          ? 'Agree to Terms to Submit'
          : !state.cfoApproval.approved
          ? 'Authorized Signatory Must Approve First'
          : state.signature.trim().length <= 3
          ? 'Enter Your E-Signature to Submit'
          : 'Submit Application for Carrier Review →'}
      </button>

      <p className="text-[10px] text-gray-400 text-center">
        Application will be reviewed within 1–2 business days. Confirmation sent to {state.owner.email || 'your email'}.
      </p>
    </div>
  );
}
