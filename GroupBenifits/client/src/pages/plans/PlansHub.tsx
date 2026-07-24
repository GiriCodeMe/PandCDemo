import React, { useState } from 'react';
import { Settings, Shield } from 'lucide-react';
import PlanConfiguration from './PlanConfiguration';
import EligibilityRules from './EligibilityRules';

const VIEWS = [
  { id: 'config', label: 'Plan Configuration', icon: Settings },
  { id: 'eligibility', label: 'Eligibility Rules', icon: Shield },
] as const;

type View = (typeof VIEWS)[number]['id'];

export default function PlansHub() {
  const [view, setView] = useState<View>('config');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Plan Configuration</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Configure benefit products, plans, eligibility rules, and publish the plan year.
        </p>
      </div>

      <div data-testid="plans-view-switcher" className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            data-testid={`plans-view-${id}`}
            onClick={() => setView(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {view === 'config' && <PlanConfiguration />}
      {view === 'eligibility' && <EligibilityRules />}
    </div>
  );
}
