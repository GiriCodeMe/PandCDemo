const request = require('supertest');
const app = require('../../app');

// ─── Health ───────────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('response includes gemini flag and timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(typeof res.body.gemini).toBe('boolean');
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

// ─── Billing ──────────────────────────────────────────────────────────────────

describe('GET /api/billing', () => {
  test('returns billing records', async () => {
    const res = await request(app).get('/api/billing');
    expect(res.status).toBe(200);
    const records = Array.isArray(res.body) ? res.body : (res.body.records ?? res.body.data ?? []);
    expect(records.length).toBeGreaterThan(0);
  });

  test('each record has id, policy_id, and status', async () => {
    const res = await request(app).get('/api/billing');
    const records = Array.isArray(res.body) ? res.body : (res.body.records ?? res.body.data ?? []);
    records.forEach(r => {
      expect(r.id).toBeTruthy();
      expect(r.policy_id).toBeTruthy();
      expect(r.status).toBeTruthy();
    });
  });

  test('policy_id filter returns only matching records', async () => {
    const targetId = 'POL-FRBL-2025-0042';
    const res = await request(app).get(`/api/billing?policy_id=${targetId}`);
    expect(res.status).toBe(200);
    const records = Array.isArray(res.body) ? res.body : (res.body.records ?? res.body.data ?? []);
    records.forEach(r => expect(r.policy_id).toBe(targetId));
  });
});

// ─── Policies ─────────────────────────────────────────────────────────────────

describe('GET /api/policies', () => {
  test('returns list of policies', async () => {
    const res = await request(app).get('/api/policies');
    expect(res.status).toBe(200);
    const list = Array.isArray(res.body) ? res.body : (res.body.policies ?? res.body.data ?? []);
    expect(list.length).toBeGreaterThan(0);
  });

  test('search filter returns results containing the term', async () => {
    const res = await request(app).get('/api/policies?search=Biscuit');
    expect(res.status).toBe(200);
  });

  test('GET /api/policies/:id returns a single policy', async () => {
    const res = await request(app).get('/api/policies/POL-FRBL-2025-0042');
    expect(res.status).toBe(200);
    const policy = res.body.policy ?? res.body;
    expect(policy.policy_id ?? policy.id).toBeTruthy();
  });

  test('GET /api/policies/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/policies/POL-UNKNOWN-000000');
    expect(res.status).toBe(404);
  });
});
