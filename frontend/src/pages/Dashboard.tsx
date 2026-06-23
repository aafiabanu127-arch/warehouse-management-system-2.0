import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardSummary } from '../api/dashboard';
import type { DashboardSummary } from '../types/dashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const CARDS = [
  { gradient: 'from-cyan-500/20 to-teal-900/20', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20', valueColor: 'text-cyan-400' },
  { gradient: 'from-blue-500/20 to-cyan-900/20', border: 'border-blue-500/30', glow: 'shadow-blue-500/20', valueColor: 'text-blue-400' },
  { gradient: 'from-teal-500/20 to-green-900/20', border: 'border-teal-500/30', glow: 'shadow-teal-500/20', valueColor: 'text-teal-400' },
  { gradient: 'from-yellow-500/20 to-orange-900/20', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/20', valueColor: 'text-yellow-400' },
];

function StatCard({ label, value, gradient, border, glow, valueColor }: {
  label: string; value: string | number;
  gradient: string; border: string; glow: string; valueColor: string;
}) {
  return (
    <div className={`relative bg-gradient-to-br ${gradient} backdrop-blur-md rounded-2xl border ${border} p-6 overflow-hidden shadow-lg ${glow}`}>
      <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-cyan-400/5 blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <div className="relative z-10">
        <p className="text-sm font-medium tracking-widest uppercase text-slate-400 mb-3">{label}</p>
        <p className={`text-4xl font-bold ${valueColor} drop-shadow-lg`}>{value}</p>
      </div>
    </div>
  );
}



export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setIsLoading(false));
  }, []);

  const cards = data ? [
    { label: 'Total Warehouses',      value: data.total_warehouses },
    { label: 'Total Products',        value: data.total_products },
    { label: 'Total Inventory Units', value: data.total_inventory_quantity },
    { label: `Low Stock (< ${data.low_stock_threshold_used})`, value: data.low_stock_count },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Welcome, <span className="font-semibold text-cyan-400">{user?.username}</span>{' '}
          <span className="text-slate-500">({user?.role})</span>
        </p>
      </div>

      {isLoading && <p className="text-slate-400">Loading dashboard data...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((c, i) => (
              <StatCard key={i} label={c.label} value={c.value} {...CARDS[i]} />
            ))}
          </div>

          {/* Chart */}
          <div className="relative bg-black/60 backdrop-blur-md rounded-2xl border border-cyan-900/30 p-5 overflow-hidden shadow-lg shadow-cyan-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 to-black/0 rounded-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-cyan-400 rounded-full shadow-sm shadow-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Warehouse Utilization (%)</h2>
              </div>
              {data.warehouse_utilization.length === 0 ? (
                <p className="text-slate-400">No warehouse data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.warehouse_utilization}>
                    <defs>
                      <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0e7490" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000d0d',
                        border: '1px solid rgba(6,182,212,0.3)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="utilization_percent" fill="url(#cyanGrad)" radius={[6, 6, 0, 0]}>
                      {data.warehouse_utilization.map((_, i) => (
                        <Cell key={i} fill="url(#cyanGrad)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Stock Movements */}
          <div className="relative bg-black/60 backdrop-blur-md rounded-2xl border border-cyan-900/30 overflow-hidden shadow-lg shadow-cyan-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-950/10 to-black/0 rounded-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-cyan-900/30">
                <div className="w-1 h-5 bg-teal-400 rounded-full" />
                <h2 className="text-lg font-semibold text-white">Recent Stock Movements</h2>
              </div>
              {data.recent_movements.length === 0 ? (
                <p className="text-slate-400 px-5 py-6">No stock movements recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-cyan-600 text-xs uppercase">
                      <th className="text-left px-5 py-3">Product</th>
                      <th className="text-left px-5 py-3">Type</th>
                      <th className="text-left px-5 py-3">Quantity</th>
                      <th className="text-left px-5 py-3">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_movements.map((m, i) => (
                      <tr key={i} className="border-t border-cyan-900/20 hover:bg-cyan-950/20 transition">
                        <td className="px-5 py-3 text-white">{m.product__name}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            m.movement_type === 'IN'
                              ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                              : 'bg-red-400/10 text-red-400 border border-red-400/20'
                          }`}>
                            {m.movement_type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-300">{m.quantity}</td>
                        <td className="px-5 py-3 text-slate-500">{new Date(m.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}