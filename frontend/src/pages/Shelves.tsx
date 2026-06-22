import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getShelves } from '../api/shelves';
import type { Shelf } from '../types/shelf';

const PAGE_SIZE = 20;

export default function Shelves() {
  const { user } = useAuth();

  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getShelves({ search, page });
      setShelves(data.results);
      setCount(data.count);
    } catch {
      setError('Failed to load shelves.');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(count / PAGE_SIZE) || 1;
  const usagePct = (s: Shelf) =>
    s.capacity > 0 ? Math.round((s.occupied_capacity / s.capacity) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Shelves</h1>
      </div>

      <input
        type="text"
        placeholder="Search shelves..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-md mb-4 px-3 py-2 rounded bg-slate-800 text-white border border-slate-600 focus:outline-none focus:border-emerald-400"
      />

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Shelf Code</th>
              <th className="text-left px-4 py-3">Rack ID</th>
              <th className="text-left px-4 py-3">Capacity</th>
              <th className="text-left px-4 py-3">Occupied</th>
              <th className="text-left px-4 py-3">Usage</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-6 text-slate-400">Loading...</td></tr>
            ) : shelves.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6 text-slate-400">No shelves found.</td></tr>
            ) : shelves.map(s => (
              <tr key={s.id} className="border-t border-slate-700 hover:bg-slate-800/50">
                <td className="px-4 py-3">{s.id}</td>
                <td className="px-4 py-3 font-medium">{s.shelf_code}</td>
                <td className="px-4 py-3">{s.rack}</td>
                <td className="px-4 py-3">{s.capacity}</td>
                <td className="px-4 py-3">{s.occupied_capacity}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${usagePct(s) >= 90 ? 'bg-red-500' : usagePct(s) >= 60 ? 'bg-yellow-400' : 'bg-emerald-500'}`}
                        style={{ width: `${usagePct(s)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{usagePct(s)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-slate-300">
        <span>Page {page} of {totalPages} ({count} total)</span>
        <div className="space-x-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40">Previous</button>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
