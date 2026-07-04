import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

vi.mock('../api/dashboard', () => ({
  getDashboardSummary: vi.fn().mockResolvedValue({
    total_products: 42,
    total_warehouses: 5,
    low_stock_count: 3,
    total_inventory_value: 150000,
  }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'admin', role: 'ADMIN' as const },
  }),
}));

describe('Dashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard heading', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  it('displays KPI data from API', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });
});