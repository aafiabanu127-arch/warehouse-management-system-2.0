import { useState, useEffect, type FormEvent } from 'react';
import type { Category } from '../types/category';

interface CategoryFormModalProps {
  category: Category | null;
  onClose: () => void;
  onSubmit: (data: Partial<Category>) => Promise<void>;
}

export default function CategoryFormModal({ category, onClose, onSubmit }: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
    }
  }, [category]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({ name, description });
    } catch {
      setError('Failed to save category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          {category ? 'Edit Category' : 'Add Category'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="category-name" className="block text-sm text-slate-300 mb-1">Name</label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-emerald-400"
              required
            />
          </div>
          <div>
            <label htmlFor="category-description" className="block text-sm text-slate-300 mb-1">Description</label>
            <textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-emerald-400"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded transition">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-2 rounded transition">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}