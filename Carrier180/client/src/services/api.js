const BASE = '/api';

const log = {
  req:  (method, path, body) => console.log( `[api] --> ${method} ${path}`, body !== undefined ? body : ''),
  res:  (method, path, status, ms) => console.log( `[api] <-- ${method} ${path} ${status} (${ms}ms)`),
  err:  (method, path, err)  => console.error(`[api] !!! ${method} ${path}`, err),
};

async function get(path) {
  const t = Date.now();
  log.req('GET', path);
  try {
    const res = await fetch(`${BASE}${path}`);
    log.res('GET', path, res.status, Date.now() - t);
    if (!res.ok) throw new Error(`API GET ${path} → ${res.status}`);
    return res.json();
  } catch (err) {
    log.err('GET', path, err);
    throw err;
  }
}

async function post(path, body) {
  const t = Date.now();
  log.req('POST', path, body);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    log.res('POST', path, res.status, Date.now() - t);
    if (!res.ok) throw new Error(`API POST ${path} → ${res.status}`);
    return res.json();
  } catch (err) {
    log.err('POST', path, err);
    throw err;
  }
}

async function patch(path, body) {
  const t = Date.now();
  log.req('PATCH', path, body);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    log.res('PATCH', path, res.status, Date.now() - t);
    if (!res.ok) throw new Error(`API PATCH ${path} → ${res.status}`);
    return res.json();
  } catch (err) {
    log.err('PATCH', path, err);
    throw err;
  }
}

export const claimsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/claims${q ? '?' + q : ''}`);
  },
  stats: () => get('/claims/stats'),
  get: (id) => get(`/claims/${id}`),
  prefill: (policyNumber) => get(`/claims/prefill/${policyNumber}`),
  create: (data) => post('/claims', data),
  updateStep: (id, step) => patch(`/claims/${id}/step`, { step }),
  updateStatus: (id, data) => patch(`/claims/${id}/status`, data)
};

export const stellaApi = {
  chat: (message, context, history = []) => post('/stella/chat', { message, context, history })
};

export const aiApi = {
  photoReview: (claimId) => post('/ai/photo-review', { claimId }),
  addressCompare: (claimId) => post('/ai/address-compare', { claimId }),
  fraudVector: (claimId) => post('/ai/fraud-vector', { claimId })
};

export const crmApi = {
  getCustomer: (id) => get(`/crm/customers/${id}`),
  getHistory: (id) => get(`/crm/customers/${id}/history`),
  logInteraction: (id, data) => post(`/crm/customers/${id}/interaction`, data)
};

export const erpApi = {
  getInvoices: (claimId) => get(`/erp/invoices/${claimId}`),
  getVendors: (type) => get(`/erp/vendors${type ? '?type=' + type : ''}`),
  getReserves: (claimId) => get(`/erp/reserves/${claimId}`),
  logPayment: (data) => post('/erp/payments', data),
  getServiceProviders: (type, zip) => {
    const q = new URLSearchParams();
    if (type) q.set('type', type);
    if (zip) q.set('zip', zip);
    return get(`/erp/service-providers${q.toString() ? '?' + q.toString() : ''}`);
  }
};

export const sorApi = {
  getPolicy: (policyNumber) => get(`/sor/policies/${policyNumber}`),
  getCoverages: (policyNumber, causeOfLoss) => get(`/sor/policies/${policyNumber}/coverages${causeOfLoss ? '?causeOfLoss=' + causeOfLoss : ''}`),
  getClaimHistory: (policyNumber) => get(`/sor/claims/history/${policyNumber}`)
};
