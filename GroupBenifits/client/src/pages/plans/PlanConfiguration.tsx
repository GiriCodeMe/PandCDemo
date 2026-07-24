import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Clock, Upload, Building2, DollarSign, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { planConfigApi } from '../../api/planConfig';
import { productsApi } from '../../api/products';

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  REVIEW: 'bg-blue-100 text-blue-700',
  CONFIGURED: 'bg-amber-100 text-amber-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  OPEN: 'bg-brand-100 text-brand-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  OPEN_ENROLLMENT: 'bg-brand-100 text-brand-700',
};

const CHECKLIST_ICONS: Record<string, React.ReactNode> = {
  complete: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  incomplete: <Clock className="w-4 h-4 text-gray-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
};

const PRODUCT_TYPE_BG: Record<string, string> = {
  Medical: 'bg-blue-50',
  Dental: 'bg-teal-50',
  Vision: 'bg-purple-50',
  Life: 'bg-red-50',
  'Short-Term Disability': 'bg-orange-50',
  'Long-Term Disability': 'bg-orange-50',
  HSA: 'bg-emerald-50',
  FSA: 'bg-green-50',
};

export default function PlanConfiguration() {
  const navigate = useNavigate();
  const [publishMsg, setPublishMsg] = useState('');

  const { data: summary } = useQuery({
    queryKey: ['plan-config', 'ACM-001'],
    queryFn: () => planConfigApi.getSummary('ACM-001'),
    staleTime: 30_000,
  });

  const { data: oe } = useQuery({
    queryKey: ['open-enrollment', 'ACM-001'],
    queryFn: () => planConfigApi.getOpenEnrollment('ACM-001'),
    staleTime: 30_000,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list('ACM-001'),
    staleTime: 30_000,
  });

  const publishMutation = useMutation({
    mutationFn: () => planConfigApi.publish('ACM-001', 2027),
    onSuccess: (data) => {
      setPublishMsg(String(data.message ?? 'Plan configuration published'));
      setTimeout(() => setPublishMsg(''), 5000);
    },
  });

  const complete = summary?.configChecklist.filter((c) => c.status === 'complete').length ?? 0;
  const total = summary?.configChecklist.length ?? 0;
  const progress = total > 0 ? Math.round((complete / total) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{summary?.productsCount ?? '–'}</div>
          <div className="text-xs text-gray-500 mt-0.5">Products offered</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{summary?.plansCount ?? '–'}</div>
          <div className="text-xs text-gray-500 mt-0.5">Plans configured</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{summary?.eligibilityRulesCount ?? '–'}</div>
          <div className="text-xs text-gray-500 mt-0.5">Eligibility rules</div>
        </Card>
        <Card className="p-4">
          <div className={`text-sm font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-1 ${STATUS_COLORS[summary?.configurationStatus ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
            {summary?.configurationStatus ?? '–'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Config status</div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Config checklist */}
        <Card className="p-4 col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Configuration Checklist</h2>
            <span className="text-xs text-gray-500">{complete}/{total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
            <div className="bg-brand-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-2">
            {summary?.configChecklist.map((item) => (
              <div key={item.item} className="flex items-center gap-2">
                {CHECKLIST_ICONS[item.status]}
                <span className={`text-xs ${item.status === 'complete' ? 'text-gray-700' : item.status === 'warning' ? 'text-amber-700' : 'text-gray-400'}`}>{item.item}</span>
              </div>
            ))}
          </div>

          {/* Publish */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            {publishMsg ? (
              <div className="flex items-center gap-2 text-emerald-700 text-xs">
                <CheckCircle className="w-4 h-4" />
                {publishMsg}
              </div>
            ) : (
              <button
                onClick={() => publishMutation.mutate()}
                disabled={publishMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                {publishMutation.isPending ? 'Publishing...' : 'Publish Configuration'}
              </button>
            )}
            {summary?.lastPublishedAt && (
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                Last published {new Date(summary.lastPublishedAt).toLocaleDateString()} by {summary.publishedBy}
              </p>
            )}
          </div>
        </Card>

        {/* Open enrollment status */}
        <Card className="p-4 col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Open Enrollment Period</h2>
          {oe ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[oe.status] ?? 'bg-gray-100 text-gray-600'}`}>{oe.status}</span>
                <span className="text-sm text-gray-700">{oe.enrollmentName}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-0.5">Start</div>
                  <div className="font-medium text-gray-900">{new Date(oe.startDateTime).toLocaleDateString()}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-0.5">End</div>
                  <div className="font-medium text-gray-900">{new Date(oe.endDateTime).toLocaleDateString()}</div>
                </div>
              </div>
              {oe.progress && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollment Progress</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Submitted', value: oe.progress.submitted, color: 'text-emerald-600' },
                      { label: 'In Progress', value: oe.progress.inProgress, color: 'text-blue-600' },
                      { label: 'Not Started', value: oe.progress.notStarted, color: 'text-gray-500' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className={`text-lg font-bold ${color}`}>{value?.toLocaleString() ?? '–'}</div>
                        <div className="text-[10px] text-gray-500">{label}</div>
                      </div>
                    ))}
                  </div>
                  {oe.progress.exceptions > 0 && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-xs text-amber-700">{oe.progress.exceptions} enrollment exceptions require HR review</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400">No open enrollment period configured.</div>
          )}
        </Card>
      </div>

      {/* Products grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Configured Products — Plan Year 2027</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.productId}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/products/${product.productId}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/products/${product.productId}`)}
              className={`cursor-pointer rounded-lg border border-gray-200 shadow-sm hover:border-brand-200 hover:shadow-md transition-all p-4 ${PRODUCT_TYPE_BG[product.type] ?? 'bg-white'}`}
            >
              <div className="flex items-start gap-2 mb-2">
                <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{product.name}</div>
                  <div className="text-[10px] text-gray-500">{product.type}</div>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[product.status] ?? 'bg-gray-100 text-gray-600'}`}>{product.status}</span>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {product.plans ? `${product.plans.length} plans` : 'View plans'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
