const request = require('supertest')

let app

beforeEach(() => {
  jest.resetModules()
  app = require('../../app')
})

describe('GET /api/erp/invoices/:claimId', () => {
  it('returns invoices for 2026-108', async () => {
    const res = await request(app).get('/api/erp/invoices/2026-108')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('returns empty array for claim with no invoices', async () => {
    const res = await request(app).get('/api/erp/invoices/FAKE-000')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(0)
  })
})

describe('GET /api/erp/vendors', () => {
  it('returns all vendors', async () => {
    const res = await request(app).get('/api/erp/vendors')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('filters by type', async () => {
    const res = await request(app).get('/api/erp/vendors?type=plumbing')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('GET /api/erp/reserves/:claimId', () => {
  it('returns reserve data for 2026-108', async () => {
    const res = await request(app).get('/api/erp/reserves/2026-108')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('breakdown')
  })

  it('returns 404 for unknown claim', async () => {
    const res = await request(app).get('/api/erp/reserves/FAKE-000')
    expect(res.status).toBe(404)
  })
})

describe('GET /api/erp/service-providers', () => {
  it('returns list of service providers', async () => {
    const res = await request(app).get('/api/erp/service-providers')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('filters by type', async () => {
    const res = await request(app).get('/api/erp/service-providers?type=plumber')
    expect(res.status).toBe(200)
    if (res.body.length > 0) {
      expect(res.body[0].type).toBe('plumber')
    }
  })
})

describe('POST /api/erp/payments', () => {
  it('returns 400 when claimId or amount is missing', async () => {
    const res = await request(app).post('/api/erp/payments').send({ claimId: '2026-108' })
    expect(res.status).toBe(400)
  })

  it('logs a payment for a valid claim', async () => {
    const res = await request(app)
      .post('/api/erp/payments')
      .send({ claimId: '2026-108', amount: 5000, category: 'Dwelling', payee: 'Restoration Pro' })
    expect(res.status).toBe(201)
    expect(res.body.amount).toBe(5000)
    expect(res.body.status).toBe('Issued')
    expect(res.body.id).toMatch(/^PAY-/)
  })
})
