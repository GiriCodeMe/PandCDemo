import React from 'react';
import { CreditCard, Building2 } from 'lucide-react';
import { WizardState, PaymentData } from '../types';
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

function maskCardNumber(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})/g, '$1 ').trim();
}

export default function Step7Payment({ state, update }: Props) {
  const payment = state.payment;

  function set(field: keyof PaymentData, value: string) {
    update({ payment: { ...payment, [field]: value } });
  }

  function setMethod(method: 'ach' | 'card') {
    update({ payment: { ...payment, method } });
  }

  return (
    <div data-testid="step-payment" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
        <p className="text-sm text-gray-500 mt-1">Choose how your employer premium invoices will be paid each billing cycle.</p>
      </div>

      <SmartTip>
        ACH bank transfer is recommended for recurring monthly premiums — no processing fees and automatic reconciliation. Credit cards may incur a 2.9% processing fee.
      </SmartTip>

      {/* Method tabs */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setMethod('ach')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${payment.method === 'ach' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <Building2 className="w-4 h-4" />
          ACH / Bank Transfer
        </button>
        <button
          onClick={() => setMethod('card')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-l border-gray-200 ${payment.method === 'card' ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          <CreditCard className="w-4 h-4" />
          Credit / Debit Card
        </button>
      </div>

      {/* ACH form */}
      {payment.method === 'ach' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
            Your bank information is encrypted and stored securely. We use it only to process your monthly premium invoices.
          </div>
          <Field label="Bank Name" required>
            <input className={inputCls} value={payment.bankName} onChange={(e) => set('bankName', e.target.value)} placeholder="First National Bank" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Routing Number" required>
              <input className={inputCls} value={payment.routingNumber} onChange={(e) => set('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="021000021" maxLength={9} />
            </Field>
            <Field label="Account Number" required>
              <input className={inputCls} value={payment.accountNumber} onChange={(e) => set('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 17))} placeholder="123456789" type="password" />
            </Field>
          </div>
          <Field label="Account Type" required>
            <div className="flex gap-3">
              {['Checking', 'Savings'].map((type) => (
                <label key={type} className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-lg cursor-pointer text-sm font-medium transition-colors ${payment.accountType === type ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <input type="radio" name="accountType" checked={payment.accountType === type} onChange={() => set('accountType', type)} className="hidden" />
                  {type}
                </label>
              ))}
            </div>
          </Field>
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            <strong>Verification:</strong> We'll make two small test deposits (under $1.00) to your account within 1–2 business days. Confirm the amounts in your profile to activate ACH payments.
          </div>
        </div>
      )}

      {/* Card form */}
      {payment.method === 'card' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            A 2.9% processing fee applies to credit and debit card payments. Consider ACH for fee-free billing.
          </div>
          <Field label="Cardholder Name" required>
            <input className={inputCls} value={payment.cardName} onChange={(e) => set('cardName', e.target.value)} placeholder="Jane Smith" />
          </Field>
          <Field label="Card Number" required>
            <input
              className={inputCls}
              value={payment.cardNumber}
              onChange={(e) => set('cardNumber', maskCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Expiry Date" required>
              <input
                className={inputCls}
                value={payment.cardExpiry}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  set('cardExpiry', v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                }}
                placeholder="MM/YY"
                maxLength={5}
              />
            </Field>
            <Field label="CVV" required>
              <input className={inputCls} value={payment.cardCvv} onChange={(e) => set('cardCvv', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" type="password" maxLength={4} />
            </Field>
          </div>
          <div className="flex gap-2 mt-2">
            {['visa', 'mastercard', 'amex', 'discover'].map((brand) => (
              <span key={brand} className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-wide">{brand}</span>
            ))}
          </div>
        </div>
      )}

      {/* Security note */}
      <div className="flex items-start gap-2 text-xs text-gray-400">
        <span>🔒</span>
        <span>All payment information is encrypted using AES-256 and transmitted over TLS. We comply with PCI-DSS Level 1 standards.</span>
      </div>
    </div>
  );
}
