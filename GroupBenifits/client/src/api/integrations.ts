const BASE = 'http://localhost:3001/api/integrations';
const AUTH = { Authorization: 'Bearer P-001' };

export interface Carrier {
  carrierId: string;
  name: string;
  supportedProductTypes: string[];
  connectionType: string;
  fileFormat: string;
  transmissionSchedule: string;
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

export interface IntegrationsStats {
  carriers: number;
  carrierTransactions: number;
  carrierSuccessRate: number;
  ctByStatus: Record<string, number>;
  payrollDeductions: number;
  payrollMatchRate: number;
  prByStatus: Record<string, number>;
}

export interface IntegrationExceptions {
  carrierExceptions: CarrierTransaction[];
  payrollMismatches: PayrollTransaction[];
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { headers: AUTH });
  const json = await r.json();
  if (!json.success) throw new Error(json.error?.message ?? 'Request failed');
  return json.data as T;
}

export const integrationsApi = {
  getStats: () => get<IntegrationsStats>('/stats'),
  getExceptions: () => get<IntegrationExceptions>('/exceptions'),
  getCarriers: () => get<Carrier[]>('/carriers'),
  getCarrierTransactions: (filters?: { carrierId?: string; status?: string; employeeId?: string }) => {
    const p = new URLSearchParams();
    if (filters?.carrierId) p.set('carrierId', filters.carrierId);
    if (filters?.status) p.set('status', filters.status);
    if (filters?.employeeId) p.set('employeeId', filters.employeeId);
    const qs = p.toString() ? `?${p.toString()}` : '';
    return get<CarrierTransaction[]>(`/carrier-transactions${qs}`);
  },
  getPayrollTransactions: (filters?: { reconciliationStatus?: string }) => {
    const p = new URLSearchParams();
    if (filters?.reconciliationStatus) p.set('reconciliationStatus', filters.reconciliationStatus);
    const qs = p.toString() ? `?${p.toString()}` : '';
    return get<PayrollTransaction[]>(`/payroll-transactions${qs}`);
  },
};
