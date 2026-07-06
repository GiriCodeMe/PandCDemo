import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ReportsPage from '../../pages/ReportsPage.jsx'

const mockUpdateContext = vi.fn()

vi.mock('../../context/StellaContext.jsx', () => ({
  useStella: () => ({
    updateContext: mockUpdateContext,
    isOpen: false,
    toggle: vi.fn(),
    messages: [],
    addMessage: vi.fn(),
    clearMessages: vi.fn(),
  }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ReportsPage />
    </MemoryRouter>
  )
}

beforeEach(() => mockUpdateContext.mockClear())

describe('ReportsPage', () => {
  // ── title & subtitle ──────────────────────────────────────────────────────
  it('renders the page title', () => {
    renderPage()
    expect(screen.getByText('Claims Analytics & Reports')).toBeInTheDocument()
  })

  it('renders the subtitle', () => {
    renderPage()
    expect(screen.getByText(/YTD 2026/i)).toBeInTheDocument()
  })

  // ── KPI cards ─────────────────────────────────────────────────────────────
  it('renders all 5 KPI labels', () => {
    renderPage()
    expect(screen.getByText('Total Active Claims')).toBeInTheDocument()
    expect(screen.getByText('Avg Cycle Time')).toBeInTheDocument()
    // "Total Exposure" appears in both KPI card and regional table header
    expect(screen.getAllByText('Total Exposure')[0]).toBeInTheDocument()
    expect(screen.getByText('SIU Referrals YTD')).toBeInTheDocument()
    expect(screen.getByText('Settled This Month')).toBeInTheDocument()
  })

  it('renders KPI values', () => {
    renderPage()
    expect(screen.getByText('121')).toBeInTheDocument()
    expect(screen.getByText('14.2 days')).toBeInTheDocument()
    expect(screen.getByText('$4.8M')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
  })

  // ── charts ────────────────────────────────────────────────────────────────
  it('renders peril chart labels', () => {
    renderPage()
    expect(screen.getByText('Water / Plumbing')).toBeInTheDocument()
    expect(screen.getByText('Fire / Smoke')).toBeInTheDocument()
    expect(screen.getByText('Wind / Hail / Roof')).toBeInTheDocument()
  })

  it('renders fraud distribution labels', () => {
    renderPage()
    expect(screen.getByText('Low Risk')).toBeInTheDocument()
    expect(screen.getByText('Medium Risk')).toBeInTheDocument()
    expect(screen.getByText('High Risk')).toBeInTheDocument()
  })

  it('renders monthly settlement months', () => {
    renderPage()
    expect(screen.getByText('Jan')).toBeInTheDocument()
    expect(screen.getByText('Jun')).toBeInTheDocument()
  })

  // ── regional table ────────────────────────────────────────────────────────
  it('renders regional breakdown section', () => {
    renderPage()
    expect(screen.getByText('Regional Performance Breakdown')).toBeInTheDocument()
    expect(screen.getByText('South Florida (Miami)')).toBeInTheDocument()
    expect(screen.getByText('Gulf Coast (Houston)')).toBeInTheDocument()
  })

  // ── action items ──────────────────────────────────────────────────────────
  it('renders open action items section', () => {
    renderPage()
    expect(screen.getByText(/Open Action Items/i)).toBeInTheDocument()
  })

  it('renders all 3 insured names in action items', () => {
    const { container } = renderPage()
    // Names are embedded inside mixed nodes — use container.textContent
    expect(container.textContent).toContain('Mary Johnson')
    expect(container.textContent).toContain('John Smith')
    expect(container.textContent).toContain('Robert Davis')
  })

  it('Robert Davis appears (not Gopi Reddy)', () => {
    const { container } = renderPage()
    expect(container.textContent).not.toContain('Gopi Reddy')
    expect(container.textContent).toContain('Robert Davis')
  })

  it('renders HIGH, MEDIUM, LOW priority badges', () => {
    renderPage()
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText('MEDIUM')).toBeInTheDocument()
    expect(screen.getByText('LOW')).toBeInTheDocument()
  })

  // ── export buttons ────────────────────────────────────────────────────────
  it('renders Export PDF and Export CSV buttons', () => {
    renderPage()
    expect(screen.getByText('Export PDF')).toBeInTheDocument()
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })

  // ── Stella context ────────────────────────────────────────────────────────
  it('calls updateContext with reports page context on mount', () => {
    renderPage()
    expect(mockUpdateContext).toHaveBeenCalledWith({
      page: 'reports',
      claimId: null,
      step: null,
    })
  })
})
