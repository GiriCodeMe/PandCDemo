import request from 'supertest';
import { createApp } from '../app';
import { resetStore } from '../db/FileStore';

describe('/api/search', () => {
  const app = createApp();
  beforeEach(() => resetStore());

  it('returns empty array for short query', async () => {
    const res = await request(app).get('/api/search?q=a').set('Authorization', 'Bearer P-001');
    expect(res.status).toBe(200);
    expect(res.body.data.results).toHaveLength(0);
  });

  it('finds Acme Corporation by name', async () => {
    const res = await request(app).get('/api/search?q=acme').set('Authorization', 'Bearer P-001');
    expect(res.status).toBe(200);
    const employer = res.body.data.results.find((r: { type: string }) => r.type === 'employer');
    expect(employer).toBeDefined();
    expect(employer.name).toContain('Acme');
  });

  it('finds employees by name', async () => {
    const res = await request(app).get('/api/search?q=john').set('Authorization', 'Bearer P-001');
    expect(res.status).toBe(200);
    const employee = res.body.data.results.find((r: { type: string }) => r.type === 'employee');
    expect(employee).toBeDefined();
  });

  it('does not expose SSN in search results', async () => {
    const res = await request(app).get('/api/search?q=smith').set('Authorization', 'Bearer P-001');
    expect(res.status).toBe(200);
    const json = JSON.stringify(res.body);
    expect(json).not.toMatch(/\d{3}-\d{2}-\d{4}/);
  });

  it('respects limit parameter', async () => {
    const res = await request(app).get('/api/search?q=a&limit=2').set('Authorization', 'Bearer P-001');
    expect(res.status).toBe(200);
    // query too short — expect 0 results
    expect(res.body.data.results.length).toBe(0);
  });
});
