const { photoReview, addressCompare, fraudVector } = require('../../services/aiFactory')
const mockClaims = require('../../data/mockClaims')

const claim108 = mockClaims.find(c => c.id === '2026-108')
const claim102 = mockClaims.find(c => c.id === '2026-102')
const claim093 = mockClaims.find(c => c.id === '2026-093')

// No GEMINI_API_KEY in test env — all functions use simulated responses

describe('photoReview()', () => {
  it('returns valid shape for 2026-108', async () => {
    const r = await photoReview(claim108)
    expect(r).toHaveProperty('overallConsistency')
    expect(r).toHaveProperty('damageSeverity')
    expect(r).toHaveProperty('damageZones')
    expect(r).toHaveProperty('fraudIndicators')
    expect(r).toHaveProperty('structuralConcerns')
    expect(r).toHaveProperty('estimateValidation')
    expect(r).toHaveProperty('nextActions')
  })

  it('2026-108 water damage: CONSISTENT, HIGH severity', async () => {
    const r = await photoReview(claim108)
    expect(r.overallConsistency).toBe('CONSISTENT')
    expect(r.damageSeverity).toBe('HIGH')
  })

  it('2026-108 has invoice address fraud indicator', async () => {
    const r = await photoReview(claim108)
    expect(r.fraudIndicators.length).toBeGreaterThan(0)
    const indicator = r.fraudIndicators[0].indicator.toLowerCase()
    expect(indicator).toMatch(/invoice|address|commerce/i)
  })

  it('2026-102 fire damage: CRITICAL severity', async () => {
    const r = await photoReview(claim102)
    expect(r.damageSeverity).toBe('CRITICAL')
    expect(r.estimateValidation).toBe('INSUFFICIENT_EVIDENCE')
  })

  it('2026-093 roof damage: zero fraud indicators', async () => {
    const r = await photoReview(claim093)
    expect(r.fraudIndicators).toHaveLength(0)
    expect(r.estimateValidation).toBe('SUPPORTS_CLAIM')
  })

  it('returns UNCERTAIN fallback for unknown claim id', async () => {
    const r = await photoReview({ id: 'UNKNOWN', causeOfLoss: 'test', fraudAnalysis: {} })
    expect(r.overallConsistency).toBe('UNCERTAIN')
    expect(r.damageSeverity).toBe('UNKNOWN')
  })
})

describe('addressCompare()', () => {
  it('returns valid shape for 2026-108', async () => {
    const r = await addressCompare(claim108)
    expect(r).toHaveProperty('overallVerdict')
    expect(r).toHaveProperty('riskLevel')
    expect(r).toHaveProperty('summary')
    expect(r).toHaveProperty('comparisons')
    expect(r).toHaveProperty('fraudConcerns')
    expect(r).toHaveProperty('recommendedActions')
  })

  it('2026-108: SIGNIFICANT_MISMATCH, MEDIUM risk', async () => {
    const r = await addressCompare(claim108)
    expect(r.overallVerdict).toBe('SIGNIFICANT_MISMATCH')
    expect(r.riskLevel).toBe('MEDIUM')
  })

  it('2026-108: has MISMATCH comparison for invoice address', async () => {
    const r = await addressCompare(claim108)
    const mismatch = r.comparisons.find(c => c.result === 'MISMATCH')
    expect(mismatch).toBeDefined()
    expect(mismatch.source).toMatch(/invoice/i)
  })

  it('2026-108: has fraud concerns and recommended actions', async () => {
    const r = await addressCompare(claim108)
    expect(r.fraudConcerns.length).toBeGreaterThan(0)
    expect(r.recommendedActions.length).toBeGreaterThan(0)
  })

  it('2026-102: ADDRESSES_CONSISTENT, zero fraud concerns', async () => {
    const r = await addressCompare(claim102)
    expect(r.overallVerdict).toBe('ADDRESSES_CONSISTENT')
    expect(r.riskLevel).toBe('LOW')
    expect(r.fraudConcerns).toHaveLength(0)
  })

  it('2026-093: ADDRESSES_CONSISTENT', async () => {
    const r = await addressCompare(claim093)
    expect(r.overallVerdict).toBe('ADDRESSES_CONSISTENT')
  })
})

describe('fraudVector()', () => {
  it('returns valid shape for 2026-102', async () => {
    const r = await fraudVector(claim102)
    expect(r).toHaveProperty('overallFraudRisk')
    expect(r).toHaveProperty('confidenceScore')
    expect(r).toHaveProperty('recommendation')
    expect(r).toHaveProperty('executiveSummary')
    expect(r).toHaveProperty('vectors')
    expect(r).toHaveProperty('topRisks')
    expect(r).toHaveProperty('mitigatingFactors')
    expect(r).toHaveProperty('settlementGuidance')
  })

  it('2026-102: HIGH risk, SIU_REFERRAL, confidence > 70', async () => {
    const r = await fraudVector(claim102)
    expect(r.overallFraudRisk).toBe('HIGH')
    expect(r.recommendation).toBe('SIU_REFERRAL')
    expect(r.confidenceScore).toBeGreaterThan(70)
  })

  it('2026-102: has 3 top risks', async () => {
    const r = await fraudVector(claim102)
    expect(r.topRisks).toHaveLength(3)
  })

  it('2026-093: LOW risk, APPROVE, confidence >= 90', async () => {
    const r = await fraudVector(claim093)
    expect(r.overallFraudRisk).toBe('LOW')
    expect(r.recommendation).toBe('APPROVE')
    expect(r.confidenceScore).toBeGreaterThanOrEqual(90)
    expect(r.topRisks).toHaveLength(0)
  })

  it('2026-108: MEDIUM risk, FURTHER_INVESTIGATION', async () => {
    const r = await fraudVector(claim108)
    expect(r.overallFraudRisk).toBe('MEDIUM')
    expect(r.recommendation).toBe('FURTHER_INVESTIGATION')
  })

  it('all 6 vectors present (A through F)', async () => {
    const r = await fraudVector(claim102)
    expect(r.vectors).toHaveLength(6)
    expect(r.vectors.map(v => v.vector)).toEqual(['A', 'B', 'C', 'D', 'E', 'F'])
  })

  it('each vector has name, verdict, weight, finding', async () => {
    const r = await fraudVector(claim093)
    r.vectors.forEach(v => {
      expect(v).toHaveProperty('vector')
      expect(v).toHaveProperty('name')
      expect(v).toHaveProperty('verdict')
      expect(v).toHaveProperty('weight')
      expect(v).toHaveProperty('finding')
    })
  })

  it('2026-093: all vectors PASS', async () => {
    const r = await fraudVector(claim093)
    r.vectors.forEach(v => expect(v.verdict).toBe('PASS'))
  })

  it('2026-102: vector B (Financial) verdict is FAIL', async () => {
    const r = await fraudVector(claim102)
    const vectorB = r.vectors.find(v => v.vector === 'B')
    expect(vectorB.verdict).toBe('FAIL')
  })
})
