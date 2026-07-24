import type { Enrollment, Plan, PlanRate, PremiumSummary, WizardElection, WizardSession } from '../types';

const BASE = '/api/enrollment';

function authHeaders() {
  const token = sessionStorage.getItem('persona_token') ?? 'P-001';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function get<T>(url: string): Promise<T> {
  const resp = await fetch(url, { headers: authHeaders() });
  const json = await resp.json();
  if (!json.success) throw new Error(json.error?.message ?? 'API error');
  return json.data as T;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const resp = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await resp.json();
  if (!json.success) throw new Error(json.error?.message ?? 'API error');
  return json.data as T;
}

async function put<T>(url: string, body: unknown): Promise<T> {
  const resp = await fetch(url, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await resp.json();
  if (!json.success) throw new Error(json.error?.message ?? 'API error');
  return json.data as T;
}

export const enrollmentApi = {
  getOpenPeriod: (employerId = 'ACM-001') =>
    get<{
      openEnrollmentId: string;
      enrollmentName: string;
      status: string;
      startDateTime: string;
      endDateTime: string;
      eligiblePlans: string[];
      progress: {
        eligibleEmployees: number;
        notStarted: number;
        inProgress: number;
        submitted: number;
        completed: number;
        exceptions: number;
      };
    }>(`${BASE}/open-period?employerId=${employerId}`),

  getPlans: () =>
    get<{ plans: Plan[]; rates: PlanRate[] }>(`${BASE}/plans`),

  getComparison: (planCodes: string[], tierType = 'EE Only') =>
    get<{ plans: Array<Plan & { rate?: PlanRate }>; tierType: string }>(
      `${BASE}/comparison?plans=${planCodes.join(',')}&tierType=${encodeURIComponent(tierType)}`
    ),

  getByEmployee: (employeeId: string) =>
    get<{ enrollment: Enrollment; premiumSummary: PremiumSummary } | null>(
      `${BASE}/employee/${employeeId}`
    ),

  startWizard: (employeeId: string) =>
    post<WizardSession>(`${BASE}/wizard/start`, { employeeId }),

  updateStep: (sessionId: string, step: number, elections: WizardElection[]) =>
    put<{ session: WizardSession; premiumSummary: PremiumSummary }>(
      `${BASE}/wizard/${sessionId}/step`,
      { step, elections }
    ),

  submitWizard: (sessionId: string) =>
    post<{ enrollmentId: string; status: string; effectiveDate: string }>(
      `${BASE}/wizard/${sessionId}/submit`,
      {}
    ),

  getAll: (employerId?: string) => {
    const qs = employerId ? `?employerId=${employerId}` : '';
    return get<{ enrollments: Enrollment[]; total: number }>(`${BASE}${qs}`);
  },
};
