import React from 'react';
import { WizardState, BillingData } from '../types';
import { SmartTip } from '../SmallBusinessWizard';

interface Props {
  state: WizardState;
  update: (partial: Partial<WizardState>) => void;
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
    </div>
  );
}

const PAYROLL_FREQS = ['Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly'];
const BILLING_FREQS = ['Monthly', 'Quarterly', 'Annually'];

export default function Step6Billing({ state, update }: Props) {
  const billing = state.billing;

  function set(field: keyof BillingData, value: string | boolean) {
    update({ billing: { ...billing, [field]: value } });
  }

  const statutoryProducts = state.products.filter((p) => p.type === 'statutory');
  const voluntaryProducts = state.products.filter((p) => p.type === 'voluntary');

  return (
    <div data-testid="step-billing" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Billing & Deductions</h2>
        <p className="text-sm text-gray-500 mt-1">Configure how statutory benefits are billed to you and how voluntary deductions are taken from employee paychecks.</p>
      </div>

      <SmartTip>
        Employer-billed statutory benefits are invoiced directly to you. Employee voluntary deductions are collected via payroll and remitted to the carrier automatically.
      </SmartTip>

      {/* Employer-billed statutory */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Employer-Billed Benefits</h3>
          <p className="text-xs text-gray-500 mt-0.5">These are fully employer-paid statutory benefits invoiced directly to your company.</p>
        </div>
        {statutoryProducts.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No statutory benefits selected.</p>
        ) : (
          <ul className="space-y-1.5">
            {statutoryProducts.map((p) => (
              <li key={p.productId} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{p.name}</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Employer-paid</span>
              </li>
            ))}
          </ul>
        )}
        <Field label="Invoice Frequency" required>
          <select className={inputCls} value={billing.employerBillingFrequency} onChange={(e) => set('employerBillingFrequency', e.target.value)}>
            {BILLING_FREQS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
      </div>

      {/* Payroll deductions */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Payroll Deductions</h3>
            <p className="text-xs text-gray-500 mt-0.5">Voluntary benefit premiums collected from employee paychecks.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={billing.payrollDeductionEnabled}
            onClick={() => set('payrollDeductionEnabled', !billing.payrollDeductionEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${billing.payrollDeductionEnabled ? 'bg-brand-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${billing.payrollDeductionEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {billing.payrollDeductionEnabled && (
          <>
            {voluntaryProducts.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No voluntary benefits selected — no payroll deductions needed.</p>
            ) : (
              <ul className="space-y-1.5">
                {voluntaryProducts.map((p) => (
                  <li key={p.productId} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{p.name}</span>
                    <span className="text-xs text-gray-500">{p.selectedPlan?.price ?? 'Plan not selected'}</span>
                  </li>
                ))}
              </ul>
            )}
            <Field label="Payroll Frequency" required>
              <select className={inputCls} value={billing.payrollFrequency} onChange={(e) => set('payrollFrequency', e.target.value)}>
                {PAYROLL_FREQS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
          </>
        )}
      </div>

      {/* Billing contact */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Billing Contact</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Contact Name" required>
            <input className={inputCls} value={billing.billingContactName} onChange={(e) => set('billingContactName', e.target.value)} placeholder="Jane Smith" />
          </Field>
          <Field label="Billing Email" required>
            <input className={inputCls} type="email" value={billing.billingEmail} onChange={(e) => set('billingEmail', e.target.value)} placeholder="billing@company.com" />
          </Field>
        </div>
      </div>

      {/* Cost summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Estimated Monthly Cost Summary</h3>
        <div className="space-y-2 text-sm">
          {statutoryProducts.map((p) => (
            <div key={p.productId} className="flex justify-between">
              <span className="text-gray-600">{p.name}</span>
              <span className="font-medium text-gray-900">Employer-paid</span>
            </div>
          ))}
          {voluntaryProducts.map((p) => (
            <div key={p.productId} className="flex justify-between">
              <span className="text-gray-600">{p.name}</span>
              <span className="font-medium text-gray-500">{p.selectedPlan?.price ?? '—'} per EE</span>
            </div>
          ))}
          <hr className="border-gray-200 mt-2" />
          <div className="flex justify-between font-semibold">
            <span className="text-gray-700">Total Enrolled Employees</span>
            <span className="text-gray-900">{state.census.employees.filter((e) => e.selected).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
