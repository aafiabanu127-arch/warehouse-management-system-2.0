import { useState, useEffect, type FormEvent } from 'react';
import type { StockMovement, MovementType } from '../types/stockMovement';
import type { Product } from '../types/product';
import { getProducts } from '../api/products';

interface StockMovementFormModalProps {
  movement: StockMovement | null;
  onClose: () => void;
  onSubmit: (data: Partial<StockMovement>) => Promise<void>;
}

export default function StockMovementFormModal({ movement, onClose, onSubmit }: StockMovementFormModalProps) {
  const [product, setProduct] = useState<number | ''>('');
  const [quantity, setQuantity] = useState(0);
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [notes, setNotes] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getProducts().then((data) => setProducts(data.results)).catch(() => {});
  }, []);

  useEffect(() => {
    if (movement) {
      setProduct(movement.product);
      setQuantity(movement.quantity);
      setMovementType(movement.movement_type);
      setNotes(movement.notes);
    }
  }, [movement]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (product === '') {
      setError('Please select a product.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({ product: product as number, quantity, movement_type: movementType, notes });
    } catch {
      setError('Failed to save stock movement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          {movement ? 'Edit Stock Movement' : 'Add Stock Movement'}
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
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Movement Type</label>
            <select value={movementType} onChange={(e) => setMovementType(e.target.value as MovementType)} className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-emerald-400">
              <option value="IN">Stock In</option>
              <option value="OUT">Stock Out</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Quantity</label>
            <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-emerald-400" required />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-emerald-400" />
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