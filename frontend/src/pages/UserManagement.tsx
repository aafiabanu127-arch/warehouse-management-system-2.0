import { useEffect, useState } from 'react';
import apiClient from '../api/client';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  is_active: boolean;
}

const ROLES = ['ADMIN', 'MANAGER', 'SUPERVISOR', 'STAFF', 'PICKER', 'AUDITOR', 'VIEWER'];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editActive, setEditActive] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users/users/');
      setUsers(res.data.results ?? res.data);
    } catch {
      setError('Failed to load users. Admin access required.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const startEdit = (u: User) => {
    setEditingId(u.id);
    setEditRole(u.role);
    setEditActive(u.is_active);
  };

  const saveEdit = async (id: number) => {
    try {
      await apiClient.patch(`/users/users/${id}/`, { role: editRole, is_active: editActive });
      setEditingId(null);
      fetchUsers();
    } catch {
      alert('Failed to update user.');
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await apiClient.delete(`/users/users/${id}/`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      alert('Failed to delete user.');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">👥 User Management</h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left">Username</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {users.map(u => (
                <tr key={u.id} className="bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    {editingId === u.id ? (
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value)}
                        className="border rounded px-2 py-1 text-sm dark:bg-slate-700 dark:border-slate-600"
                      >
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{u.department || '—'}</td>
                  <td className="px-4 py-3">
                    {editingId === u.id ? (
                      <input
                        type="checkbox"
                        checked={editActive}
                        onChange={e => setEditActive(e.target.checked)}
                        className="w-4 h-4"
                      />
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {editingId === u.id ? (
                      <>
                        <button onClick={() => saveEdit(u.id)} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded transition">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded transition">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(u)} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition">Edit</button>
                        <button onClick={() => deleteUser(u.id)} className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}