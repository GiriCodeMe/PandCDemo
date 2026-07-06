const request = require('supertest')
const app = require('../../app')

describe('GET /api/health', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
  })

  it('returns { status: "ok" }', async () => {
    const res = await request(app).get('/api/health')
    expect(res.body.status).toBe('ok')
  })

  it('returns service name', async () => {
    const res = await request(app).get('/api/health')
    expect(res.body.service).toBe('carrier180-api')
  })

  it('responds with JSON', async () => {
    const res = await request(app).get('/api/health')
    expect(res.headers['content-type']).toMatch(/json/)
  })
})
