import { EligibilityRule, DependentRule, PlanConfigSummary, OpenEnrollmentPeriod } from '../types';

const BASE = '/api';

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!body.success) throw new Error(body.error?.message ?? 'Request failed');
  return body.data as T;
}

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('gb_persona') ?? 'P-001'}` });

export const planConfigApi = {
  getSummary: (employerId?: string): Promise<PlanConfigSummary> => {
    const q = employerId ? `?employerId=${employerId}` : '';
    return fetch(`${BASE}/plan-config${q}`, { headers: authHeader() }).then(json<PlanConfigSummary>);
  },

  getOpenEnrollment: (employerId?: string): Promise<OpenEnrollmentPeriod> => {
    const q = employerId ? `?employerId=${employerId}` : '';
    return fetch(`${BASE}/plan-config/open-enrollment${q}`, { headers: authHeader() }).then(json<OpenEnrollmentPeriod>);
  },

  publish: (employerId?: string, planYear?: number) =>
    fetch(`${BASE}/plan-config/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ employerId, planYear }),
    }).then(json<Record<string, unknown>>),
};

export const eligibilityApi = {
  getRules: (employerId?: string): Promise<EligibilityRule[]> => {
    const q = employerId ? `?employerId=${employerId}` : '';
    return fetch(`${BASE}/eligibility-rules${q}`, { headers: authHeader() }).then(json<EligibilityRule[]>);
  },

  getDependentRules: (): Promise<DependentRule[]> =>
    fetch(`${BASE}/eligibility-rules/dependent-rules`, { headers: authHeader() }).then(json<DependentRule[]>),

  evaluate: (ruleId: string, employeeData: Record<string, unknown>) =>
    fetch(`${BASE}/eligibility-rules/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ ruleId, employeeData }),
    }).then(json<Record<string, unknown>>),
};
