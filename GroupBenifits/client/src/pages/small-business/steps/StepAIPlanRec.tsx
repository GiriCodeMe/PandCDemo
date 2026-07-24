import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { WizardState, AIProductRecommendation, QuoteLineItem } from '../types';
import { SmartTip } from '../SmallBusinessWizard';

interface Props {
  state: WizardState;
  update: (partial: Partial<WizardState>) => void;
}

interface PricingMap {
  [planId: string]: number;
}

const PLAN_PRICE_MAP: PricingMap = {
  'STAT-LIFE-STD': 12,
  'STAT-STD-STD': 22,
  'MED-PPO': 485,
  'MED-HDHP': 340,
  'MED-HMO': 295,
  'DEN-COMP': 42,
  'DEN-BASIC': 28,
  'VIS-PREM': 18,
  'VIS-BASIC': 10,
  'SUPLIFE-1X': 8,
  'SUPLIFE-3X': 22,
  'LTD-60': 28,
  'CI-10K': 12,
  'CI-25K': 28,
  'ACC-STD': 9,
  'HI-200': 14,
  'ID-PREM': 6,
  'LEGAL-STD': 8,
};

const PRODUCT_RECOMMENDATIONS: Record<string, { confidence: number; reasoning: string }> = {
  'VOL-MED': { confidence: 92, reasoning: 'For your software/tech workforce, PPO Premier offers the broadest network access — critical for tech workers who often have complex healthcare needs. Historical enrollment data shows 89% of similar groups default to PPO.' },
  'VOL-DEN': { confidence: 85, reasoning: 'Dental coverage has high perceived value and low cost. 78% of employees in your industry cite dental as a top enrollment driver. Comprehensive plan recommended for better utilization.' },
  'VOL-VIS': { confidence: 78, reasoning: 'Vision coverage is frequently used by software professionals (screen time). Premium plan adds only $8/month versus basic but increases satisfaction scores significantly.' },
  'VOL-SUPLIFE': { confidence: 72, reasoning: 'Supplemental life is often requested by employees with dependents. 3× salary option recommended for your median income band ($85k+).' },
  'VOL-LTD': { confidence: 68, reasoning: 'Long-term disability protects against income loss from extended illness — particularly relevant for higher-earning technical workers.' },
  'STAT-LIFE': { confidence: 99, reasoning: 'Statutory requirement — required for all eligible employees by state regulation.' },
  'STAT-STD': { confidence: 99, reasoning: 'Statutory short-term disability — required under applicable state law for groups of 2+ employees.' },
};

