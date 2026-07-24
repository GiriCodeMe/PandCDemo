import { apiFetch } from './client';
import type { Employer, PlanYear, DashboardMetrics } from '../types';

export const employersApi = {
  list: () => apiFetch<Employer[]>('/employers'),
  get: (id: string) => apiFetch<Employer>('/employers/' + id),
  planYears: (id: string) => apiFetch<PlanYear[]>('/employers/' + id + '/plan-years'),
  dashboard: (id: string) => apiFetch<DashboardMetrics>('/employers/' + id + '/dashboard'),
};
