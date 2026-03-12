import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../../pages/Dashboard';

describe('Dashboard', () => {
  it('should render dashboard title', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render welcome message', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Your application is running/)).toBeInTheDocument();
  });
});
