import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryFormModal from './CategoryFormModal';

describe('CategoryFormModal', () => {
  it('renders "Add Category" heading when no category is passed', () => {
    render(<CategoryFormModal category={null} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByText('Add Category')).toBeInTheDocument();
  });

  it('renders "Edit Category" heading and pre-fills fields when editing', () => {
    const existing = { id: 1, name: 'Electronics', description: 'Gadgets and devices' };
    render(<CategoryFormModal category={existing} onClose={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByText('Edit Category')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Electronics')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Gadgets and devices')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', async () => {
    const onClose = vi.fn();
    render(<CategoryFormModal category={null} onClose={onClose} onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('requires a name before submitting (HTML5 required validation)', () => {
    render(<CategoryFormModal category={null} onClose={vi.fn()} onSubmit={vi.fn()} />);
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    expect(nameInput.required).toBe(true);
  });

  it('submits the entered name and description', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CategoryFormModal category={null} onClose={vi.fn()} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Name'), 'Furniture');
    await userEvent.type(screen.getByLabelText('Description'), 'Office and home furniture');
    await userEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Furniture',
        description: 'Office and home furniture',
      });
    });
  });

  it('shows "Saving..." and disables the button while submitting', async () => {
    let resolveSubmit: () => void = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => { resolveSubmit = resolve; }));

    render(<CategoryFormModal category={null} onClose={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Name'), 'Tools');
    await userEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('Saving...')).toBeDisabled();

    resolveSubmit();
    await waitFor(() => {
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  it('shows an error message if onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('network error'));
    render(<CategoryFormModal category={null} onClose={vi.fn()} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Name'), 'Broken');
    await userEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Failed to save category.')).toBeInTheDocument();
    });
  });
});