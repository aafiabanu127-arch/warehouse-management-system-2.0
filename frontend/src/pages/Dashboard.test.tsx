import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { ThemeProvider } from '../context/ThemeContext';

vi.mock('../api/dashboard', () => ({
  getDashboardSummary: vi.fn().mockResolvedValue({
    total_products: 42,
    total_warehouses: 5,
    total_inventory_quantity: 1200,
    low_stock_count: 3,
    low_stock_threshold_used: 10,
    warehouse_utilization: [
      { name: 'Warehouse A', utilization_percent: 72 },
      { name: 'Warehouse B', utilization_percent: 58 },
    ],
    recent_movements: [
      { product__name: 'Widget A', movement_type: 'IN', quantity: 20, timestamp: '2026-07-01T10:00:00Z' },
      { product__name: 'Widget B', movement_type: 'OUT', quantity: 5, timestamp: '2026-07-02T10:00:00Z' },
    ],
  }),
}));

vi.mock('../context/AuthContext', () => ({
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
      <ThemeProvider>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </ThemeProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  it('displays KPI data from API', async () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </ThemeProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });
});
