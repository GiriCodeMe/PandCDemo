import React, { useState } from 'react';
import { Settings, Shield, Code2, FlaskConical, GitCompare, Zap } from 'lucide-react';
import PlanConfiguration from './PlanConfiguration';
import EligibilityRules from './EligibilityRules';
import RuleBuilder from './RuleBuilder';
import EligibilitySimulator from './EligibilitySimulator';
import PlanComparison from './PlanComparison';
import ImpactAnalysis from './ImpactAnalysis';

const VIEWS = [
  { id: 'config', label: 'Plan Configuration', icon: Settings },
  { id: 'eligibility', label: 'Eligibility Rules', icon: Shield },
  { id: 'builder', label: 'Rule Builder', icon: Code2 },
  { id: 'simulator', label: 'Eligibility Simulator', icon: FlaskConical },
  { id: 'compare', label: 'Plan Comparison', icon: GitCompare },
  { id: 'impact', label: 'Impact Analysis', icon: Zap },
] as const;

type View = (typeof VIEWS)[number]['id'];

const SUBTITLES: Record<View, string> = {
  config: 'Configure benefit products, plans, and publish the plan year.',
  eligibility: 'Review and manage eligibility rules, conditions, and waiting periods.',
  builder: 'Visually build new eligibility rules with IF/AND/OR/THEN logic.',
  simulator: 'Test employee data against eligibility rules and preview coverage dates.',
  compare: 'Select 2–4 plans to compare side-by-side. Toggle Differences Only to highlight gaps.',
  impact: 'Run what-if scenarios to see the downstream blast radius of a plan or eligibility change.',
};

export default function PlansHub() {
  const [view, setView] = useState<View>('config');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Plans & Eligibility</h1>
        <p className="text-sm text-gray-500 mt-0.5">{SUBTITLES[view]}</p>
      </div>

      <div data-testid="plans-view-switcher" className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6 flex-wrap">
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
      {view === 'builder' && <RuleBuilder />}
      {view === 'simulator' && <EligibilitySimulator />}
      {view === 'compare' && <PlanComparison />}
      {view === 'impact' && <ImpactAnalysis />}
    </div>
  );
}
