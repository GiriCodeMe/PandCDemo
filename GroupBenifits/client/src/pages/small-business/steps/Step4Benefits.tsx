import React from 'react';
import { Check, Lock } from 'lucide-react';
import { WizardState, SelectedProduct, SelectedPlan } from '../types';
import { SmartTip } from '../SmallBusinessWizard';

interface Props {
  state: WizardState;
  update: (partial: Partial<WizardState>) => void;
}

interface CatalogProduct {
  productId: string;
  name: string;
  description: string;
  type: 'statutory' | 'voluntary';
  icon: string;
  plans: { planId: string; name: string; price: string; features: string[] }[];
}

const CATALOG: CatalogProduct[] = [
  {
    productId: 'STAT-LIFE', name: 'Basic Life Insurance', description: 'State-required basic life coverage for all eligible employees', type: 'statutory', icon: '🛡️',
    plans: [{ planId: 'STAT-LIFE-STD', name: 'Standard Coverage', price: 'Employer-paid', features: ['1× annual salary', 'Accidental Death', 'Guaranteed issue'] }],
  },
  {
    productId: 'STAT-STD', name: 'Short-Term Disability', description: 'Income protection during temporary disability — required by state law', type: 'statutory', icon: '🏥',
    plans: [{ planId: 'STAT-STD-STD', name: 'Standard STD', price: 'Employer-paid', features: ['60% of weekly earnings', '12-week max benefit', '7-day waiting period'] }],
  },
  {
    productId: 'VOL-MED', name: 'Medical', description: 'Comprehensive medical coverage with preventive care', type: 'voluntary', icon: '💊',
    plans: [
      { planId: 'MED-PPO', name: 'PPO Premier', price: '$485/mo EE', features: ['$500 deductible', '$20 PCP copay', 'Out-of-network covered'] },
      { planId: 'MED-HDHP', name: 'HDHP + HSA', price: '$340/mo EE', features: ['$1,500 deductible', 'HSA eligible', 'Preventive at $0'] },
      { planId: 'MED-HMO', name: 'HMO Value', price: '$295/mo EE', features: ['$250 deductible', '$15 PCP copay', 'In-network only'] },
    ],
  },
  {
    productId: 'VOL-DEN', name: 'Dental', description: 'Preventive and restorative dental coverage', type: 'voluntary', icon: '🦷',
    plans: [
      { planId: 'DEN-COMP', name: 'Comprehensive', price: '$42/mo EE', features: ['100% preventive', '80% basic restorative', '$1,500 annual max'] },
      { planId: 'DEN-BASIC', name: 'Basic', price: '$28/mo EE', features: ['100% preventive', '50% basic restorative', '$1,000 annual max'] },
    ],
  },
  {
    productId: 'VOL-VIS', name: 'Vision', description: 'Eye exam, frames, and contact lens coverage', type: 'voluntary', icon: '👁️',
    plans: [
      { planId: 'VIS-PREM', name: 'Premium Vision', price: '$18/mo EE', features: ['Annual eye exam', '$200 frame allowance', 'Contact lens benefit'] },
      { planId: 'VIS-BASIC', name: 'Basic Vision', price: '$10/mo EE', features: ['Annual eye exam', '$120 frame allowance', 'Contact lens benefit'] },
    ],
  },
  {
    productId: 'VOL-SUPLIFE', name: 'Supplemental Life', description: 'Additional life coverage employees can elect for themselves and dependents', type: 'voluntary', icon: '❤️',
    plans: [
      { planId: 'SUPLIFE-1X', name: '1× Salary', price: '$8/mo EE', features: ['1× annual salary', 'Spouse coverage available', 'Child coverage available'] },
      { planId: 'SUPLIFE-3X', name: '3× Salary', price: '$22/mo EE', features: ['3× annual salary', 'Spouse coverage available', 'Guaranteed issue <$300k'] },
    ],
  },
  {
    productId: 'VOL-LTD', name: 'Long-Term Disability', description: 'Income protection for extended disability absences', type: 'voluntary', icon: '🔒',
    plans: [
      { planId: 'LTD-60', name: '60% Benefit', price: '$28/mo EE', features: ['60% monthly earnings', '90-day elimination', 'To age 65'] },
    ],
  },
  {
    productId: 'VOL-CI', name: 'Critical Illness', description: 'Lump-sum payment on diagnosis of covered critical illnesses', type: 'voluntary', icon: '🩺',
    plans: [
      { planId: 'CI-10K', name: '$10,000 Benefit', price: '$12/mo EE', features: ['Heart attack, stroke, cancer', 'Lump-sum payment', 'No network restrictions'] },
      { planId: 'CI-25K', name: '$25,000 Benefit', price: '$28/mo EE', features: ['Heart attack, stroke, cancer', 'Lump-sum payment', 'Wellness benefit included'] },
    ],
  },
  {
    productId: 'VOL-ACC', name: 'Accident Insurance', description: 'Benefits for injuries from covered accidents', type: 'voluntary', icon: '🚑',
    plans: [
      { planId: 'ACC-STD', name: 'Accident Standard', price: '$9/mo EE', features: ['Emergency care benefits', 'Hospitalization', 'Follow-up care'] },
    ],
  },
  {
    productId: 'VOL-HI', name: 'Hospital Indemnity', description: 'Fixed daily benefit during hospital stays', type: 'voluntary', icon: '🏨',
    plans: [
      { planId: 'HI-200', name: '$200/Day Benefit', price: '$14/mo EE', features: ['$200 per day hospitalized', 'ICU benefit 2×', 'Outpatient surgery benefit'] },
    ],
  },
  {
    productId: 'VOL-ID', name: 'Identity Protection', description: 'Credit monitoring and identity theft resolution', type: 'voluntary', icon: '🔐',
    plans: [
      { planId: 'ID-PREM', name: 'Premier Protection', price: '$6/mo EE', features: ['Credit monitoring', '3-bureau alerts', 'Identity restoration'] },
    ],
  },
  {
    productId: 'VOL-LEGAL', name: 'Legal Services', description: 'Access to attorneys for personal legal matters', type: 'voluntary', icon: '⚖️',
    plans: [
      { planId: 'LEGAL-STD', name: 'Legal Network', price: '$8/mo EE', features: ['Wills & trusts', 'Real estate', 'Phone consultations unlimited'] },
    ],
  },
];

