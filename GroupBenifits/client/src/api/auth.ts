import { apiFetch } from './client';
import type { Persona } from '../types';

export const authApi = {
  getPersonas: () => apiFetch<Persona[]>('/auth/personas'),
  login: (personaId: string) => apiFetch<{ token: string; persona: Persona }>('/auth/login', { method: 'POST', body: JSON.stringify({ personaId }) }),
  me: () => apiFetch<Persona>('/auth/me'),
};
