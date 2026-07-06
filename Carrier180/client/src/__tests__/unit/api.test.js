import { vi, describe, it, expect, beforeEach } from 'vitest'
import { claimsApi, stellaApi, aiApi, crmApi, erpApi, sorApi } from '../../services/api.js'

const mockFetch = vi.fn()
global.fetch = mockFetch

function ok(data) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve(data) })
}
function fail(status) {
  return Promise.resolve({ ok: false, status })
}

beforeEach(() => mockFetch.mockReset())

// ─── claimsApi ────────────────────────────────────────────────────────────────

describe('claimsApi.list()', () => {
  it('calls /api/claims with no params', async () => {
    mockFetch.mockReturnValueOnce(ok({ claims: [], total: 0 }))
    await claimsApi.list()
    expect(mockFetch).toHaveBeenCalledWith('/api/claims')
  })

  it('appends search param', async () => {
    mockFetch.mockReturnValueOnce(ok({ claims: [], total: 0 }))
    await claimsApi.list({ search: 'john' })
    expect(mockFetch).toHaveBeenCalledWith('/api/claims?search=john')
  })

  it('appends multiple params', async () => {
    mockFetch.mockReturnValueOnce(ok({ claims: [], total: 0 }))
    await claimsApi.list({ search: 'mary', status: 'New', risk: 'High' })
    const url = mockFetch.mock.calls[0][0]
    expect(url).toContain('search=mary')
    expect(url).toContain('status=New')
    expect(url).toContain('risk=High')
  })

  it('returns claims array', async () => {
    const data = { claims: [{ id: '2026-108' }], total: 1 }
    mockFetch.mockReturnValueOnce(ok(data))
    const result = await claimsApi.list()
    expect(result.claims).toHaveLength(1)
    expect(result.total).toBe(1)
  })
})

describe('claimsApi.get()', () => {
  it('fetches /api/claims/:id', async () => {
    mockFetch.mockReturnValueOnce(ok({ id: '2026-108', insuredName: 'John Smith' }))
    const result = await claimsApi.get('2026-108')
    expect(mockFetch).toHaveBeenCalledWith('/api/claims/2026-108')
    expect(result.insuredName).toBe('John Smith')
  })

  it('throws on 404', async () => {
    mockFetch.mockReturnValueOnce(fail(404))
    await expect(claimsApi.get('NONEXISTENT')).rejects.toThrow('404')
  })
})

describe('claimsApi.stats()', () => {
  it('fetches /api/claims/stats', async () => {
    mockFetch.mockReturnValueOnce(ok({ newClaims: 1, highFraudRisk: 1 }))
    await claimsApi.stats()
    expect(mockFetch).toHaveBeenCalledWith('/api/claims/stats')
  })
})

describe('claimsApi.create()', () => {
  it('POSTs to /api/claims with body', async () => {
    const data = { insuredName: 'Test', policyNumber: '2024-001' }
    mockFetch.mockReturnValueOnce(ok({ id: '2026-999', ...data }))
    const result = await claimsApi.create(data)
    expect(mockFetch).toHaveBeenCalledWith('/api/claims', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }))
    expect(result.id).toBe('2026-999')
  })

  it('throws on 500', async () => {
    mockFetch.mockReturnValueOnce(fail(500))
    await expect(claimsApi.create({})).rejects.toThrow('500')
  })
})

describe('claimsApi.updateStatus()', () => {
  it('PATCHes /api/claims/:id/status', async () => {
    mockFetch.mockReturnValueOnce(ok({ id: '2026-108', status: 'Closed' }))
    await claimsApi.updateStatus('2026-108', { status: 'Closed' })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/claims/2026-108/status',
      expect.objectContaining({ method: 'PATCH' })
    )
  })
})

// ─── stellaApi ────────────────────────────────────────────────────────────────

describe('stellaApi.chat()', () => {
  it('POSTs message, context, and history', async () => {
    mockFetch.mockReturnValueOnce(ok({ reply: 'Hello from Stella' }))
    const ctx = { page: 'dashboard', claimId: null, step: null }
    const history = [{ role: 'user', text: 'hi' }]
    const result = await stellaApi.chat('What claims need attention?', ctx, history)
    const [url, opts] = mockFetch.mock.calls[0]
    const body = JSON.parse(opts.body)
    expect(url).toBe('/api/stella/chat')
    expect(body.message).toBe('What claims need attention?')
    expect(body.context).toEqual(ctx)
    expect(body.history).toEqual(history)
    expect(result.reply).toBe('Hello from Stella')
  })

  it('defaults history to empty array', async () => {
    mockFetch.mockReturnValueOnce(ok({ reply: 'Hi' }))
    await stellaApi.chat('hi', { page: 'dashboard' })
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.history).toEqual([])
  })
})

