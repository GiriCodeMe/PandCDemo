import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ClaimsTable from '../../components/dashboard/ClaimsTable.jsx'

vi.mock('../../services/api.js', () => ({
  claimsApi: {
    list: vi.fn(),
  },
}))

import { claimsApi } from '../../services/api.js'

const MOCK_CLAIMS = [
  {
    id: '2026-108',
    insuredName: 'John Smith',
    causeOfLoss: 'Water Damage',
    claimAmount: 50000,
    dateOfLoss: '2026-03-15',
    status: 'New',
    adjuster: 'Jane Doe',
    fraudRisk: 'Medium',
  },
  {
    id: '2026-102',
    insuredName: 'Mary Johnson',
    causeOfLoss: 'Fire / Smoke',
    claimAmount: 52800,
    dateOfLoss: '2026-03-10',
    status: 'Under Review',
    adjuster: 'Jane Doe',
    fraudRisk: 'High',
  },
  {
    id: '2026-093',
    insuredName: 'Robert Davis',
    causeOfLoss: 'Roof Damage',
    claimAmount: 18450,
    dateOfLoss: '2026-03-08',
    status: 'Under Review',
    adjuster: 'Jane Doe',
    fraudRisk: 'Low',
  },
]

function renderTable() {
  return render(
    <MemoryRouter>
      <ClaimsTable />
    </MemoryRouter>
  )
}

beforeEach(() => {
  claimsApi.list.mockResolvedValue({ claims: MOCK_CLAIMS, total: 3 })
})

describe('ClaimsTable', () => {
  it('shows loading state before data arrives', () => {
    claimsApi.list.mockImplementation(() => new Promise(() => {}))
    renderTable()
    expect(screen.getByText('Loading claims...')).toBeInTheDocument()
  })

  it('renders all 3 seed claims after load', async () => {
    renderTable()
    await waitFor(() => expect(screen.getByText('John Smith')).toBeInTheDocument())
    expect(screen.getByText('Mary Johnson')).toBeInTheDocument()
    expect(screen.getByText('Robert Davis')).toBeInTheDocument()
  })

  it('displays claim IDs', async () => {
    renderTable()
    await waitFor(() => screen.getByText('2026-108'))
    expect(screen.getByText('2026-102')).toBeInTheDocument()
    expect(screen.getByText('2026-093')).toBeInTheDocument()
  })

  it('shows claim amounts formatted', async () => {
    renderTable()
    await waitFor(() => screen.getByText('$50,000'))
    expect(screen.getByText('$52,800')).toBeInTheDocument()
    expect(screen.getByText('$18,450')).toBeInTheDocument()
  })

  it('shows "No claims found" when list is empty', async () => {
    claimsApi.list.mockResolvedValueOnce({ claims: [], total: 0 })
    renderTable()
    await waitFor(() => expect(screen.getByText('No claims found')).toBeInTheDocument())
  })

  it('shows count in footer', async () => {
    renderTable()
    await waitFor(() => screen.getByText('Showing 3 of 3 claims'))
  })

  it('calls list() again when search input changes', async () => {
    renderTable()
    await waitFor(() => screen.getByPlaceholderText(/search/i))
    const input = screen.getByPlaceholderText(/search/i)
    fireEvent.change(input, { target: { value: 'mary' } })
    await waitFor(() => {
      expect(claimsApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'mary' })
      )
    })
  })

  it('calls list() again when status filter changes', async () => {
    renderTable()
    await waitFor(() => screen.getByDisplayValue('Status: All'))
    fireEvent.change(screen.getByDisplayValue('Status: All'), { target: { value: 'New' } })
    await waitFor(() => {
      expect(claimsApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'New' })
      )
    })
  })

  it('calls list() again when risk filter changes', async () => {
    renderTable()
    await waitFor(() => screen.getByDisplayValue('Risk: All'))
    fireEvent.change(screen.getByDisplayValue('Risk: All'), { target: { value: 'High' } })
    await waitFor(() => {
      expect(claimsApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ risk: 'High' })
      )
    })
  })

  it('shows adjuster names', async () => {
    renderTable()
    await waitFor(() => screen.getAllByText('Jane Doe'))
    expect(screen.getAllByText('Jane Doe')).toHaveLength(3)
  })
})
