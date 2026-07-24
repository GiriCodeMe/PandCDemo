import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { WizardState, BusinessData, Location, Contact } from '../types';
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

const ENTITY_TYPES = ['Sole Proprietorship', 'LLC', 'S-Corporation', 'C-Corporation', 'Partnership', 'Non-Profit', 'Other'];
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function Step2Business({ state, update }: Props) {
  const biz = state.business;

  function set(field: keyof BusinessData, value: string) {
    update({ business: { ...biz, [field]: value } });
  }

  function addLocation() {
    const loc: Location = { id: `loc-${Date.now()}`, name: '', address1: '', city: '', state: '', zip: '', isPrimary: false };
    update({ business: { ...biz, locations: [...biz.locations, loc] } });
  }

  function removeLocation(id: string) {
    update({ business: { ...biz, locations: biz.locations.filter((l) => l.id !== id) } });
  }

  function updateLocation(id: string, field: keyof Location, value: string | boolean) {
    update({ business: { ...biz, locations: biz.locations.map((l) => l.id === id ? { ...l, [field]: value } : l) } });
  }

  function addContact() {
    const c: Contact = { id: `con-${Date.now()}`, name: '', role: '', email: '', phone: '' };
    update({ business: { ...biz, contacts: [...biz.contacts, c] } });
  }

  function removeContact(id: string) {
    update({ business: { ...biz, contacts: biz.contacts.filter((c) => c.id !== id) } });
  }

  function updateContact(id: string, field: keyof Contact, value: string) {
    update({ business: { ...biz, contacts: biz.contacts.map((c) => c.id === id ? { ...c, [field]: value } : c) } });
  }

  return (
    <div data-testid="step-business" className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
        <p className="text-sm text-gray-500 mt-1">Provide your company's legal and operational information.</p>
      </div>

      <SmartTip>
        Your EIN (Employer Identification Number) is required for IRS reporting of employee benefits. It appears on your tax filings as XX-XXXXXXX.
      </SmartTip>

      {/* Legal info */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Legal Business Name" required>
          <input className={inputCls} value={biz.legalName} onChange={(e) => set('legalName', e.target.value)} placeholder="Acme Corporation LLC" />
        </Field>
        <Field label="DBA (Doing Business As)">
          <input className={inputCls} value={biz.dba} onChange={(e) => set('dba', e.target.value)} placeholder="Acme (optional)" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Entity Type" required>
          <select className={inputCls} value={biz.entityType} onChange={(e) => set('entityType', e.target.value)}>
            <option value="">Select entity type</option>
            {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="EIN (Federal Tax ID)" required>
          <input className={inputCls} value={biz.ein} onChange={(e) => set('ein', e.target.value)} placeholder="12-3456789" maxLength={10} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="NAICS Code">
          <input className={inputCls} value={biz.naicsCode} onChange={(e) => set('naicsCode', e.target.value)} placeholder="541511" maxLength={6} />
        </Field>
        <Field label="SIC Code">
          <input className={inputCls} value={biz.sicCode} onChange={(e) => set('sicCode', e.target.value)} placeholder="7372" maxLength={4} />
        </Field>
      </div>

      <Field label="Nature of Business" required>
        <input className={inputCls} value={biz.natureOfBusiness} onChange={(e) => set('natureOfBusiness', e.target.value)} placeholder="Software development and IT consulting" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Year Established" required>
          <input className={inputCls} value={biz.yearEstablished} onChange={(e) => set('yearEstablished', e.target.value)} placeholder="2015" maxLength={4} />
        </Field>
        <Field label="Total Full-Time Employees" required>
          <input className={inputCls} type="number" min="1" value={biz.totalEmployees} onChange={(e) => set('totalEmployees', e.target.value)} placeholder="25" />
        </Field>
      </div>

      {/* Locations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Business Locations</h3>
          <button onClick={addLocation} className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800">
            <Plus className="w-3.5 h-3.5" /> Add Location
          </button>
        </div>
        <div className="space-y-3">
          {biz.locations.map((loc) => (
            <div key={loc.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="border-0 border-b border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:border-brand-400 bg-transparent w-40"
                    value={loc.name}
                    onChange={(e) => updateLocation(loc.id, 'name', e.target.value)}
                    placeholder="Location name"
                  />
                  {loc.isPrimary && <span className="text-[10px] font-bold bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">PRIMARY</span>}
                </div>
                {!loc.isPrimary && (
                  <button onClick={() => removeLocation(loc.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <input className={inputCls} value={loc.address1} onChange={(e) => updateLocation(loc.id, 'address1', e.target.value)} placeholder="Address" />
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <input className={inputCls} value={loc.city} onChange={(e) => updateLocation(loc.id, 'city', e.target.value)} placeholder="City" />
                </div>
                <select className={inputCls} value={loc.state} onChange={(e) => updateLocation(loc.id, 'state', e.target.value)}>
                  <option value="">State</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input className={inputCls} value={loc.zip} onChange={(e) => updateLocation(loc.id, 'zip', e.target.value)} placeholder="ZIP" maxLength={10} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Contacts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Key Contacts <span className="text-gray-400 font-normal">(optional)</span></h3>
          <button onClick={addContact} className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-800">
            <Plus className="w-3.5 h-3.5" /> Add Contact
          </button>
        </div>
        {biz.contacts.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No additional contacts added. You can add HR managers, billing contacts, etc.</p>
        ) : (
          <div className="space-y-3">
            {biz.contacts.map((c) => (
              <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</span>
                  <button onClick={() => removeContact(c.id)} className="text-gray-300 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className={inputCls} value={c.name} onChange={(e) => updateContact(c.id, 'name', e.target.value)} placeholder="Full name" />
                  <input className={inputCls} value={c.role} onChange={(e) => updateContact(c.id, 'role', e.target.value)} placeholder="Role (e.g. HR Manager)" />
                  <input className={inputCls} type="email" value={c.email} onChange={(e) => updateContact(c.id, 'email', e.target.value)} placeholder="email@company.com" />
                  <input className={inputCls} type="tel" value={c.phone} onChange={(e) => updateContact(c.id, 'phone', e.target.value)} placeholder="(555) 000-0000" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
