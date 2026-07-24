import request from 'supertest';
import { createApp } from '../app';
import { resetStore } from '../db/FileStore';

describe('/api/auth', () => {
  const app = createApp();
  beforeEach(() => resetStore());

  describe('GET /api/auth/personas', () => {
    it('returns array of personas', async () => {
      const res = await request(app).get('/api/auth/personas');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('personaId');
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('role');
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns token and persona for valid personaId', async () => {
      const res = await request(app).post('/api/auth/login').send({ personaId: 'P-001' });
      expect(res.status).toBe(200);
      expect(res.body.data.token).toBe('P-001');
      expect(res.body.data.persona.personaId).toBe('P-001');
    });

    it('returns 404 for unknown personaId', async () => {
      const res = await request(app).post('/api/auth/login').send({ personaId: 'P-999' });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when personaId missing', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns current persona when valid bearer token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer P-002');
      expect(res.status).toBe(200);
      expect(res.body.data.personaId).toBe('P-002');
    });

    it('defaults to P-001 when no token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(200);
      expect(res.body.data.personaId).toBe('P-001');
    });

    it('returns 401 for unknown token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer X-999');
      expect(res.status).toBe(401);
    });
  });
});
