const request = require('supertest')
const app = require('../../app')

describe('GET /api/sor/policies/:policyNumber', () => {
  it('returns policy for 2024-001', async () => {
    const res = await request(app).get('/api/sor/policies/2024-001')
    expect(res.status).toBe(200)
    expect(res.body.policyNumber).toBe('2024-001')
  })

  it('returns policy for 2024-002 (Mary Johnson)', async () => {
    const res = await request(app).get('/api/sor/policies/2024-002')
    expect(res.status).toBe(200)
    expect(res.body.policyNumber).toBe('2024-002')
  })

  it('returns policy for 2024-003 (Robert Davis)', async () => {
    const res = await request(app).get('/api/sor/policies/2024-003')
    expect(res.status).toBe(200)
  })

  it('returns coverage fields', async () => {
    const res = await request(app).get('/api/sor/policies/2024-001')
    expect(res.body).toHaveProperty('coverages')
    expect(res.body).toHaveProperty('exclusions')
  })

  it('returns 404 for unknown policy', async () => {
    const res = await request(app).get('/api/sor/policies/FAKE-000')
    expect(res.status).toBe(404)
  })
})

describe('GET /api/sor/policies/:policyNumber/coverages', () => {
  it('returns coverage eligibility', async () => {
    const res = await request(app).get('/api/sor/policies/2024-001/coverages')
    expect(res.status).toBe(200)
    expect(res.body.policyNumber).toBe('2024-001')
    expect(Array.isArray(res.body.eligible)).toBe(true)
  })

  it('filters eligible coverages by causeOfLoss=water', async () => {
    const res = await request(app).get('/api/sor/policies/2024-001/coverages?causeOfLoss=water')
    expect(res.status).toBe(200)
    const keys = res.body.eligible.map(c => c.coverage)
    expect(keys.some(k => k.toLowerCase().includes('water') || k === 'moldRemediation')).toBe(true)
  })

  it('filters eligible coverages by causeOfLoss=fire', async () => {
    const res = await request(app).get('/api/sor/policies/2024-002/coverages?causeOfLoss=fire')
    expect(res.status).toBe(200)
    const keys = res.body.eligible.map(c => c.coverage)
    expect(keys.some(k => k === 'fire' || k === 'smokeDamage' || k === 'ale')).toBe(true)
  })
})

describe('GET /api/sor/claims/history/:policyNumber', () => {
  it('returns prior claims for 2024-001', async () => {
    const res = await request(app).get('/api/sor/claims/history/2024-001')
    expect(res.status).toBe(200)
    expect(res.body.policyNumber).toBe('2024-001')
    expect(Array.isArray(res.body.claims)).toBe(true)
    expect(typeof res.body.total).toBe('number')
  })

  it('returns empty for policy with no claims', async () => {
    const res = await request(app).get('/api/sor/claims/history/9999-001')
    expect(res.status).toBe(200)
    expect(res.body.claims).toHaveLength(0)
  })
})

describe('GET /api/sor/policies', () => {
  it('returns all policies', async () => {
    const res = await request(app).get('/api/sor/policies')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(3)
  })
})
