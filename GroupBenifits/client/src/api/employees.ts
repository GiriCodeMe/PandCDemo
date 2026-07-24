import { apiFetch } from './client';
import type { Employee, Dependent } from '../types';

export const employeesApi = {
  list: (employerId?: string, q?: string) => {
    const params = new URLSearchParams();
    if (employerId) params.set('employerId', employerId);
    if (q) params.set('q', q);
    const qs = params.toString();
    return apiFetch<Employee[]>('/employees' + (qs ? '?' + qs : ''));
  },
  get: (id: string) => apiFetch<Employee>('/employees/' + id),
  dependents: (id: string) => apiFetch<Dependent[]>('/employees/' + id + '/dependents'),
};
