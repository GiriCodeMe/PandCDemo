import React from 'react';
import { render, screen } from '@testing-library/react';
import Badge from '../components/ui/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge variant="default">Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies success styles', () => {
    const { container } = render(<Badge variant="success">OK</Badge>);
    expect(container.firstChild).toHaveClass('text-emerald-700');
  });

  it('applies error styles', () => {
    const { container } = render(<Badge variant="error">Error</Badge>);
    expect(container.firstChild).toHaveClass('text-red-700');
  });
});
