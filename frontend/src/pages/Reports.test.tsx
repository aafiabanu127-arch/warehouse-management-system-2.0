import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Reports from './Reports';

vi.mock('../api/reports', () => ({
  getReports: vi.fn().mockResolvedValue({
    results: [
      { id: 1, report_type: 'INVENTORY', status: 'COMPLETED', generated_by_username: 'admin' },
      { id: 2, report_type: 'STOCK',     status: 'PENDING',   generated_by_username: 'manager' },
    ],
    count: 2,
  }),
  generateReport: vi.fn().mockResolvedValue({ id: 3, status: 'PENDING' }),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { username: 'admin', role: 'ADMIN' },
  }),
}));

describe('Reports page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Reports heading', async () => {
    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/reports/i)).toBeInTheDocument();
    });
  });

  it('displays report entries from API', async () => {
    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Inventory Report')).toBeInTheDocument();
      expect(screen.getByText('Stock Movements')).toBeInTheDocument();
    });
  });

  it('shows report status', async () => {
    render(
      <MemoryRouter>
        <Reports />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText('PENDING')).toBeInTheDocument();
    });
  });
});
