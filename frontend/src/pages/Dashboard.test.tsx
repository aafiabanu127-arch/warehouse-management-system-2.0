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
    total_inventory_value: 15250.5,
    category_breakdown: [
      { category: 'Electronics', total_quantity: 800, total_value: 12000, product_count: 10 },
      { category: 'Hardware', total_quantity: 400, total_value: 3250.5, product_count: 6 },
    ],
    movement_trend: Array.from({ length: 14 }, (_, i) => ({
      date: `2026-06-${String(i + 1).padStart(2, '0')}`,
      in: i * 2,
      out: i,
      transfer: 0,
    })),
    top_products: [
      { name: 'Widget A', sku: 'WGT-A', quantity: 300 },
      { name: 'Widget B', sku: 'WGT-B', quantity: 220 },
    ],
    low_stock_items: [
      { name: 'Widget C', sku: 'WGT-C', quantity: 2, shelf_code: 'S-101' },
    ],
    pending_approvals: { transfers: 2, adjustments: 1, total: 3 },
    structure_counts: { zones: 4, racks: 12, shelves: 40, categories: 5 },
    capacity_overview: { total_capacity: 10000, available_capacity: 4000, used_capacity: 6000, utilization_percent: 60 },
    movement_totals_30d: { in: 500, out: 300, transfer: 20 },
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