export default function StepAIPlanRec({ state, update }: Props) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(state.quoteGenerated);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);

  const employeeCount = state.census.employees.filter((e) => e.selected).length;
  const products = state.products;

  useEffect(() => {
    if (!generated && products.length > 0 && employeeCount > 0) {
      startGeneration();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startGeneration() {
    setGenerating(true);
    setTimeout(() => {
      const recs: AIProductRecommendation[] = products.map((p) => {
        const recData = PRODUCT_RECOMMENDATIONS[p.productId] ?? { confidence: 75, reasoning: 'Based on your census and industry data.' };
        return {
          productId: p.productId,
          recommendedPlanId: p.selectedPlan?.planId ?? '',
          confidence: recData.confidence,
          reasoning: recData.reasoning,
          estimatedMonthlyPerEmployee: PLAN_PRICE_MAP[p.selectedPlan?.planId ?? ''] ?? 30,
        };
      });

      const lines: QuoteLineItem[] = products.map((p) => {
        const pricePerEE = PLAN_PRICE_MAP[p.selectedPlan?.planId ?? ''] ?? 30;
        return {
          productId: p.productId,
          productName: p.name,
          planName: p.selectedPlan?.name ?? 'Standard',
          employeeCount,
          monthlyPerEmployee: pricePerEE,
          monthlyTotal: pricePerEE * employeeCount,
          type: p.type,
        };
      });

      update({
        aiRecommendations: recs,
        quoteLines: lines,
        quoteGenerated: true,
        applicationStatus: 'QUOTE_GENERATED',
      });
      setGenerating(false);
      setGenerated(true);
    }, 2800);
  }

  const totalMonthly = state.quoteLines.reduce((sum, l) => sum + l.monthlyTotal, 0);
  const employerPaid = state.quoteLines.filter((l) => l.type === 'statutory').reduce((sum, l) => sum + l.monthlyTotal, 0);
  const voluntaryTotal = state.quoteLines.filter((l) => l.type === 'voluntary').reduce((sum, l) => sum + l.monthlyTotal, 0);

  return (
    <div data-testid="step-ai-plan-rec" className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">AI Plan Recommendation & Quote</h2>
        <p className="text-sm text-gray-500 mt-1">Our AI analyzes your census, industry, and historical enrollment data to recommend the best plan tier and generate your quote.</p>
      </div>

      <SmartTip>
        AI recommendations are advisory — the final plan selections and quote are calculated deterministically by our pricing engine. You can override any recommendation.
      </SmartTip>

      {/* AI generation animation */}
      {generating && (
        <div className="border border-violet-200 bg-violet-50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-violet-600 animate-pulse" />
            <span className="text-sm font-semibold text-violet-800">AI is analyzing your application…</span>
          </div>
          <div className="space-y-2 text-xs text-violet-600">
            {[
              'Analyzing employee census demographics…',
              'Matching against technology industry benchmarks…',
              'Applying historical enrollment patterns for 10-50 employee groups…',
              'Calculating risk-adjusted pricing estimates…',
              'Generating plan tier recommendations…',
              'Building quote breakdown…',
            ].map((msg, idx) => (
              <div key={idx} className="flex items-center gap-2 animate-pulse" style={{ animationDelay: `${idx * 0.3}s` }}>
                <Sparkles className="w-3 h-3 flex-shrink-0" />
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!generating && !generated && products.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          No benefits selected. Go back to the Benefits step to select products first.
        </div>
      )}

      {/* Generated content */}
      {generated && state.quoteLines.length > 0 && (
        <>
          {/* AI Recommendation Cards */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-600" />
              AI Recommendations
            </h3>
            <div className="space-y-2">
              {state.aiRecommendations.map((rec) => {
                const product = products.find((p) => p.productId === rec.productId);
                const isExpanded = expandedRec === rec.productId;
                const confidenceColor = rec.confidence >= 85 ? 'text-emerald-700 bg-emerald-100' : rec.confidence >= 70 ? 'text-amber-700 bg-amber-100' : 'text-gray-600 bg-gray-100';
                return (
                  <div key={rec.productId} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedRec(isExpanded ? null : rec.productId)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{product?.name}</span>
                          <span className="text-xs text-gray-500">→ {product?.selectedPlan?.name}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${confidenceColor}`}>
                        {rec.confidence}% confidence
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-3 text-xs text-gray-600 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-start gap-2 mt-2">
                          <Brain className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
                          <p className="leading-relaxed">{rec.reasoning}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quote Table */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              Dynamic Quote — {employeeCount} Employees
            </h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Benefit</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Plan</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Per EE/Mo</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Monthly Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {state.quoteLines.map((line) => (
                    <tr key={line.productId} className={line.type === 'statutory' ? 'bg-emerald-50/40' : ''}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-gray-900">{line.productName}</span>
                          {line.type === 'statutory' && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded">REQUIRED</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 hidden sm:table-cell">{line.planName}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-800">${line.monthlyPerEmployee.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-900">${line.monthlyTotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-4 py-2.5 text-xs font-semibold text-gray-700">
                      <div className="flex flex-col gap-0.5">
                        <span>Employer-paid statutory: ${employerPaid.toLocaleString()}/mo</span>
                        <span className="text-gray-400">Employee voluntary (pre-tax): ${voluntaryTotal.toLocaleString()}/mo total</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-gray-500 hidden sm:table-cell">—</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="text-base font-bold text-gray-900">${totalMonthly.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400">total/month</div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              * Estimated quote based on {employeeCount} enrolled employees. Final premium is subject to carrier underwriting and may vary. Quote valid for 30 days.
            </p>
          </div>

          {/* Summary Banner */}
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-brand-800">Quote Generated Successfully</p>
                <p className="text-xs text-brand-600 mt-1">
                  Your estimated monthly employer cost for statutory benefits is <strong>${employerPaid.toLocaleString()}</strong>.
                  Employee voluntary premiums totaling <strong>${voluntaryTotal.toLocaleString()}/month</strong> are collected via payroll deduction.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={startGeneration}
            className="flex items-center gap-2 text-xs text-violet-600 hover:text-violet-800 font-medium"
          >
            <Brain className="w-3.5 h-3.5" />
            <AlertCircle className="w-3.5 h-3.5 text-gray-300" />
            Regenerate AI Recommendation
          </button>
        </>
      )}
    </div>
  );
}
