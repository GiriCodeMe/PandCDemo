import request from 'supertest';
import { createApp } from '../app';
import { resetStore } from '../db/FileStore';

describe('/api/employers', () => {
  const app = createApp();
  beforeEach(() => resetStore());

  it('GET / returns list of employers', async () => {
    const res = await request(app).get('/api/employers').set('Authorization', 'Bearer P-001');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].employerId).toBe('ACM-001');
    expect(res.body.data[0].name).toBe('Acme Corporation');
  });

  it('GET /:id returns single employer', async () => {
    const res = await request(app).get('/api/employers/ACM-001').set('Authorization', 'Bearer P-001');
    expect(res.status).toBe(200);
    expect(res.body.data.employerId).toBe('ACM-001');
  });

  it('GET /:id returns 404 for unknown employer', async () => {
    const res = await request(app).get('/api/employers/UNKNOWN').set('Authorization', 'Bearer P-001');
    expect(res.status).toBe(404);
  });

  it('GET /:id/plan-years returns derived plan years', async () => {
    const res = await request(app).get('/api/employers/ACM-001/plan-years').set('Authorization', 'Bearer P-001');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(3);
    expect(res.body.data[0]).toHaveProperty('planYearId');
    expect(res.body.data[0]).toHaveProperty('status');
  });

  it('GET /:id/dashboard returns metrics', async () => {
    const res = await request(app).get('/api/employers/ACM-001/dashboard').set('Authorization', 'Bearer P-001');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('enrollment');
    expect(res.body.data.enrollment.enrollmentRate).toBe(88.7);
  });

  it('requires auth — 401 for unknown persona', async () => {
    const res = await request(app).get('/api/employers').set('Authorization', 'Bearer NOBODY');
    expect(res.status).toBe(401);
  });
});
