import { apiFetch } from './client';
import type { SearchResult } from '../types';

export const searchApi = {
  search: (q: string, limit = 20) =>
    apiFetch<{ query: string; results: SearchResult[] }>('/search?q=' + encodeURIComponent(q) + '&limit=' + limit),
};
