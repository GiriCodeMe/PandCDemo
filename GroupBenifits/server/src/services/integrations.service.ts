import { getStore } from '../db/FileStore';

export interface Carrier {
  carrierId: string;
  name: string;
  supportedProductTypes: string[];
  connectionType: string;
  fileFormat: string;
  transmissionSchedule: string;
  mockApiEndpoint: string;
  status: string;
}

export interface CarrierTransaction {
  transactionId: string;
  carrierId: string;
  employeeId: string;
  enrollmentId: string;
  transactionType: string;
  status: string;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown> | null;
  errorCode: string | null;
  errorMessage: string | null;
  sentAt: string;
  respondedAt: string;
}

export interface PayrollTransaction {
  deductionId: string;
  employeeId: string;
  enrollmentId: string;
  planCode: string;
  deductionCode: string;
  monthlyAmount: number;
  payFrequency: string;
  perPaycheckAmountExpected: number;
  perPaycheckAmountActual: number;
  effectiveDate: string;
  terminationDate: string | null;
  status: string;
  reconciliationStatus: string;
  coverageMonth: string;
}

function carrierTransactions(): CarrierTransaction[] {
  return getStore().readArray<CarrierTransaction>('integrations/carrierTransactions');
}

function payrollTransactions(): PayrollTransaction[] {
  return getStore().readArray<PayrollTransaction>('integrations/payrollTransactions');
}

function carriers(): Carrier[] {
  return getStore().readArray<Carrier>('integrations/carriers');
}

function calcRate(items: { status: string }[], accepted: string[]): number {
  if (!items.length) return 100;
  const ok = items.filter((t) => accepted.includes(t.status)).length;
  return Math.round((ok / items.length) * 100);
}

export const integrationsService = {
  getCarriers(): Carrier[] {
    return carriers();
  },

  getCarrierById(id: string): Carrier | null {
    return carriers().find((c) => c.carrierId === id) ?? null;
  },

  getCarrierTransactions(filters?: {
    carrierId?: string;
    status?: string;
    employeeId?: string;
    transactionType?: string;
  }): CarrierTransaction[] {
    let txns = carrierTransactions();
    if (filters?.carrierId) txns = txns.filter((t) => t.carrierId === filters.carrierId);
    if (filters?.status) txns = txns.filter((t) => t.status === filters.status);
    if (filters?.employeeId) txns = txns.filter((t) => t.employeeId === filters.employeeId);
    if (filters?.transactionType) txns = txns.filter((t) => t.transactionType === filters.transactionType);
    return txns.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  },

  getPayrollTransactions(filters?: {
    employeeId?: string;
    reconciliationStatus?: string;
  }): PayrollTransaction[] {
    let txns = payrollTransactions();
    if (filters?.employeeId) txns = txns.filter((t) => t.employeeId === filters.employeeId);
    if (filters?.reconciliationStatus)
      txns = txns.filter((t) => t.reconciliationStatus === filters.reconciliationStatus);
    return txns;
  },

  getStats() {
    const ctxns = carrierTransactions();
    const ptxns = payrollTransactions();
    const ctStatus: Record<string, number> = {};
    for (const t of ctxns) ctStatus[t.status] = (ctStatus[t.status] ?? 0) + 1;
    const prStatus: Record<string, number> = {};
    for (const t of ptxns) prStatus[t.reconciliationStatus] = (prStatus[t.reconciliationStatus] ?? 0) + 1;
    return {
      carriers: carriers().length,
      carrierTransactions: ctxns.length,
      carrierSuccessRate: calcRate(ctxns, ['Accepted']),
      ctByStatus: ctStatus,
      payrollDeductions: ptxns.length,
      payrollMatchRate: calcRate(ptxns, ['Matched']),
      prByStatus: prStatus,
    };
  },

  getExceptions() {
    const rejectedOrFailed = carrierTransactions().filter((t) =>
      ['Rejected', 'Failed'].includes(t.status),
    );
    const payrollMismatches = payrollTransactions().filter(
      (t) => t.reconciliationStatus === 'Mismatch',
    );
    return { carrierExceptions: rejectedOrFailed, payrollMismatches };
  },
};