// ─── aiApi ────────────────────────────────────────────────────────────────────

describe('aiApi.photoReview()', () => {
  it('POSTs { claimId } to /api/ai/photo-review', async () => {
    mockFetch.mockReturnValueOnce(ok({ overallConsistency: 'CONSISTENT' }))
    const result = await aiApi.photoReview('2026-108')
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toBe('/api/ai/photo-review')
    expect(JSON.parse(opts.body)).toEqual({ claimId: '2026-108' })
    expect(result.overallConsistency).toBe('CONSISTENT')
  })
})

describe('aiApi.addressCompare()', () => {
  it('POSTs { claimId } to /api/ai/address-compare', async () => {
    mockFetch.mockReturnValueOnce(ok({ overallVerdict: 'SIGNIFICANT_MISMATCH' }))
    await aiApi.addressCompare('2026-108')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/ai/address-compare')
  })
})

describe('aiApi.fraudVector()', () => {
  it('POSTs { claimId } to /api/ai/fraud-vector', async () => {
    mockFetch.mockReturnValueOnce(ok({ overallFraudRisk: 'LOW' }))
    await aiApi.fraudVector('2026-093')
    expect(mockFetch.mock.calls[0][0]).toBe('/api/ai/fraud-vector')
  })
})

// ─── crmApi ───────────────────────────────────────────────────────────────────

describe('crmApi.getCustomer()', () => {
  it('GETs /api/crm/customers/:id', async () => {
    mockFetch.mockReturnValueOnce(ok({ id: 'CUST-001', firstName: 'John' }))
    const result = await crmApi.getCustomer('CUST-001')
    expect(mockFetch).toHaveBeenCalledWith('/api/crm/customers/CUST-001')
    expect(result.firstName).toBe('John')
  })
})

describe('crmApi.getHistory()', () => {
  it('GETs /api/crm/customers/:id/history', async () => {
    mockFetch.mockReturnValueOnce(ok({ interactions: [] }))
    await crmApi.getHistory('CUST-002')
    expect(mockFetch).toHaveBeenCalledWith('/api/crm/customers/CUST-002/history')
  })
})

// ─── erpApi ───────────────────────────────────────────────────────────────────

describe('erpApi.getInvoices()', () => {
  it('GETs /api/erp/invoices/:claimId', async () => {
    mockFetch.mockReturnValueOnce(ok([]))
    await erpApi.getInvoices('2026-108')
    expect(mockFetch).toHaveBeenCalledWith('/api/erp/invoices/2026-108')
  })
})

describe('erpApi.getVendors()', () => {
  it('GETs /api/erp/vendors with no type', async () => {
    mockFetch.mockReturnValueOnce(ok([]))
    await erpApi.getVendors()
    expect(mockFetch).toHaveBeenCalledWith('/api/erp/vendors')
  })

  it('appends type query param when provided', async () => {
    mockFetch.mockReturnValueOnce(ok([]))
    await erpApi.getVendors('plumbing')
    expect(mockFetch).toHaveBeenCalledWith('/api/erp/vendors?type=plumbing')
  })
})

// ─── sorApi ───────────────────────────────────────────────────────────────────

describe('sorApi.getPolicy()', () => {
  it('GETs /api/sor/policies/:policyNumber', async () => {
    mockFetch.mockReturnValueOnce(ok({ policyNumber: '2024-001' }))
    await sorApi.getPolicy('2024-001')
    expect(mockFetch).toHaveBeenCalledWith('/api/sor/policies/2024-001')
  })
})

describe('sorApi.getClaimHistory()', () => {
  it('GETs /api/sor/claims/history/:policyNumber', async () => {
    mockFetch.mockReturnValueOnce(ok({ claims: [] }))
    await sorApi.getClaimHistory('2024-001')
    expect(mockFetch).toHaveBeenCalledWith('/api/sor/claims/history/2024-001')
  })
})
