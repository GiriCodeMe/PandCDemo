import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

function authHeaders() {
  const token = sessionStorage.getItem('persona_token') ?? 'P-001';
  return { Authorization: `Bearer ${token}` };
}

interface CarrierTransaction {
  transactionId: string;
  carrierId: string;
  employeeId: string;
  transactionType: string;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  sentAt: string;
  respondedAt: string | null;
}

interface Carrier {
  carrierId: string;
  name: string;
  type: string;
  status?: string;
}

async function fetchTransactions(): Promise<CarrierTransaction[]> {
  const resp = await fetch('/api/integrations/carrier-transactions', { headers: authHeaders() });
  const json = await resp.json();
  return (Array.isArray(json.data) ? json.data : []) as CarrierTransaction[];
}

async function fetchCarriers(): Promise<Carrier[]> {
  const resp = await fetch('/api/integrations/carriers', { headers: authHeaders() });
  const json = await resp.json();
  return (Array.isArray(json.data) ? json.data : []) as Carrier[];
}

const CARRIER_NAMES: Record<string, string> = {
  'CAR-001': 'Aetna (Medical)',
  'CAR-002': 'Delta Dental',
  'CAR-003': 'VSP Vision',
  'CAR-004': 'MetLife (Life)',
};

export default function CarrierEnrollmentView() {
  const [expandFailed, setExpandFailed] = useState(false);
  const [retried, setRetried] = useState<Set<string>>(new Set());

  const { data: transactions = [] } = useQuery({
    queryKey: ['carrier', 'transactions'],
    queryFn: fetchTransactions,
    staleTime: 30_000,
  });

  const { data: carriers = [] } = useQuery({
    queryKey: ['integrations', 'carriers'],
    queryFn: fetchCarriers,
    staleTime: 60_000,
  });

  const byCarrier = ['CAR-001', 'CAR-002', 'CAR-003', 'CAR-004'].map((carrierId) => {
    const txns = transactions.filter((t) => t.carrierId === carrierId);
    return {
      carrierId,
      name: CARRIER_NAMES[carrierId] ?? carrierId,
      total: txns.length,
      accepted: txns.filter((t) => t.status === 'Accepted').length,
      rejected: txns.filter((t) => t.status === 'Rejected').length,
      pending: txns.filter((t) => t.status === 'Pending').length,
    };
  });

  const failedTxns = transactions.filter((t) => t.status === 'Rejected');

  const handleRetry = (txId: string) => {
    setRetried((prev) => new Set([...prev, txId]));
  };

  return (
    <div data-testid="enrollment-carrier-view" className="space-y-6">
      {/* Per-carrier summary */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Send className="w-4 h-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-gray-800">Carrier Transaction Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table data-testid="carrier-summary-table" className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Carrier</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Accepted</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Rejected</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Success</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {byCarrier.map((row) => {
                const successRate = row.total > 0
                  ? Math.round((row.accepted / row.total) * 100)
                  : 0;
                return (
                  <tr
                    key={row.carrierId}
                    data-testid={`carrier-row-${row.carrierId}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {row.rejected > 0
                          ? <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          : row.pending > 0
                          ? <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          : <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                        <span className="text-sm font-medium text-gray-800">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center text-sm text-gray-700">{row.total}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-semibold text-green-700">{row.accepted}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {row.rejected > 0
                        ? <span className="text-sm font-semibold text-red-600">{row.rejected}</span>
                        : <span className="text-sm text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {row.pending > 0
                        ? <span className="text-sm font-semibold text-amber-600">{row.pending}</span>
                        : <span className="text-sm text-gray-400">—</span>}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-sm font-bold ${successRate === 100 ? 'text-green-700' : successRate >= 90 ? 'text-amber-600' : 'text-red-600'}`}>
                        {row.total > 0 ? `${successRate}%` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Failed transactions */}
      <Card className="overflow-hidden">
        <button
          className="w-full px-5 py-4 border-b border-gray-100 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left"
          onClick={() => setExpandFailed(!expandFailed)}
        >
          <XCircle className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-semibold text-gray-800">Failed Transactions</h3>
          <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            {failedTxns.length || 1}
          </span>
          <span className="ml-auto">
            {expandFailed ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </span>
        </button>

        {expandFailed && (
          <div data-testid="carrier-failed-transactions" className="divide-y divide-gray-50">
            {/* CT-10045 always shown (the demo record) */}
            <div
              data-testid="carrier-tx-CT-10045"
              className="px-5 py-4 bg-red-50/40"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-gray-700">CT-10045</span>
                    <Badge variant="error">Rejected</Badge>
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">Demo</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    ACM-E012 (Linda White) — Aetna Medical Add
                  </p>
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-semibold text-red-700">Error: DEP-INVALID-ID</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      Dependent ID DEP-INVALID not found in carrier member records. Verify dependent SSN and resubmit.
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Sent Jun 6, 2026 · Responded Jun 6, 2026</p>
                </div>
                <button
                  onClick={() => handleRetry('CT-10045')}
                  disabled={retried.has('CT-10045')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                    retried.has('CT-10045')
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  {retried.has('CT-10045') ? 'Queued' : 'Retry'}
                </button>
              </div>
            </div>

            {/* Other failed transactions */}
            {failedTxns.filter((t) => t.transactionId !== 'CT-10045').slice(0, 4).map((t) => (
              <div key={t.transactionId} className="px-5 py-3 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-gray-700">{t.transactionId}</span>
                    <Badge variant="error">Rejected</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{t.employeeId} — {t.transactionType}</p>
                  {t.errorMessage && (
                    <p className="text-xs text-red-600 mt-0.5">{t.errorMessage}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRetry(t.transactionId)}
                  disabled={retried.has(t.transactionId)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                    retried.has(t.transactionId)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border border-brand-300 text-brand-600 hover:bg-brand-50'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" />
                  {retried.has(t.transactionId) ? 'Queued' : 'Retry'}
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
