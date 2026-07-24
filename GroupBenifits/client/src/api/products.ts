import { apiFetch } from './client';
import type { Product, Carrier } from '../types';

export const productsApi = {
  list: (employerId?: string) => {
    const qs = employerId ? '?employerId=' + employerId : '';
    return apiFetch<Product[]>('/products' + qs);
  },
  get: (id: string) => apiFetch<Product>('/products/' + id),
  plans: (id: string) => apiFetch<Product['plans']>('/products/' + id + '/plans'),
};

export const carriersApi = {
  list: () => apiFetch<Carrier[]>('/carriers'),
  get: (id: string) => apiFetch<Carrier>('/carriers/' + id),
};
