import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Inventory from './Inventory';

vi.mock('../api/inventory', () => ({
  getInventory: vi.fn().mockResolvedValue({
    results: [
      { id: 1, product_name: 'Widget A', quantity: 100, warehouse_name: 'Main Warehouse' },
      { id: 2, product_name: 'Widget B', quantity: 5,   warehouse_name: 'South Hub' },
    ],
    count: 2,
  }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'manager', role: 'MANAGER' },
  }),
}));

describe('Inventory page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Inventory heading', async () => {
    render(
      <MemoryRouter>
        <Inventory />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/inventory/i)).toBeInTheDocument();
    });
  });

  it('displays inventory items from API', async () => {
    render(
      <MemoryRouter>
        <Inventory />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
      expect(screen.getByText('Widget B')).toBeInTheDocument();
    });
  });

  it('shows low stock item in the list', async () => {
    render(
      <MemoryRouter>
        <Inventory />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Widget B')).toBeInTheDocument();
    });
  });
});