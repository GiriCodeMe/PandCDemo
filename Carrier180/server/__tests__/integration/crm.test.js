const request = require('supertest')

let app

beforeEach(() => {
  jest.resetModules()
  app = require('../../app')
})

describe('GET /api/crm/customers', () => {
  it('returns all 3 customers', async () => {
    const res = await request(app).get('/api/crm/customers')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(3)
  })
})

describe('GET /api/crm/customers/:id', () => {
  it('returns John Smith for CUST-001', async () => {
    const res = await request(app).get('/api/crm/customers/CUST-001')
    expect(res.status).toBe(200)
    expect(res.body.firstName).toBe('John')
    expect(res.body.lastName).toBe('Smith')
    expect(res.body.email).toBe('john.smith@example.com')
  })

  it('returns Mary Johnson for CUST-002', async () => {
    const res = await request(app).get('/api/crm/customers/CUST-002')
    expect(res.status).toBe(200)
    expect(res.body.firstName).toBe('Mary')
    expect(res.body.lastName).toBe('Johnson')
  })

  it('returns Robert Davis for CUST-003 — not Gopi Reddy', async () => {
    const res = await request(app).get('/api/crm/customers/CUST-003')
    expect(res.status).toBe(200)
    expect(res.body.firstName).toBe('Robert')
    expect(res.body.lastName).toBe('Davis')
    expect(res.body.email).toBe('robert.davis@example.com')
    expect(res.body.firstName).not.toBe('Gopi')
  })

  it('returns customer profile fields', async () => {
    const res = await request(app).get('/api/crm/customers/CUST-001')
    expect(res.body).toHaveProperty('segment')
    expect(res.body).toHaveProperty('lifetimeValue')
    expect(res.body).toHaveProperty('npsScore')
    expect(res.body).toHaveProperty('sentimentScore')
    expect(res.body).toHaveProperty('preferredChannel')
  })

  it('returns 404 for unknown customer', async () => {
    const res = await request(app).get('/api/crm/customers/CUST-999')
    expect(res.status).toBe(404)
    expect(res.body.error).toBeTruthy()
  })
})

describe('GET /api/crm/customers/:id/history', () => {
  it('returns interaction history for CUST-001', async () => {
    const res = await request(app).get('/api/crm/customers/CUST-001/history')
    expect(res.status).toBe(200)
    expect(res.body.customerId).toBe('CUST-001')
    expect(Array.isArray(res.body.interactions)).toBe(true)
    expect(res.body.interactions.length).toBeGreaterThan(0)
  })

  it('each interaction has type, direction, date, agent, summary', async () => {
    const res = await request(app).get('/api/crm/customers/CUST-001/history')
    const interaction = res.body.interactions[0]
    expect(interaction).toHaveProperty('type')
    expect(interaction).toHaveProperty('direction')
    expect(interaction).toHaveProperty('date')
    expect(interaction).toHaveProperty('agent')
    expect(interaction).toHaveProperty('summary')
  })

  it('returns 404 for unknown customer', async () => {
    const res = await request(app).get('/api/crm/customers/CUST-999/history')
    expect(res.status).toBe(404)
  })
})

describe('POST /api/crm/customers/:id/interaction', () => {
  it('logs a new interaction and returns 201', async () => {
    const payload = { type: 'email', summary: 'Sent docs request', agent: 'Jane Doe' }
    const res = await request(app)
      .post('/api/crm/customers/CUST-001/interaction')
      .send(payload)
    expect(res.status).toBe(201)
    expect(res.body.type).toBe('email')
    expect(res.body.summary).toBe('Sent docs request')
    expect(res.body.id).toBeTruthy()
  })

  it('uses defaults for missing fields', async () => {
    const res = await request(app)
      .post('/api/crm/customers/CUST-002/interaction')
      .send({})
    expect(res.status).toBe(201)
    expect(res.body.type).toBe('note')
    expect(res.body.direction).toBe('outbound')
  })

  it('returns 404 for unknown customer', async () => {
    const res = await request(app)
      .post('/api/crm/customers/CUST-999/interaction')
      .send({ summary: 'test' })
    expect(res.status).toBe(404)
  })
})
