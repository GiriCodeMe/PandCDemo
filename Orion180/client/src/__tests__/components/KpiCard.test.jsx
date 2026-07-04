import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import KpiCard from '../../components/dashboard/KpiCard.jsx'

describe('KpiCard', () => {
  it('renders the value', () => {
    render(<KpiCard icon="📊" value="121" label="Total Active Claims" />)
    expect(screen.getByText('121')).toBeInTheDocument()
  })

  it('renders the label', () => {
    render(<KpiCard icon="📊" value="121" label="Total Active Claims" />)
    expect(screen.getByText('Total Active Claims')).toBeInTheDocument()
  })

  it('renders the icon', () => {
    render(<KpiCard icon="⚠" value="7" label="SIU Referrals" />)
    expect(screen.getByText('⚠')).toBeInTheDocument()
  })

  it('renders badge when provided', () => {
    render(<KpiCard icon="⚠" value="7" label="SIU" badge="High" badgeType="danger" />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('does not render badge element when badge prop is absent', () => {
    render(<KpiCard icon="📊" value="34" label="Settled" />)
    expect(screen.queryByText('High')).not.toBeInTheDocument()
    expect(screen.queryByText('Medium')).not.toBeInTheDocument()
  })

  it('renders numeric value as string', () => {
    render(<KpiCard icon="🕐" value="14.2 days" label="Avg Cycle Time" />)
    expect(screen.getByText('14.2 days')).toBeInTheDocument()
  })

  it('renders dollar value', () => {
    render(<KpiCard icon="💰" value="$4.8M" label="Total Exposure" />)
    expect(screen.getByText('$4.8M')).toBeInTheDocument()
  })
})
