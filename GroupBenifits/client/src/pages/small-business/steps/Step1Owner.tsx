import React from 'react';
import { WizardState, OwnerData } from '../types';
import { SmartTip } from '../SmallBusinessWizard';

interface Props {
  state: WizardState;
  update: (partial: Partial<WizardState>) => void;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function Step1Owner({ state, update }: Props) {
  const owner = state.owner;

  function set(field: keyof OwnerData, value: string) {
    update({ owner: { ...owner, [field]: value } });
  }

  return (
    <div data-testid="step-owner" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Business Owner / Authorized Signer</h2>
        <p className="text-sm text-gray-500 mt-1">This person will be the primary contact and authorized signer for the group benefits application.</p>
      </div>

      <SmartTip>
        As the authorized signer, you'll receive all important plan notifications, regulatory updates, and renewal reminders.
      </SmartTip>

      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" required>
          <input className={inputCls} value={owner.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Jane" />
        </Field>
        <Field label="Last Name" required>
          <input className={inputCls} value={owner.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Smith" />
        </Field>
      </div>

      {/* Title + DOB */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Job Title" required>
          <input className={inputCls} value={owner.title} onChange={(e) => set('title', e.target.value)} placeholder="CEO / Owner" />
        </Field>
        <Field label="Date of Birth" required>
          <input className={inputCls} type="date" value={owner.dob} onChange={(e) => set('dob', e.target.value)} />
        </Field>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Email Address" required>
          <input className={inputCls} type="email" value={owner.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@company.com" />
        </Field>
        <Field label="Phone Number" required>
          <input className={inputCls} type="tel" value={owner.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(555) 000-0000" />
        </Field>
      </div>

      <hr className="border-gray-100" />
      <h3 className="text-sm font-semibold text-gray-700">Home / Mailing Address</h3>

      <Field label="Address Line 1" required>
        <input className={inputCls} value={owner.address1} onChange={(e) => set('address1', e.target.value)} placeholder="123 Main Street" />
      </Field>
      <Field label="Address Line 2">
        <input className={inputCls} value={owner.address2} onChange={(e) => set('address2', e.target.value)} placeholder="Suite 100, Apt 2B (optional)" />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <Field label="City" required>
            <input className={inputCls} value={owner.city} onChange={(e) => set('city', e.target.value)} placeholder="Portland" />
          </Field>
        </div>
        <Field label="State" required>
          <select className={inputCls} value={owner.state} onChange={(e) => set('state', e.target.value)}>
            <option value="">Select</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="ZIP Code" required>
          <input className={inputCls} value={owner.zip} onChange={(e) => set('zip', e.target.value)} placeholder="97201" maxLength={10} />
        </Field>
      </div>
    </div>
  );
}
