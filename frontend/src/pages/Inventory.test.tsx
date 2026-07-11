import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Inventory from './Inventory';

vi.mock('../api/inventory', () => ({
  getInventoryItems: vi.fn().mockResolvedValue({
    results: [
      { id: 1, product: 1, shelf: 1, quantity: 100 },
      { id: 2, product: 2, shelf: 1, quantity: 5 },
    ],
    count: 2,
  }),
  createInventoryItem: vi.fn(),
  updateInventoryItem: vi.fn(),
  deleteInventoryItem: vi.fn(),
}));

vi.mock('../api/products', () => ({
  getProducts: vi.fn().mockResolvedValue({
    results: [
      { id: 1, name: 'Widget A' },
      { id: 2, name: 'Widget B' },
    ],
  }),
}));

vi.mock('../api/shelves', () => ({
  getShelves: vi.fn().mockResolvedValue({
    results: [
      { id: 1, shelf_code: 'A1' },
    ],
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
      expect(screen.getByRole('heading', { name: /inventory/i })).toBeInTheDocument();
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
