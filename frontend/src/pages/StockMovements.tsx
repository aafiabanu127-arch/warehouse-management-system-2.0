import { useState, useEffect, useCallback } from 'react';
import { getStockMovements } from '../api/stockMovements';
import { getProducts } from '../api/products';
import type { StockMovement } from '../types/stockMovement';
import type { Product } from '../types/product';

const PAGE_SIZE = 20;

export default function StockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProducts().then((data) => setProducts(data.results)).catch(() => {});
  }, []);

  const productName = (id: number) => products.find((p) => p.id === id)?.name ?? `#${id}`;

  const loadMovements = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getStockMovements({ search, page });
      setMovements(data.results);
      setCount(data.count);
    } catch {
      setError('Failed to load stock movements.');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  const totalPages = Math.ceil(count / PAGE_SIZE) || 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stock Movements</h1>
      </div>

      <input
        type="text"
        placeholder="Search by product or notes..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-md mb-4 px-3 py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 focus:outline-none focus:border-emerald-400"
      />

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Quantity</th>
              <th className="text-left px-4 py-3">Timestamp</th>
              <th className="text-left px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-6 text-slate-500 dark:text-slate-400">Loading...</td></tr>
            ) : movements.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-slate-500 dark:text-slate-400">No stock movements found.</td></tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} className="border-t border-slate-200 dark:border-slate-700 hover:bg-slate-100/50 hover:dark:bg-slate-800/50">
                  <td className="px-4 py-3">{productName(m.product)}</td>
                  <td className="px-4 py-3">{m.movement_type}</td>
                  <td className="px-4 py-3">{m.quantity}</td>
                  <td className="px-4 py-3">{new Date(m.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">{m.notes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-slate-600 dark:text-slate-300">
        <span>Page {page} of {totalPages} ({count} total)</span>
        <div className="space-x-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 hover:dark:bg-slate-600 disabled:opacity-40">Previous</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 hover:dark:bg-slate-600 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}