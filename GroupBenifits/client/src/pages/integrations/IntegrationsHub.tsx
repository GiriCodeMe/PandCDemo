import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Link2, Truck, DollarSign, AlertTriangle, CheckCircle2,
  XCircle, Clock, RefreshCcw, ChevronRight, Filter, AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { integrationsApi, type Carrier, type CarrierTransaction, type PayrollTransaction } from '../../api/integrations';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CT_STATUS_COLOR: Record<string, string> = {
  Accepted: 'bg-green-50 text-green-700 border border-green-200',
  Rejected: 'bg-red-50 text-red-700 border border-red-200',
  Failed: 'bg-red-50 text-red-700 border border-red-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const PR_STATUS_COLOR: Record<string, string> = {
  Matched: 'bg-green-50 text-green-700 border border-green-200',
  Mismatch: 'bg-red-50 text-red-700 border border-red-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
};

function RateBadge({ value, label }: { value: number; label: string }) {
  const color = value >= 95 ? 'text-green-600' : value >= 85 ? 'text-amber-600' : 'text-red-600';
  return (
    <Card className="p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}%</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </Card>
  );
}

function StatusBadge({ status, map }: { status: string; map: Record<string, string> }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

// ─── Carrier Connections ───────────────────────────────────────────────────────

function CarrierList({ carriers }: { carriers: Carrier[] }) {
  const PRODUCT_COLOR: Record<string, string> = {
    Medical: 'bg-red-50 text-red-700',
    Dental: 'bg-blue-50 text-blue-700',
    Vision: 'bg-purple-50 text-purple-700',
    Life: 'bg-green-50 text-green-700',
    'AD&D': 'bg-green-50 text-green-700',
    STD: 'bg-orange-50 text-orange-700',
    LTD: 'bg-orange-50 text-orange-700',
    HSA: 'bg-yellow-50 text-yellow-700',
    FSA: 'bg-yellow-50 text-yellow-700',
  };
  return (
    <div className="space-y-2" data-testid="carrier-list">
      {carriers.map((c) => (
        <div key={c.carrierId} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white">
          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
            <Truck className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900">{c.name}</p>
              <span className="text-[10px] text-gray-400">{c.carrierId}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {c.supportedProductTypes.map((pt) => (
                <span key={pt} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${PRODUCT_COLOR[pt] ?? 'bg-gray-100 text-gray-600'}`}>
                  {pt}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right text-xs text-gray-400 flex-shrink-0">
            <p className="font-medium text-gray-600">{c.connectionType} · {c.fileFormat}</p>
            <p>{c.transmissionSchedule}</p>
          </div>
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.status === 'Active' ? 'bg-green-400' : 'bg-gray-300'}`} />
        </div>
      ))}
    </div>
  );
}

// ─── EDI Transactions ─────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function TransactionRow({ t, expanded, onToggle }: {
  t: CarrierTransaction;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden" data-testid={`carrier-txn-${t.transactionId}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-4 py-3 bg-white hover:bg-gray-50 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-400">{t.transactionId}</span>
            <span className="text-xs font-semibold text-gray-700">{t.transactionType}</span>
            <span className="text-xs text-gray-400">{t.employeeId}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{formatTime(t.sentAt)}</p>
        </div>
        <StatusBadge status={t.status} map={CT_STATUS_COLOR} />
        <ChevronRight className={`w-4 h-4 text-gray-300 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
          {t.errorCode && (
            <div className="flex items-start gap-2 mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-700">{t.errorCode}</p>
                <p className="text-xs text-red-600 mt-0.5">{t.errorMessage}</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Request</p>
              <pre className="text-[10px] text-gray-600 bg-white border border-gray-200 rounded-lg p-2 overflow-auto max-h-32">
                {JSON.stringify(t.requestPayload, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Response</p>
              <pre className="text-[10px] text-gray-600 bg-white border border-gray-200 rounded-lg p-2 overflow-auto max-h-32">
                {t.responsePayload ? JSON.stringify(t.responsePayload, null, 2) : '(no response)'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CarrierTransactionsView({ transactions, carriers }: {
  transactions: CarrierTransaction[];
  carriers: Carrier[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');

  const filtered = transactions.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (carrierFilter && t.carrierId !== carrierFilter) return false;
    return true;
  });

  const carrierName = (id: string) => carriers.find((c) => c.carrierId === id)?.name ?? id;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5"
          data-testid="ct-status-filter"
        >
          <option value="">All statuses</option>
          {['Accepted', 'Rejected', 'Failed', 'Pending'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={carrierFilter}
          onChange={(e) => setCarrierFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5"
          data-testid="ct-carrier-filter"
        >
          <option value="">All carriers</option>
          {carriers.map((c) => (
            <option key={c.carrierId} value={c.carrierId}>{c.name}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-gray-400">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-2" data-testid="carrier-transactions-list">
        {filtered.map((t) => (
          <TransactionRow
            key={t.transactionId}
            t={{ ...t, transactionType: `${t.transactionType} · ${carrierName(t.carrierId)}` }}
            expanded={expanded === t.transactionId}
            onToggle={() => setExpanded(expanded === t.transactionId ? null : t.transactionId)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Payroll Deductions ────────────────────────────────────────────────────────

function PayrollRow({ t }: { t: PayrollTransaction }) {
  const expected = t.perPaycheckAmountExpected ?? null;
  const actual = t.perPaycheckAmountActual ?? null;
  const diff = actual !== null && expected !== null ? actual - expected : null;
  const isMismatch = t.reconciliationStatus === 'Mismatch';
  const fmt = (v: number | null) => v !== null ? `$${v.toFixed(2)}` : '—';
  return (
    <div
      className={`flex items-center gap-4 p-4 border rounded-xl ${isMismatch ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-white'}`}
      data-testid={`payroll-row-${t.deductionId}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-gray-900">{t.planCode}</p>
          <span className="text-xs text-gray-400">{t.employeeId}</span>
        </div>
        <p className="text-xs text-gray-400">{t.payFrequency} · {t.coverageMonth}</p>
      </div>
      <div className="text-right text-xs flex-shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-gray-400">Expected</p>
            <p className="font-semibold text-gray-800">{fmt(expected)}</p>
          </div>
          <div>
            <p className="text-gray-400">Actual</p>
            <p className={`font-semibold ${isMismatch ? 'text-red-700' : 'text-gray-800'}`}>
              {fmt(actual)}
            </p>
          </div>
          {isMismatch && diff !== null && (
            <div>
              <p className="text-gray-400">Diff</p>
              <p className="font-bold text-red-700">{diff > 0 ? '+' : ''}{diff.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
      <StatusBadge status={t.reconciliationStatus} map={PR_STATUS_COLOR} />
    </div>
  );
}

function PayrollView({ transactions }: { transactions: PayrollTransaction[] }) {
  const [recoFilter, setRecoFilter] = useState('');
  const filtered = recoFilter
    ? transactions.filter((t) => t.reconciliationStatus === recoFilter)
    : transactions;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={recoFilter}
          onChange={(e) => setRecoFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5"
          data-testid="payroll-status-filter"
        >
          <option value="">All statuses</option>
          {['Matched', 'Mismatch', 'Pending'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400">{filtered.length} deduction{filtered.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-2" data-testid="payroll-list">
        {filtered.map((t) => <PayrollRow key={t.deductionId} t={t} />)}
      </div>
    </div>
  );
}

// ─── Exceptions Panel ─────────────────────────────────────────────────────────

function ExceptionsView({
  carrierExceptions,
  payrollMismatches,
}: {
  carrierExceptions: CarrierTransaction[];
  payrollMismatches: PayrollTransaction[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500" />
          Carrier Exceptions ({carrierExceptions.length})
        </h3>
        {carrierExceptions.length === 0 ? (
          <div className="text-sm text-gray-400 py-4 text-center">No carrier exceptions.</div>
        ) : (
          <div className="space-y-2">
            {carrierExceptions.map((t) => (
              <div key={t.transactionId} className="p-4 border border-red-200 bg-red-50/30 rounded-xl" data-testid={`exception-${t.transactionId}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">{t.transactionId}</span>
                      <span className="text-xs font-semibold text-gray-700">{t.transactionType}</span>
                      <span className="text-xs text-gray-400">{t.employeeId}</span>
                      <StatusBadge status={t.status} map={CT_STATUS_COLOR} />
                    </div>
                    {t.errorCode && (
                      <p className="text-xs text-red-700 font-semibold">{t.errorCode}</p>
                    )}
                    {t.errorMessage && (
                      <p className="text-xs text-red-600 mt-0.5">{t.errorMessage}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          Payroll Mismatches ({payrollMismatches.length})
        </h3>
        {payrollMismatches.length === 0 ? (
          <div className="text-sm text-gray-400 py-4 text-center">No payroll mismatches.</div>
        ) : (
          <div className="space-y-2">
            {payrollMismatches.map((t) => {
              const diff = t.perPaycheckAmountActual - t.perPaycheckAmountExpected;
              return (
                <div key={t.deductionId} className="p-4 border border-red-200 bg-red-50/30 rounded-xl" data-testid={`mismatch-${t.deductionId}`}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-700">{t.planCode}</span>
                        <span className="text-xs text-gray-400">{t.employeeId}</span>
                      </div>
                      <p className="text-xs text-red-700">
                        Expected <strong>${t.perPaycheckAmountExpected.toFixed(2)}</strong>/paycheck
                        but <strong>${t.perPaycheckAmountActual.toFixed(2)}</strong> deducted
                        — difference of <strong>${Math.abs(diff).toFixed(2)}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Hub ─────────────────────────────────────────────────────────────────

type View = 'overview' | 'carriers' | 'edi' | 'payroll';

export default function IntegrationsHub() {
  const [view, setView] = useState<View>('overview');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['integrations', 'stats'],
    queryFn: integrationsApi.getStats,
    staleTime: 30_000,
  });

  const { data: carriers = [], isLoading: carriersLoading } = useQuery({
    queryKey: ['integrations', 'carriers'],
    queryFn: integrationsApi.getCarriers,
    staleTime: 30_000,
    enabled: view === 'carriers' || view === 'edi',
  });

  const { data: carrierTxns = [], isLoading: ctLoading } = useQuery({
    queryKey: ['integrations', 'carrier-transactions'],
    queryFn: () => integrationsApi.getCarrierTransactions(),
    staleTime: 30_000,
    enabled: view === 'edi',
  });

  const { data: payrollTxns = [], isLoading: prLoading } = useQuery({
    queryKey: ['integrations', 'payroll-transactions'],
    queryFn: () => integrationsApi.getPayrollTransactions(),
    staleTime: 30_000,
    enabled: view === 'payroll',
  });

  const { data: exceptions } = useQuery({
    queryKey: ['integrations', 'exceptions'],
    queryFn: integrationsApi.getExceptions,
    staleTime: 30_000,
  });

  const totalExceptions =
    (exceptions?.carrierExceptions.length ?? 0) + (exceptions?.payrollMismatches.length ?? 0);

  const VIEWS: { id: View; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'carriers', label: 'Carrier Connections' },
    { id: 'edi', label: 'EDI Transactions' },
    { id: 'payroll', label: 'Payroll Deductions' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Carrier EDI transactions, payroll deduction reconciliation, and connection health.
        </p>
      </div>

      {/* Stats row */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-4 gap-3 mb-6" data-testid="integrations-stats">
          <RateBadge value={stats.carrierSuccessRate} label="Carrier Success Rate" />
          <RateBadge value={stats.payrollMatchRate} label="Payroll Match Rate" />
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.carrierTransactions}</p>
            <p className="text-xs text-gray-500 mt-0.5">EDI Transactions</p>
          </Card>
          <Card className={`p-4 text-center ${totalExceptions > 0 ? 'border-red-200 bg-red-50/30' : ''}`}>
            <p className={`text-2xl font-bold ${totalExceptions > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {totalExceptions}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Open Exceptions</p>
          </Card>
        </div>
      )}

      {/* View switcher */}
      <div data-testid="integrations-view-switcher" className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            data-testid={`integrations-view-${id}`}
            onClick={() => setView(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {view === 'overview' && (
        <div className="space-y-5">
          {/* Exceptions summary */}
          {exceptions && totalExceptions > 0 && (
            <div className="p-4 border border-red-200 bg-red-50/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-semibold text-red-700">
                  {totalExceptions} open exception{totalExceptions !== 1 ? 's' : ''} require attention
                </h3>
              </div>
              <ExceptionsView
                carrierExceptions={exceptions.carrierExceptions}
                payrollMismatches={exceptions.payrollMismatches}
              />
            </div>
          )}

          {/* Status cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-700">Carrier EDI Status</h3>
              </div>
              <div className="space-y-2">
                {stats && Object.entries(stats.ctByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-xs">
                    <StatusBadge status={status} map={CT_STATUS_COLOR} />
                    <span className="font-semibold text-gray-700">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-semibold text-gray-700">Payroll Deductions</h3>
              </div>
              <div className="space-y-2">
                {stats && Object.entries(stats.prByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-xs">
                    <StatusBadge status={status} map={PR_STATUS_COLOR} />
                    <span className="font-semibold text-gray-700">{count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'View Carrier Connections', view: 'carriers' as View, icon: Truck },
              { label: 'Browse EDI Transactions', view: 'edi' as View, icon: RefreshCcw },
              { label: 'Payroll Reconciliation', view: 'payroll' as View, icon: DollarSign },
            ].map(({ label, view: v, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setView(v)}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-brand-300 hover:bg-brand-50/30 text-left transition-colors"
              >
                <Icon className="w-5 h-5 text-brand-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-800">{label}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Carrier Connections */}
      {view === 'carriers' && (
        <div>
          {carriersLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <CarrierList carriers={carriers} />
          )}
        </div>
      )}

      {/* EDI Transactions */}
      {view === 'edi' && (
        <div>
          {ctLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <CarrierTransactionsView transactions={carrierTxns} carriers={carriers} />
          )}
        </div>
      )}

      {/* Payroll Deductions */}
      {view === 'payroll' && (
        <div>
          {prLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : (
            <PayrollView transactions={payrollTxns} />
          )}
        </div>
      )}
    </div>
  );
}
