import React, { useEffect, useState } from 'react';
import { CheckCircle2, Download, ArrowRight, Mail, Phone, Clock, CreditCard, Shield, Loader2 } from 'lucide-react';
import { WizardState } from './types';

interface Props {
  wizardState: WizardState;
  onDone: () => void;
}

function generateAppNumber(): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(10000 + Math.random() * 90000));
  return `APP-${year}-${rand}`;
}

const APP_NUMBER = generateAppNumber();

type Stage = 'submitting' | 'carrier_review' | 'carrier_approved' | 'payment_processing' | 'payment_success' | 'active';

const CARRIER_LINES = [
  { id: 'med', label: 'Medical — PPO Premier', delay: 400 },
  { id: 'den', label: 'Dental — Comprehensive', delay: 900 },
  { id: 'vis', label: 'Vision — Premium', delay: 1300 },
  { id: 'life', label: 'Basic Life Insurance', delay: 1700 },
  { id: 'std', label: 'Short-Term Disability', delay: 2100 },
];

export default function SmallBusinessConfirmation({ wizardState, onDone }: Props) {
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState<Stage>('submitting');
  const [approvedLines, setApprovedLines] = useState<string[]>([]);

  const employeeCount = wizardState.census.employees.filter((e) => e.selected).length;
  const productCount = wizardState.products.length;
  const totalMonthly = wizardState.quoteLines.reduce((sum, l) => sum + l.monthlyTotal, 0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Simulate carrier API + payment flow
  useEffect(() => {
    const t1 = setTimeout(() => setStage('carrier_review'), 1000);
    const lineTimers = CARRIER_LINES.map((l) =>
      setTimeout(() => setApprovedLines((prev) => [...prev, l.id]), 1000 + l.delay)
    );
    const t2 = setTimeout(() => setStage('carrier_approved'), 3600);
    const t3 = setTimeout(() => setStage('payment_processing'), 4200);
    const t4 = setTimeout(() => setStage('payment_success'), 6000);
    const t5 = setTimeout(() => setStage('active'), 6800);
    return () => [t1, t2, t3, t4, t5, ...lineTimers].forEach(clearTimeout);
  }, []);

  const isActive = stage === 'active';

  return (
    <div data-testid="small-business-confirmation" className="max-w-2xl mx-auto">
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Live carrier/payment status */}
        {!isActive && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
              <h2 className="text-base font-bold text-gray-900">
                {stage === 'submitting' ? 'Submitting application…' :
                 stage === 'carrier_review' ? 'Carrier review in progress…' :
                 stage === 'carrier_approved' ? 'Carrier approvals received — processing payment…' :
                 stage === 'payment_processing' ? 'Processing first premium payment…' :
                 'Activating coverage…'}
              </h2>
            </div>

            {(stage === 'carrier_review' || stage === 'carrier_approved') && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">Mock Carrier API submitting enrollments…</p>
                {CARRIER_LINES.map((l) => {
                  const approved = approvedLines.includes(l.id);
                  return (
                    <div key={l.id} className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${approved ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                      {approved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-gray-300 animate-spin flex-shrink-0" />
                      )}
                      <span className={`text-sm ${approved ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>{l.label}</span>
                      {approved && <span className="ml-auto text-xs font-bold text-emerald-600">APPROVED</span>}
                    </div>
                  );
                })}
              </div>
            )}

            {(stage === 'payment_processing' || stage === 'payment_success') && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-emerald-700 font-medium">All carriers approved</span>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-lg transition-all ${stage === 'payment_success' ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                  {stage === 'payment_success'
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                  <div>
                    <div className={`text-sm font-medium ${stage === 'payment_success' ? 'text-emerald-700' : 'text-blue-700'}`}>
                      {stage === 'payment_success' ? 'Payment processed successfully' : 'Processing first premium payment…'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {totalMonthly > 0 ? `$${totalMonthly.toLocaleString()}` : 'Monthly premium'} via {wizardState.payment.method === 'ach' ? 'ACH transfer' : 'card'}
                    </div>
                  </div>
                  {stage === 'payment_success' && (
                    <span className="ml-auto text-xs font-bold text-emerald-600">SUCCESS</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Final Active state */}
        {isActive && (
          <>
            {/* Animated checkmark */}
            <div className="text-center mb-6">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute w-28 h-28 rounded-full bg-emerald-100 animate-ping opacity-20" />
                <div className="relative w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Coverage is Active!</h1>
              <p className="text-gray-500 text-base mb-1">Your group benefits application has been approved and coverage is now bound.</p>
              <p className="text-brand-700 font-semibold text-sm mb-1">
                Reference: <span className="font-mono bg-brand-50 px-2 py-0.5 rounded">{APP_NUMBER}</span>
              </p>
              <span className="inline-block mt-2 text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wide">ACTIVE</span>
            </div>

            {/* Carrier approvals summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-gray-800">Carrier Approvals</h2>
              </div>
              <div className="space-y-1.5">
                {CARRIER_LINES.slice(0, productCount || CARRIER_LINES.length).map((l) => (
                  <div key={l.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">{l.label}</span>
                    <span className="ml-auto text-xs font-mono text-gray-400">POL-{APP_NUMBER.slice(-5)}-{l.id.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment confirmation */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-brand-600" />
                <h2 className="text-sm font-bold text-gray-800">Payment Confirmation</h2>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400 text-xs">Method</span><span className="text-xs font-medium">{wizardState.payment.method === 'ach' ? 'ACH Bank Transfer' : 'Credit/Debit Card'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400 text-xs">Amount</span><span className="text-xs font-medium text-emerald-700">{totalMonthly > 0 ? `$${totalMonthly.toLocaleString()}` : '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400 text-xs">Status</span><span className="text-xs font-bold text-emerald-700">Processed</span></div>
                <div className="flex justify-between"><span className="text-gray-400 text-xs">Next Invoice</span><span className="text-xs font-medium">Next month</span></div>
              </div>
            </div>

            {/* Application summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
              <h2 className="text-sm font-bold text-gray-700 mb-3">Application Summary</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  { label: 'Business', value: wizardState.business.legalName || 'Your Business' },
                  { label: 'Authorized By', value: `${wizardState.owner.firstName} ${wizardState.owner.lastName}`.trim() || '—' },
                  { label: 'CFO Approved By', value: wizardState.cfoApproval.approverName || '—' },
                  { label: 'Employees Enrolled', value: employeeCount },
                  { label: 'Benefits Active', value: productCount },
                  { label: 'AI Decision', value: (wizardState.underwritingResult?.decision ?? 'APPROVE').replace(/_/g, ' ') },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400 text-xs">{label}</span>
                    <span className="text-xs font-medium text-gray-800">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-5">
              <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">What Happens Next?</h2>
              <div className="space-y-4">
                {[
                  { icon: Mail, step: 'Welcome packets sent', detail: 'Employees receive welcome emails with benefit summaries and ID card information.' },
                  { icon: Clock, step: 'ID cards issued in 7–10 days', detail: 'Physical and digital ID cards will be mailed to enrolled employee addresses.' },
                  { icon: CreditCard, step: 'Auto-pay scheduled', detail: `Monthly invoices of ${totalMonthly > 0 ? `$${totalMonthly.toLocaleString()}` : 'your premium'} will be auto-paid via your selected payment method.` },
                  { icon: Shield, step: 'Coverage effective immediately', detail: 'Employees can begin using benefits today. Claims submitted after the effective date are covered.' },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-brand-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{s.step}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact */}
            <div className="text-sm text-gray-500 text-center mb-6">
              Questions? Contact your benefits specialist at{' '}
              <span className="font-medium text-gray-700 inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> 1-800-BENEFITS</span>{' '}
              or <span className="font-medium text-brand-700">support@claudebenefits.com</span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  const summary = [
                    `Group Benefits Application — ${APP_NUMBER}`,
                    `Status: ACTIVE`,
                    `Business: ${wizardState.business.legalName}`,
                    `Employees Enrolled: ${employeeCount}`,
                    `Benefits Active: ${productCount}`,
                    `Monthly Premium: ${totalMonthly > 0 ? `$${totalMonthly.toLocaleString()}` : 'See invoice'}`,
                    `Authorized By: ${wizardState.owner.firstName} ${wizardState.owner.lastName}`,
                    `CFO Approved By: ${wizardState.cfoApproval.approverName} (${wizardState.cfoApproval.approverTitle})`,
                    `AI Decision: ${wizardState.underwritingResult?.decision ?? 'APPROVE'}`,
                    `Date: ${new Date().toLocaleDateString()}`,
                  ].join('\n');
                  const blob = new Blob([summary], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `application-${APP_NUMBER}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 justify-center px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Summary
              </button>
              <button
                onClick={onDone}
                className="flex items-center gap-2 justify-center px-6 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                Return to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
