import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Policies (Mock SOR/CRM)
export const getPolicies = (params = {}) => api.get('/policies', { params });
export const getPolicy = (id) => api.get(`/policies/${id}`);

// Billing (Mock ERP)
export const getBilling = (params = {}) => api.get('/billing', { params });
export const getDashboardStats = () => api.get('/billing/stats/dashboard');

// Claims (Mock SOR)
export const getClaims = () => api.get('/claims');

// UC-01: Invoice Parsing
export const parseInvoice = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/invoices/parse', form);
};

// UC-02: Claims Adjudication
export const adjudicateClaim = (invoice, policy_id) =>
  api.post('/claims/adjudicate', { invoice, policy_id });

// UC-03: Medical Coding
export const codeMedicalNote = (file, species = 'canine') => {
  const form = new FormData();
  if (file) form.append('file', file);
  form.append('species', species);
  return api.post('/coding/notes', form);
};

// UC-04: Breed & Fraud Verification
export const verifyBreed = (file, declared_breed, policy_holder = '') => {
  const form = new FormData();
  form.append('file', file);
  form.append('declared_breed', declared_breed);
  form.append('policy_holder', policy_holder);
  return api.post('/fraud/verify', form);
};

// UC-05: Medical History Review
export const reviewHistory = (file, policy_inception_date, species = 'canine') => {
  const form = new FormData();
  form.append('file', file);
  form.append('policy_inception_date', policy_inception_date);
  form.append('species', species);
  return api.post('/history/review', form);
};

// UC-06: Underwriting (combined)
export const runUnderwriting = (application) =>
  api.post('/underwriting/evaluate', { application });

// UC-06b: Individual UW agent calls
export const runUWAgent = (agentType, application, previousResults = null) =>
  api.post('/underwriting/agent', { agentType, application, previousResults });

// UC-07: FNOL — First Notice of Loss
export const fnolGetPolicies = () => api.get('/fnol/policies');
export const fnolExtract = (formData) => api.post('/fnol/extract', formData);
export const fnolSubmit = (payload) => api.post('/fnol/submit', { payload });

// Quote generation
export const generateQuote = (pet, holder, coverage_type, requested_benefit, health_data) =>
  api.post('/quote/generate', { pet, holder, coverage_type, requested_benefit, health_conditions: health_data?.conditions || [] });

// Health check
export const healthCheck = () => api.get('/health');
