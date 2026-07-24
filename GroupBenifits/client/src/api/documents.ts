import { BenefitsDocument, Requirement, GenerateResult } from '../types';

const BASE = '/api';

async function json<T>(res: Response): Promise<T> {
  const body = await res.json();
  if (!body.success) throw new Error(body.error?.message ?? 'Request failed');
  return body.data as T;
}

export const documentsApi = {
  list: (employerId?: string): Promise<BenefitsDocument[]> => {
    const q = employerId ? `?employerId=${employerId}` : '';
    return fetch(`${BASE}/documents${q}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('gb_persona') ?? 'P-001'}` },
    }).then(json<BenefitsDocument[]>);
  },

  get: (id: string): Promise<BenefitsDocument> =>
    fetch(`${BASE}/documents/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('gb_persona') ?? 'P-001'}` },
    }).then(json<BenefitsDocument>),

  getRequirements: (id: string): Promise<Requirement[]> =>
    fetch(`${BASE}/documents/${id}/requirements`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('gb_persona') ?? 'P-001'}` },
    }).then(json<Requirement[]>),
};

export const requirementsApi = {
  list: (category?: string, priority?: string): Promise<Requirement[]> => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (priority) params.set('priority', priority);
    const q = params.toString() ? `?${params}` : '';
    return fetch(`${BASE}/requirements${q}`).then(json<Requirement[]>);
  },

  generate: (documentId?: string): Promise<GenerateResult> =>
    fetch(`${BASE}/requirements/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gb_persona') ?? 'P-001'}` },
      body: JSON.stringify({ documentId }),
    }).then(json<GenerateResult>),
};
