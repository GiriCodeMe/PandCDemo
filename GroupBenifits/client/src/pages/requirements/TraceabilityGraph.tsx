import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, CheckSquare, Shield, Building2, Users, Truck, DollarSign, ChevronRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';

function authHeader() {
  return { Authorization: `Bearer ${sessionStorage.getItem('persona_token') ?? 'P-001'}` };
}

type LayerItem = { id: string; label: string; sub?: string; status?: string; linkedIds: string[] };
type Layer = { key: string; title: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string; items: LayerItem[] };

async function buildTraceData() {
  const [docsRes, reqsRes, rulesRes, productsRes, enrollRes, carriersRes, payrollRes] = await Promise.all([
    fetch('/api/documents?employerId=ACM-001', { headers: authHeader() }).then((r) => r.json()),
    fetch('/api/requirements', { headers: authHeader() }).then((r) => r.json()),
    fetch('/api/eligibility-rules?employerId=ACM-001', { headers: authHeader() }).then((r) => r.json()),
    fetch('/api/products?employerId=ACM-001', { headers: authHeader() }).then((r) => r.json()),
    fetch('/api/enrollment', { headers: authHeader() }).then((r) => r.json()),
    fetch('/api/integrations/carriers', { headers: authHeader() }).then((r) => r.json()),
    fetch('/api/integrations/payroll-transactions', { headers: authHeader() }).then((r) => r.json()),
  ]);

  const docs: Record<string, unknown>[] = Array.isArray(docsRes.data) ? docsRes.data.slice(0, 3) : [];
  const reqs: Record<string, unknown>[] = Array.isArray(reqsRes.data) ? reqsRes.data.slice(0, 4) : [];
  const rules: Record<string, unknown>[] = Array.isArray(rulesRes.data) ? rulesRes.data.slice(0, 3) : [];
  const products: Record<string, unknown>[] = Array.isArray(productsRes.data) ? productsRes.data : [];
  const plans: Record<string, unknown>[] = products.flatMap((p) => ((p.plans as Record<string, unknown>[]) ?? []).slice(0, 1));
  const enrollments: Record<string, unknown>[] = Array.isArray(enrollRes.data?.enrollments)
    ? enrollRes.data.enrollments.slice(0, 4)
    : (Array.isArray(enrollRes.data) ? enrollRes.data.slice(0, 4) : []);
  const carriers: Record<string, unknown>[] = Array.isArray(carriersRes.data) ? carriersRes.data.slice(0, 3) : [];
  const payroll: Record<string, unknown>[] = Array.isArray(payrollRes.data) ? payrollRes.data.slice(0, 3) : [];

  return { docs, reqs, rules, plans, enrollments, carriers, payroll };
}

const LINDA_PATH = new Set(['DOC-2027-0002', 'REQ-FT-003', 'RULE-FT-001', 'PLAN-MED-001', 'ENR-ACM-E012', 'CT-10045', 'PAY-ACM-E012-001']);

