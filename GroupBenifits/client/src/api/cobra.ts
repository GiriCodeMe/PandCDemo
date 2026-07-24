const BASE = 'http://localhost:3001/api/cobra';
const AUTH = { Authorization: 'Bearer P-001' };

export interface CobraElection {
  planCode: string;
  planName: string;
  coverageType: string;
  monthlyPremiumEmployee: number;
  adminFeeRate: number;
  monthlyCobraCost: number;
  electionStatus: string;
  electedDate: string | null;
  declinedDate?: string | null;
  coverageStartDate?: string | null;
  coverageEndDate?: string | null;
  paymentsReceived?: number;
  paymentsDue?: number;
  lastPaymentDate?: string | null;
}

export interface CobraEvent {
  cobraEventId: string;
  employeeId: string;
  employerName: string;
  firstName: string;
  lastName: string;
  email: string;
  qualifyingEventType: string;
  qualifyingEventDate: string;
  coverageLossDate: string;
  noticeGeneratedDate: string;
  noticeSentDate: string;
  electionDeadline: string;
  electionStatus: string;
  coverageTypes: string[];
  elections: CobraElection[];
}

export interface AuditEvent {
  auditId: string;
  timestamp: string;
  eventType: string;
  actor: string;
  entityType: string;
  entityId: string;
  employeeId: string | null;
  description: string;
  status: string;
  complianceNote: string;
}

export interface CobraStats {
  total: number;
  byStatus: Record<string, number>;
  pending: number;
  elected: number;
  declined: number;
  lapsed: number;
  totalMonthlyCobraCost: number;
}

export interface ComplianceAlert {
  severity: string;
  message: string;
  cobraEventId: string;
  employeeId: string;
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { headers: AUTH });
  const json = await r.json();
  if (!json.success) throw new Error(json.error?.message ?? 'Request failed');
  return json.data as T;
}

export const cobraApi = {
  getStats: () => get<CobraStats>('/stats'),
  getAlerts: () => get<ComplianceAlert[]>('/alerts'),
  getAll: (electionStatus?: string) => {
    const qs = electionStatus ? `?electionStatus=${encodeURIComponent(electionStatus)}` : '';
    return get<CobraEvent[]>(`/${qs}`);
  },
  getById: (id: string) => get<CobraEvent>(`/${id}`),
  getByEmployee: (employeeId: string) => get<CobraEvent[]>(`/employee/${employeeId}`),
  getAuditLog: (filters?: { eventType?: string; employeeId?: string }) => {
    const p = new URLSearchParams();
    if (filters?.eventType) p.set('eventType', filters.eventType);
    if (filters?.employeeId) p.set('employeeId', filters.employeeId);
    const qs = p.toString() ? `?${p.toString()}` : '';
    return get<AuditEvent[]>(`/audit-log${qs}`);
  },
};
