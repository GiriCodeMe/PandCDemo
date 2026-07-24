import request from 'supertest';
import { createApp } from '../app';
import { auditService } from '../services/audit.service';

describe('/api/audit', () => {
  const app = createApp();
  beforeEach(() => auditService.clear());

  it('GET / returns empty array initially', async () => {
    const res = await request(app).get('/api/audit').set('Authorization', 'Bearer P-001');
    expect(res.status).toBe(200);
    expect(res.body.data.events).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });

  it('GET /?employerId=ACM-001 filters by employer', async () => {
    auditService.log({ actor: 'P-001', actorName: 'Test', action: 'POST /api/test', entityType: 'test', entityId: '1', employerId: 'ACM-001', details: {} });
    auditService.log({ actor: 'P-002', actorName: 'Other', action: 'POST /api/test', entityType: 'test', entityId: '2', employerId: 'OTHER-001', details: {} });
    const res = await request(app).get('/api/audit?employerId=ACM-001').set('Authorization', 'Bearer P-001');
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.events[0].employerId).toBe('ACM-001');
  });
});
