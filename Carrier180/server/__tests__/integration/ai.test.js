const request = require('supertest')
const app = require('../../app')

// All tests run in simulated mode (no GEMINI_API_KEY in test env)

describe('POST /api/ai/photo-review', () => {
  it('returns 400 when claimId is missing', async () => {
    const res = await request(app).post('/api/ai/photo-review').send({})
    expect(res.status).toBe(400)
    expect(res.body.error).toBeTruthy()
  })

  it('returns 404 for unknown claimId', async () => {
    const res = await request(app).post('/api/ai/photo-review').send({ claimId: 'FAKE-000' })
    expect(res.status).toBe(404)
  })

  it('returns photo review shape for 2026-108', async () => {
    const res = await request(app).post('/api/ai/photo-review').send({ claimId: '2026-108' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('overallConsistency')
    expect(res.body).toHaveProperty('damageSeverity')
    expect(res.body).toHaveProperty('damageZones')
    expect(res.body).toHaveProperty('fraudIndicators')
    expect(res.body).toHaveProperty('nextActions')
    expect(res.body).toHaveProperty('estimateValidation')
  })

  it('2026-108 water damage is CONSISTENT + HIGH severity', async () => {
    const res = await request(app).post('/api/ai/photo-review').send({ claimId: '2026-108' })
    expect(res.body.overallConsistency).toBe('CONSISTENT')
    expect(res.body.damageSeverity).toBe('HIGH')
  })

  it('2026-102 fire damage is CRITICAL severity', async () => {
    const res = await request(app).post('/api/ai/photo-review').send({ claimId: '2026-102' })
    expect(res.body.damageSeverity).toBe('CRITICAL')
    expect(res.body.estimateValidation).toBe('INSUFFICIENT_EVIDENCE')
  })

  it('2026-093 roof damage has no fraud indicators', async () => {
    const res = await request(app).post('/api/ai/photo-review').send({ claimId: '2026-093' })
    expect(res.body.fraudIndicators).toHaveLength(0)
    expect(res.body.estimateValidation).toBe('SUPPORTS_CLAIM')
  })

  it('damageZones is an array', async () => {
    const res = await request(app).post('/api/ai/photo-review').send({ claimId: '2026-108' })
    expect(Array.isArray(res.body.damageZones)).toBe(true)
    expect(res.body.damageZones.length).toBeGreaterThan(0)
  })
})

describe('POST /api/ai/address-compare', () => {
  it('returns 400 when claimId is missing', async () => {
    const res = await request(app).post('/api/ai/address-compare').send({})
    expect(res.status).toBe(400)
  })

  it('returns SIGNIFICANT_MISMATCH for 2026-108 (invoice vs CRM address)', async () => {
    const res = await request(app).post('/api/ai/address-compare').send({ claimId: '2026-108' })
    expect(res.status).toBe(200)
    expect(res.body.overallVerdict).toBe('SIGNIFICANT_MISMATCH')
    expect(res.body.riskLevel).toBe('MEDIUM')
  })

  it('returns ADDRESSES_CONSISTENT for 2026-102 (all docs match)', async () => {
    const res = await request(app).post('/api/ai/address-compare').send({ claimId: '2026-102' })
    expect(res.status).toBe(200)
    expect(res.body.overallVerdict).toBe('ADDRESSES_CONSISTENT')
    expect(res.body.riskLevel).toBe('LOW')
    expect(res.body.fraudConcerns).toHaveLength(0)
  })

  it('returns ADDRESSES_CONSISTENT for 2026-093', async () => {
    const res = await request(app).post('/api/ai/address-compare').send({ claimId: '2026-093' })
    expect(res.status).toBe(200)
    expect(res.body.overallVerdict).toBe('ADDRESSES_CONSISTENT')
  })

  it('comparisons array contains MISMATCH entry for 2026-108', async () => {
    const res = await request(app).post('/api/ai/address-compare').send({ claimId: '2026-108' })
    const mismatches = res.body.comparisons.filter(c => c.result === 'MISMATCH')
    expect(mismatches.length).toBeGreaterThan(0)
  })

  it('response includes recommendedActions array', async () => {
    const res = await request(app).post('/api/ai/address-compare').send({ claimId: '2026-108' })
    expect(Array.isArray(res.body.recommendedActions)).toBe(true)
    expect(res.body.recommendedActions.length).toBeGreaterThan(0)
  })
})

describe('POST /api/ai/fraud-vector', () => {
  it('returns 400 when claimId is missing', async () => {
    const res = await request(app).post('/api/ai/fraud-vector').send({})
    expect(res.status).toBe(400)
  })

  it('returns HIGH + SIU_REFERRAL for 2026-102', async () => {
    const res = await request(app).post('/api/ai/fraud-vector').send({ claimId: '2026-102' })
    expect(res.status).toBe(200)
    expect(res.body.overallFraudRisk).toBe('HIGH')
    expect(res.body.recommendation).toBe('SIU_REFERRAL')
    expect(res.body.confidenceScore).toBeGreaterThan(70)
  })

  it('returns LOW + APPROVE for 2026-093', async () => {
    const res = await request(app).post('/api/ai/fraud-vector').send({ claimId: '2026-093' })
    expect(res.status).toBe(200)
    expect(res.body.overallFraudRisk).toBe('LOW')
    expect(res.body.recommendation).toBe('APPROVE')
    expect(res.body.topRisks).toHaveLength(0)
  })

  it('returns MEDIUM + FURTHER_INVESTIGATION for 2026-108', async () => {
    const res = await request(app).post('/api/ai/fraud-vector').send({ claimId: '2026-108' })
    expect(res.status).toBe(200)
    expect(res.body.overallFraudRisk).toBe('MEDIUM')
    expect(res.body.recommendation).toBe('FURTHER_INVESTIGATION')
  })

  it('returns exactly 6 fraud vectors (A-F)', async () => {
    const res = await request(app).post('/api/ai/fraud-vector').send({ claimId: '2026-102' })
    expect(res.body.vectors).toHaveLength(6)
    expect(res.body.vectors.map(v => v.vector)).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
  })

  it('each vector has verdict, finding, weight', async () => {
    const res = await request(app).post('/api/ai/fraud-vector').send({ claimId: '2026-102' })
    res.body.vectors.forEach(v => {
      expect(v).toHaveProperty('verdict')
      expect(v).toHaveProperty('finding')
      expect(v).toHaveProperty('weight')
    })
  })

  it('returns executiveSummary and settlementGuidance', async () => {
    const res = await request(app).post('/api/ai/fraud-vector').send({ claimId: '2026-093' })
    expect(res.body.executiveSummary).toBeTruthy()
    expect(res.body.settlementGuidance).toBeTruthy()
  })

  it('2026-093 has mitigating factors including NWS confirmation', async () => {
    const res = await request(app).post('/api/ai/fraud-vector').send({ claimId: '2026-093' })
    expect(res.body.mitigatingFactors.length).toBeGreaterThan(0)
  })
})
