const BASE = 'http://localhost:3001/api/life-events';
const AUTH = { Authorization: 'Bearer P-001' };

export interface LifeEvent {
  lifeEventId: string;
  employeeId: string;
  eventType: string;
  eventDate: string;
  enrollmentWindowStart: string;
  enrollmentWindowEnd: string;
  status: string;
  documentsRequired: string[];
  documentsSubmitted: string[];
  submittedAt: string;
  processedAt: string | null;
}

export interface DependentRule {
  ruleId: string;
  ruleType: string;
  description: string;
  ageLimit: number | null;
  ageLimitType: string | null;
  documentationRequired: string[];
  status: string;
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { headers: AUTH });
  const json = await r.json();
  if (!json.success) throw new Error(json.error?.message ?? 'Request failed');
  return json.data as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { ...AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await r.json();
  if (!json.success) throw new Error(json.error?.message ?? 'Request failed');
  return json.data as T;
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { ...AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await r.json();
  if (!json.success) throw new Error(json.error?.message ?? 'Request failed');
  return json.data as T;
}

export const lifeEventsApi = {
  getAll(filters?: { status?: string; employeeId?: string; eventType?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.employeeId) params.set('employeeId', filters.employeeId);
    if (filters?.eventType) params.set('eventType', filters.eventType);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return get<{ events: LifeEvent[]; stats: Record<string, number> }>(`/${qs}`);
  },
  getById: (id: string) => get<LifeEvent>(`/${id}`),
  getByEmployee: (employeeId: string) => get<LifeEvent[]>(`/employee/${employeeId}`),
  getDependentRules: () => get<DependentRule[]>('/dependent-rules'),
  getEventTypes: () => get<string[]>('/event-types'),
  submit: (employeeId: string, eventType: string, eventDate: string) =>
    post<LifeEvent>('/', { employeeId, eventType, eventDate }),
  updateStatus: (id: string, status: string) =>
    put<LifeEvent>(`/${id}/status`, { status }),
  submitDocument: (id: string, documentName: string) =>
    post<LifeEvent>(`/${id}/documents`, { documentName }),
};