export default function Step4Benefits({ state, update }: Props) {
  const products = state.products;

  function isSelected(productId: string): boolean {
    return products.some((p) => p.productId === productId);
  }

  function getSelectedPlan(productId: string): SelectedPlan | null {
    return products.find((p) => p.productId === productId)?.selectedPlan ?? null;
  }

  function toggleProduct(cat: CatalogProduct) {
    if (cat.type === 'statutory') return;
    if (isSelected(cat.productId)) {
      update({ products: products.filter((p) => p.productId !== cat.productId) });
    } else {
      const sp: SelectedProduct = { productId: cat.productId, name: cat.name, type: cat.type, selectedPlan: cat.plans[0] ? { planId: cat.plans[0].planId, name: cat.plans[0].name, price: cat.plans[0].price } : null };
      update({ products: [...products, sp] });
    }
  }

  function selectPlan(productId: string, plan: CatalogProduct['plans'][number]) {
    update({
      products: products.map((p) =>
        p.productId === productId
          ? { ...p, selectedPlan: { planId: plan.planId, name: plan.name, price: plan.price } }
          : p
      ),
    });
  }

  // Pre-select statutory products if not already in state
  React.useEffect(() => {
    const statutory = CATALOG.filter((c) => c.type === 'statutory');
    const missing = statutory.filter((c) => !isSelected(c.productId));
    if (missing.length > 0) {
      const newProducts: SelectedProduct[] = missing.map((c) => ({
        productId: c.productId, name: c.name, type: 'statutory',
        selectedPlan: c.plans[0] ? { planId: c.plans[0].planId, name: c.plans[0].name, price: c.plans[0].price } : null,
      }));
      update({ products: [...products, ...newProducts] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const voluntarySelected = products.filter((p) => p.type === 'voluntary').length;

  return (
    <div data-testid="step-benefits" className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Benefits Selection</h2>
        <p className="text-sm text-gray-500 mt-1">Choose the benefits you want to offer employees. Statutory benefits are required by state law.</p>
      </div>

      <SmartTip>
        Statutory benefits are pre-selected and required. Voluntary benefits let employees customize their coverage — you choose which to offer, they choose whether to enroll.
      </SmartTip>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{voluntarySelected} voluntary benefit{voluntarySelected !== 1 ? 's' : ''} selected</span>
        <span className="text-xs text-gray-400">Click a card to add/remove · Select plan tier below</span>
      </div>

      {/* Statutory */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Statutory Benefits <span className="text-gray-300">(Required)</span></h3>
        <div className="space-y-2">
          {CATALOG.filter((c) => c.type === 'statutory').map((cat) => (
            <div key={cat.productId} className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">INCLUDED</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voluntary */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Voluntary Benefits</h3>
        <div className="space-y-3">
          {CATALOG.filter((c) => c.type === 'voluntary').map((cat) => {
            const selected = isSelected(cat.productId);
            const selectedPlan = getSelectedPlan(cat.productId);
            return (
              <div
                key={cat.productId}
                className={`border-2 rounded-xl overflow-hidden transition-all ${selected ? 'border-brand-300' : 'border-gray-200'}`}
              >
                {/* Product header */}
                <div
                  onClick={() => toggleProduct(cat)}
                  className={`flex items-center gap-3 p-4 cursor-pointer ${selected ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{cat.name}</div>
                    <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
                    {selected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>

                {/* Plan tier tiles — only when selected */}
                {selected && (
                  <div className="px-4 pb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select Plan Tier</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cat.plans.map((plan) => {
                        const active = selectedPlan?.planId === plan.planId;
                        return (
                          <button
                            key={plan.planId}
                            onClick={() => selectPlan(cat.productId, plan)}
                            className={`text-left p-3 border-2 rounded-lg transition-all ${active ? 'border-brand-500 bg-white shadow-sm' : 'border-gray-200 hover:border-brand-200'}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-gray-900">{plan.name}</span>
                              {active && <Check className="w-3.5 h-3.5 text-brand-600" />}
                            </div>
                            <div className="text-xs font-semibold text-brand-700 mb-2">{plan.price}</div>
                            <ul className="space-y-0.5">
                              {plan.features.map((f) => (
                                <li key={f} className="flex items-start gap-1 text-[10px] text-gray-500">
                                  <span className="text-emerald-500 mt-0.5">✓</span> {f}
                                </li>
                              ))}
                            </ul>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
