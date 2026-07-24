const BASE = '/api';

export class ApiError extends Error {
  constructor(public code: string, message: string, public retryable = false) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem('persona_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as Record<string, string>) };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(BASE + path, { ...init, headers });
  const body = await res.json();

  if (!body.success) {
    throw new ApiError(body.error?.code ?? 'UNKNOWN', body.error?.message ?? 'Request failed', body.error?.retryable ?? false);
  }
  return body.data as T;
}
