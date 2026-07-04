import { useState, useEffect, type FormEvent } from 'react';
import type { InventoryItem } from '../types/inventory';
import type { Product } from '../types/product';
import type { Shelf } from '../types/shelf';

interface InventoryFormModalProps {
  item: InventoryItem | null;
  products: Product[];
  shelves: Shelf[];
  onClose: () => void;
  onSubmit: (data: Partial<InventoryItem>) => Promise<void>;
}

export default function InventoryFormModal({ item, products, shelves, onClose, onSubmit }: InventoryFormModalProps) {
  const [product, setProduct] = useState<number | ''>('');
  const [shelf, setShelf] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setProduct(item.product);
      setShelf(item.shelf);
      setQuantity(item.quantity);
    } else {
      setProduct('');
      setShelf('');
      setQuantity(0);
    }
  }, [item]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (product === '' || shelf === '') {
      setError('Please select both a product and a shelf.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ product: product as number, shelf: shelf as number, quantity });
    } catch {
      setError('Failed to save inventory record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          {item ? 'Edit Inventory Record' : 'Add Inventory Record'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Product</label>
            <select value={product} onChange={(e) => setProduct(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-emerald-400" required>
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
            {products.length === 0 && (
              <p className="text-yellow-400 text-xs mt-1">No products found. Please add a product first.</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Shelf</label>
            <select value={shelf} onChange={(e) => setShelf(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-emerald-400" required>
              <option value="">Select a shelf</option>
              {shelves.map((s) => (
                <option key={s.id} value={s.id}>{s.shelf_code}</option>
              ))}
            </select>
            {shelves.length === 0 && (
              <p className="text-yellow-400 text-xs mt-1">No shelves found. Please add a shelf first.</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Quantity</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-emerald-400" required />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded transition">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-2 rounded transition">
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}