const request = require('supertest')

let app

beforeEach(() => {
  jest.resetModules()
  app = require('../../app')
})

describe('GET /api/claims', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/api/claims')
    expect(res.status).toBe(200)
  })

  it('returns all 3 seed claims', async () => {
    const res = await request(app).get('/api/claims')
    expect(res.body.total).toBe(3)
    expect(res.body.claims).toHaveLength(3)
  })

  it('returns summary fields on each claim', async () => {
    const res = await request(app).get('/api/claims')
    const c = res.body.claims[0]
    expect(c).toHaveProperty('id')
    expect(c).toHaveProperty('insuredName')
    expect(c).toHaveProperty('causeOfLoss')
    expect(c).toHaveProperty('claimAmount')
    expect(c).toHaveProperty('status')
    expect(c).toHaveProperty('fraudRisk')
    expect(c).toHaveProperty('adjuster')
  })

  it('does not expose full claim internals in list', async () => {
    const res = await request(app).get('/api/claims')
    const c = res.body.claims[0]
    expect(c).not.toHaveProperty('fnolNarrative')
    expect(c).not.toHaveProperty('iotSensors')
  })

  it('filters by status=New', async () => {
    const res = await request(app).get('/api/claims?status=New')
    expect(res.status).toBe(200)
    res.body.claims.forEach(c => expect(c.status).toBe('New'))
  })

  it('filters by risk=High', async () => {
    const res = await request(app).get('/api/claims?risk=High')
    expect(res.status).toBe(200)
    res.body.claims.forEach(c => expect(c.fraudRisk).toBe('High'))
    expect(res.body.claims.length).toBeGreaterThan(0)
  })

  it('filters by search term (case-insensitive)', async () => {
    const res = await request(app).get('/api/claims?search=john')
    expect(res.status).toBe(200)
    expect(res.body.claims.length).toBeGreaterThan(0)
    const names = res.body.claims.map(c => c.insuredName.toLowerCase())
    names.forEach(n => expect(n).toMatch(/john/))
  })

  it('returns empty array when search has no match', async () => {
    const res = await request(app).get('/api/claims?search=zzznomatch')
    expect(res.status).toBe(200)
    expect(res.body.claims).toHaveLength(0)
  })
})

describe('GET /api/claims/:id', () => {
  it('returns full claim for 2026-108 (John Smith / Water)', async () => {
    const res = await request(app).get('/api/claims/2026-108')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('2026-108')
    expect(res.body.insuredName).toBe('John Smith')
    expect(res.body.causeOfLoss).toMatch(/[Ww]ater/)
  })

  it('returns full claim for 2026-102 (Mary Johnson / Fire / High risk)', async () => {
    const res = await request(app).get('/api/claims/2026-102')
    expect(res.status).toBe(200)
    expect(res.body.insuredName).toBe('Mary Johnson')
    expect(res.body.fraudRisk).toBe('High')
  })

  it('returns Robert Davis for 2026-093 — not Gopi Reddy', async () => {
    const res = await request(app).get('/api/claims/2026-093')
    expect(res.status).toBe(200)
    expect(res.body.insuredName).toBe('Robert Davis')
    expect(res.body.insuredName).not.toBe('Gopi Reddy')
    expect(res.body.fraudRisk).toBe('Low')
  })

  it('returns full detail fields', async () => {
    const res = await request(app).get('/api/claims/2026-108')
    expect(res.body).toHaveProperty('fnolNarrative')
    expect(res.body).toHaveProperty('documents')
    expect(res.body).toHaveProperty('communications')
    expect(res.body).toHaveProperty('nextSteps')
  })

  it('returns 404 for unknown claim id', async () => {
    const res = await request(app).get('/api/claims/FAKE-999')
    expect(res.status).toBe(404)
    expect(res.body.error).toBeTruthy()
  })
})

describe('GET /api/claims/stats', () => {
  it('returns KPI aggregates', async () => {
    const res = await request(app).get('/api/claims/stats')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('newClaims')
    expect(res.body).toHaveProperty('highFraudRisk')
    expect(res.body).toHaveProperty('largeLossAlerts')
    expect(res.body).toHaveProperty('avgCycleTimeOver15')
  })

  it('highFraudRisk count matches seed data (claim 2026-102 is High)', async () => {
    const res = await request(app).get('/api/claims/stats')
    expect(res.body.highFraudRisk).toBeGreaterThanOrEqual(1)
  })
})

describe('GET /api/claims/prefill/:policyNumber', () => {
  it('returns prefill data for a known policy', async () => {
    const res = await request(app).get('/api/claims/prefill/2024-001')
    expect(res.status).toBe(200)
    expect(res.body.policyNumber).toBe('2024-001')
  })

  it('returns 404 for unknown policy', async () => {
    const res = await request(app).get('/api/claims/prefill/FAKE-000')
    expect(res.status).toBe(404)
  })
})

describe('POST /api/claims', () => {
  it('creates a new claim and returns 201', async () => {
    const payload = {
      policyNumber: '2024-001',
      insuredName: 'Test Insured',
      causeOfLoss: 'Wind Damage',
      dateOfLoss: '2026-04-01',
    }
    const res = await request(app).post('/api/claims').send(payload)
    expect(res.status).toBe(201)
    expect(res.body.id).toMatch(/^2026-/)
    expect(res.body.insuredName).toBe('Test Insured')
    expect(res.body.status).toBe('New')
    expect(res.body.currentStep).toBe(1)
  })

  it('new claim has adjuster Jane Doe', async () => {
    const res = await request(app).post('/api/claims').send({ insuredName: 'Another User' })
    expect(res.body.adjuster).toBe('Jane Doe')
  })
})

describe('PATCH /api/claims/:id/status', () => {
  it('updates claim status', async () => {
    const res = await request(app)
      .patch('/api/claims/2026-108/status')
      .send({ status: 'Closed' })
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('Closed')
  })

  it('returns 404 for unknown claim', async () => {
    const res = await request(app)
      .patch('/api/claims/FAKE-000/status')
      .send({ status: 'Closed' })
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/claims/:id/step', () => {
  it('advances the step', async () => {
    const res = await request(app)
      .patch('/api/claims/2026-108/step')
      .send({ step: 3 })
    expect(res.status).toBe(200)
    expect(res.body.currentStep).toBe(3)
  })
})