export default function TraceabilityGraph() {
  const [activePath, setActivePath] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<{ layer: string; item: LayerItem } | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['trace-data'], queryFn: buildTraceData, staleTime: 300_000 });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { docs, reqs, rules, plans, enrollments, carriers, payroll } = data;

  const layers: Layer[] = [
    {
      key: 'Document',
      title: 'Documents',
      icon: FileText,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      items: docs.map((d) => ({
        id: String(d.documentId ?? d._id ?? ''),
        label: String(d.originalFilename ?? 'Document'),
        sub: String(d.documentType ?? ''),
        status: String(d.lifecycleState ?? ''),
        linkedIds: reqs.slice(0, 2).map((r) => String(r.requirementId ?? '')),
      })),
    },
    {
      key: 'Requirement',
      title: 'Requirements',
      icon: CheckSquare,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      border: 'border-brand-200',
      items: reqs.map((r, i) => ({
        id: String(r.requirementId ?? `REQ-${i}`),
        label: String(r.title ?? 'Requirement'),
        sub: String(r.category ?? ''),
        status: String(r.status ?? ''),
        linkedIds: rules.slice(0, 1).map((rl) => String(rl.ruleId ?? '')),
      })),
    },
    {
      key: 'Rule',
      title: 'Eligibility Rules',
      icon: Shield,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      items: rules.map((r) => ({
        id: String(r.ruleId ?? ''),
        label: String(r.name ?? 'Rule'),
        sub: String(r.ruleType ?? ''),
        status: String(r.status ?? ''),
        linkedIds: plans.slice(0, 2).map((p) => String(p.planId ?? '')),
      })),
    },
    {
      key: 'Plan',
      title: 'Plans',
      icon: Building2,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      items: plans.slice(0, 3).map((p) => ({
        id: String(p.planId ?? ''),
        label: String(p.name ?? 'Plan'),
        sub: String(p.status ?? ''),
        status: String(p.status ?? ''),
        linkedIds: enrollments.slice(0, 2).map((e) => String(e.enrollmentId ?? '')),
      })),
    },
    {
      key: 'Enrollment',
      title: 'Enrollments',
      icon: Users,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      items: enrollments.map((e) => ({
        id: String(e.enrollmentId ?? ''),
        label: String(e.employeeId ?? 'Employee'),
        sub: String(e.status ?? ''),
        status: String(e.status ?? ''),
        linkedIds: carriers.slice(0, 1).map((c) => String(c.carrierId ?? '')),
      })),
    },
    {
      key: 'Carrier',
      title: 'Carriers',
      icon: Truck,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      items: carriers.map((c) => ({
        id: String(c.carrierId ?? ''),
        label: String(c.name ?? 'Carrier'),
        sub: String(c.type ?? ''),
        status: String(c.status ?? 'Active'),
        linkedIds: payroll.slice(0, 1).map((p) => String(p.transactionId ?? '')),
      })),
    },
    {
      key: 'Payroll',
      title: 'Payroll',
      icon: DollarSign,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      items: payroll.map((p) => ({
        id: String(p.transactionId ?? ''),
        label: String(p.employeeId ?? 'Transaction'),
        sub: String(p.reconciliationStatus ?? ''),
        status: String(p.reconciliationStatus ?? ''),
        linkedIds: [],
      })),
    },
  ];

  const lindaHighlight = activePath === 'linda';

  return (
    <div data-testid="traceability-graph">
      {/* Controls */}
      <div className="flex items-center gap-3 mb-5">
        <p className="text-sm font-semibold text-gray-700">Trace a path through the system</p>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setActivePath(activePath === 'linda' ? null : 'linda')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${lindaHighlight ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-amber-300 text-amber-600 hover:bg-amber-50'}`}
          >
            {lindaHighlight ? 'Clear' : 'Highlight: Linda White path'}
          </button>
          <button
            onClick={() => { setActivePath(null); setSelectedNode(null); }}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Layer columns */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-0 min-w-max">
          {layers.map((layer, layerIdx) => {
            const Icon = layer.icon;
            return (
              <div key={layer.key} className="flex items-start">
                {/* Layer column */}
                <div className="w-36">
                  {/* Header */}
                  <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-t-lg ${layer.bg} border-b ${layer.border}`}>
                    <Icon className={`w-3 h-3 ${layer.color}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${layer.color}`}>{layer.title}</span>
                  </div>
                  {/* Items */}
                  <div className={`border ${layer.border} rounded-b-lg overflow-hidden space-y-0 divide-y ${layer.border}`}>
                    {layer.items.length === 0 ? (
                      <div className="px-2 py-3 text-[10px] text-gray-400 text-center">No data</div>
                    ) : layer.items.map((item) => {
                      const isLinda = lindaHighlight && LINDA_PATH.has(item.id);
                      const isSelected = selectedNode?.item.id === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedNode(isSelected ? null : { layer: layer.key, item })}
                          className={`w-full text-left px-2 py-2 transition-colors ${isLinda ? 'bg-amber-50 border-l-2 border-amber-400' : isSelected ? 'bg-brand-50 border-l-2 border-brand-400' : `${layer.bg} hover:opacity-80`}`}
                        >
                          <p className={`text-[10px] font-semibold truncate ${isLinda ? 'text-amber-800' : isSelected ? 'text-brand-700' : 'text-gray-800'}`}>{item.label}</p>
                          {item.sub && <p className="text-[9px] text-gray-400 truncate mt-0.5">{item.sub}</p>}
                          {item.id && <p className="text-[9px] font-mono text-gray-300 truncate">{item.id}</p>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Arrow connector */}
                {layerIdx < layers.length - 1 && (
                  <div className="flex items-center h-12 mt-6 px-0.5">
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected node detail */}
      {selectedNode && (
        <Card className="p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{selectedNode.layer}</span>
            <span className="text-xs font-mono text-gray-400">· {selectedNode.item.id}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">{selectedNode.item.label}</p>
          {selectedNode.item.sub && <p className="text-xs text-gray-500 mb-2">{selectedNode.item.sub}</p>}
          {selectedNode.item.linkedIds.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Linked to</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.item.linkedIds.map((id) => (
                  <span key={id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded font-mono text-[10px]">{id}</span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-[10px] text-gray-400">
        <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-400 inline-block" /> Linda White traced path</div>
        <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-brand-400 inline-block" /> Selected item</div>
        <p className="ml-auto">Click any node to see its connections</p>
      </div>
    </div>
  );
}
