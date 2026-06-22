import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import type { Shelf } from '../types/shelf';

const PAGE_SIZE = 20;

interface ShelfFormData {
  shelf_code: string;
  rack: number | '';
  capacity: number | '';
}

const emptyForm: ShelfFormData = { shelf_code: '', rack: '', capacity: '' };

export default function Shelves() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingShelf, setEditingShelf] = useState<Shelf | null>(null);
  const [form, setForm] = useState<ShelfFormData>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/warehouses/shelves/', { params: { search, page } });
      setShelves(res.data.results);
      setCount(res.data.count);
    } catch {
      setError('Failed to load shelves.');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(count / PAGE_SIZE);
  const usagePct = (s: Shelf) =>
    s.capacity > 0 ? Math.round((s.occupied_capacity / s.capacity) * 100) : 0;

  function openAdd() {
    setEditingShelf(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  }

  function openEdit(s: Shelf) {
    setEditingShelf(s);
    setForm({ shelf_code: s.shelf_code, rack: s.rack, capacity: s.capacity });
    setFormError('');
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.shelf_code.trim()) { setFormError('Shelf code is required.'); return; }
    if (form.rack === '') { setFormError('Rack ID is required.'); return; }
    if (form.capacity === '' || Number(form.capacity) < 0) { setFormError('Valid capacity is required.'); return; }

    setSaving(true);
    setFormError('');
    try {
      const payload = { shelf_code: form.shelf_code.trim(), rack: Number(form.rack), capacity: Number(form.capacity) };
      if (editingShelf) {
        await apiClient.put(`/warehouses/shelves/${editingShelf.id}/`, payload);
      } else {
        await apiClient.post('/warehouses/shelves/', payload);
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      const detail = err?.response?.data;
      setFormError(typeof detail === 'string' ? detail : JSON.stringify(detail) || 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this shelf? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/warehouses/shelves/${id}/`);
      load();
    } catch {
      alert('Delete failed. The shelf may be in use.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Shelves</h1>
        {canEdit && (
          <button
            onClick={openAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            + Add Shelf
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search shelves..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        className="border rounded px-3 py-2 mb-4 w-full max-w-sm"
      />

      {isLoading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Shelf Code</th>
                <th className="px-4 py-2 text-left">Rack ID</th>
                <th className="px-4 py-2 text-left">Capacity</th>
                <th className="px-4 py-2 text-left">Occupied</th>
                <th className="px-4 py-2 text-left">Usage</th>
                {canEdit && <th className="px-4 py-2 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {shelves.length === 0 ? (
                <tr><td colSpan={canEdit ? 7 : 6} className="px-4 py-4 text-center text-gray-400">No shelves found.</td></tr>
              ) : shelves.map(s => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{s.id}</td>
                  <td className="px-4 py-2 font-medium">{s.shelf_code}</td>
                  <td className="px-4 py-2">{s.rack}</td>
                  <td className="px-4 py-2">{s.capacity}</td>
                  <td className="px-4 py-2">{s.occupied_capacity}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${usagePct(s) >= 90 ? 'bg-red-500' : usagePct(s) >= 60 ? 'bg-yellow-400' : 'bg-green-500'}`}
                          style={{ width: `${usagePct(s)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{usagePct(s)}%</span>
                    </div>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => openEdit(s)}
                        className="text-blue-600 hover:underline text-xs"
                      >Edit</button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        className="text-red-500 hover:underline text-xs disabled:opacity-40"
                      >{deletingId === s.id ? '...' : 'Delete'}</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
          <span className="px-3 py-1">Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">{editingShelf ? 'Edit Shelf' : 'Add Shelf'}</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Shelf Code *</label>
                <input
                  type="text"
                  value={form.shelf_code}
                  onChange={e => setForm(f => ({ ...f, shelf_code: e.target.value }))}
                  className="border rounded px-3 py-2 w-full text-sm"
                  placeholder="e.g. SH-A1-01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rack ID *</label>
                <input
                  type="number"
                  value={form.rack}
                  onChange={e => setForm(f => ({ ...f, rack: e.target.value === '' ? '' : Number(e.target.value) }))}
                  className="border rounded px-3 py-2 w-full text-sm"
                  placeholder="Rack ID number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Capacity *</label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={e => setForm(f => ({ ...f, capacity: e.target.value === '' ? '' : Number(e.target.value) }))}
                  className="border rounded px-3 py-2 w-full text-sm"
                  placeholder="Max units"
                />
              </div>
            </div>

            {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded text-sm hover:bg-gray-50"
              >Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}