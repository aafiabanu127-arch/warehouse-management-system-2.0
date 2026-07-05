import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { getDashboardSummary } from '../api/dashboard';
import type { DashboardSummary } from '../types/dashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

// Professional, restrained accent set — each stat keeps one semantic tone
// instead of a rainbow of neon gradients.
const CARDS = [
  { valueColor: 'text-slate-100', accent: 'bg-indigo-400' },
  { valueColor: 'text-slate-100', accent: 'bg-sky-400' },
  { valueColor: 'text-slate-100', accent: 'bg-slate-300' },
  { valueColor: 'text-amber-300', accent: 'bg-amber-400' },
];

function StatCard({ label, value, valueColor, accent }: {
  label: string; value: string | number; valueColor: string; accent: string;
}) {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden">
      {/* glass specular highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-1.5 h-1.5 rounded-full ${accent}`} />
          <p className="text-xs font-medium tracking-wider uppercase text-slate-400">{label}</p>
        </div>
        <p className={`text-3xl font-semibold tracking-tight ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

function InsightCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-xl font-semibold text-slate-100">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

interface QuickAction {
  to: string;
  title: string;
  description: string;
  show: boolean;
}

function QuickActionCard({ action }: { action: QuickAction }) {
  return (
    <Link
      to={action.to}
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-indigo-400/25 backdrop-blur-xl p-4 transition-colors block"
    >
      <p className="text-sm font-medium text-slate-100 group-hover:text-white">{action.title}</p>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.description}</p>
      <span className="inline-block mt-3 text-xs font-medium text-indigo-300 group-hover:text-indigo-200">
        Open →
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const perms = usePermissions();
  const location = useLocation();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    getDashboardSummary()
      .then(setData)
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if ((location.state as { accessDenied?: boolean } | null)?.accessDenied) {
      setDenied(true);
      const t = setTimeout(() => setDenied(false), 4000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  const cards = data ? [
    { label: 'Total Warehouses',      value: data.total_warehouses },
    { label: 'Total Products',        value: data.total_products },
    { label: 'Total Inventory Units', value: data.total_inventory_quantity },
    { label: `Low Stock (< ${data.low_stock_threshold_used})`, value: data.low_stock_count },
  ] : [];

  // Derived, at-a-glance detail computed from the same summary payload —
  // gives the dashboard more depth without needing new endpoints.
  const insights = useMemo(() => {
    if (!data) return null;

    const utilization = data.warehouse_utilization;
    const avgUtilization = utilization.length
      ? Math.round(utilization.reduce((sum, w) => sum + w.utilization_percent, 0) / utilization.length)
      : 0;
    const busiest = utilization.length
      ? utilization.reduce((a, b) => (a.utilization_percent >= b.utilization_percent ? a : b))
      : null;

    const movements = data.recent_movements;
    const stockIn = movements.filter(m => m.movement_type === 'IN').length;
    const stockOut = movements.filter(m => m.movement_type === 'OUT').length;
    const today = new Date().toDateString();
    const movementsToday = movements.filter(m => new Date(m.timestamp).toDateString() === today).length;

    return { avgUtilization, busiest, stockIn, stockOut, movementsToday };
  }, [data]);

  const quickActions: QuickAction[] = [
    {
      to: '/assistant',
      title: 'AI Assistant',
      description: 'Ask questions about stock levels, movements, or get help navigating the system.',
      show: true,
    },
    {
      to: '/stock-movements',
      title: 'Stock Movements',
      description: 'Log or review inbound and outbound inventory activity.',
      show: perms.level >= 6,
    },
    {
      to: '/analytics',
      title: 'Analytics',
      description: 'Deeper trends across warehouses, products, and turnover.',
      show: perms.canViewAnalytics,
    },
    {
      to: '/approvals',
      title: 'Approvals',
      description: 'Review pending requests waiting on your decision.',
      show: perms.canViewApprovals,
    },
    {
      to: '/reports',
      title: 'Reports',
      description: 'Generate and export warehouse performance reports.',
      show: perms.canViewReports,
    },
    {
      to: '/inventory',
      title: 'Inventory',
      description: 'Browse current stock across every warehouse.',
      show: perms.level >= 6,
    },
  ].filter(a => a.show);

  return (
    <div className="relative space-y-6">
      {/* Ambient liquid-glass background accents, sit behind all content */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-liquid-a absolute -top-24 left-[8%] w-[28rem] h-[28rem] rounded-full bg-indigo-500/10 blur-[110px]" />
        <div className="animate-liquid-b absolute top-1/3 right-[5%] w-[24rem] h-[24rem] rounded-full bg-sky-400/[0.07] blur-[110px]" />
      </div>

      {denied && (
        <div className="flex items-center justify-between rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 px-4 py-3 text-sm backdrop-blur-xl">
          <span>You do not have permission to access that page. Your role is <strong>{user?.role}</strong>.</span>
          <button onClick={() => setDenied(false)} className="ml-4 text-rose-300/80 hover:text-rose-200 font-medium">Dismiss</button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Welcome, <span className="font-medium text-slate-200">{user?.username}</span>{' '}
          <span className="text-slate-500">({user?.role})</span>
        </p>
      </div>

      {isLoading && <p className="text-slate-400 text-sm">Loading dashboard data...</p>}
      {error && <p className="text-rose-400 text-sm">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((c, i) => (
              <StatCard key={i} label={c.label} value={c.value} {...CARDS[i]} />
            ))}
          </div>

          {/* Insights — extra at-a-glance detail derived from the summary data */}
          {insights && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <InsightCard
                label="Avg. Utilization"
                value={data.warehouse_utilization.length ? `${insights.avgUtilization}%` : '—'}
                sub={insights.busiest ? `Busiest: ${insights.busiest.name}` : 'No warehouse data'}
              />
              <InsightCard
                label="Movements Today"
                value={String(insights.movementsToday)}
                sub="Based on recent activity"
              />
              <InsightCard
                label="Recent Stock In"
                value={String(insights.stockIn)}
                sub="Of last recorded movements"
              />
              <InsightCard
                label="Recent Stock Out"
                value={String(insights.stockOut)}
                sub="Of last recorded movements"
              />
            </div>
          )}

          {/* Quick actions — surfaces AI Assistant and other frequently used tools */}
          {quickActions.length > 0 && (
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="relative z-10 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-indigo-400/70 rounded-full" />
                  <h2 className="text-base font-medium text-slate-100">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {quickActions.map(a => (
                    <QuickActionCard key={a.to} action={a} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="relative rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="relative z-10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-indigo-400/70 rounded-full" />
                <h2 className="text-base font-medium text-slate-100">Warehouse Utilization (%)</h2>
              </div>
              {data.warehouse_utilization.length === 0 ? (
                <p className="text-slate-400 text-sm">No warehouse data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.warehouse_utilization}>
                    <defs>
                      <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#312e81" stopOpacity={0.35} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(15,23,42,0.9)',
                        border: '1px solid rgba(129,140,248,0.25)',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                      }}
                    />
                    <Bar dataKey="utilization_percent" fill="url(#indigoGrad)" radius={[6, 6, 0, 0]}>
                      {data.warehouse_utilization.map((_, i) => (
                        <Cell key={i} fill="url(#indigoGrad)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
                <div className="w-1 h-5 bg-slate-300/60 rounded-full" />
                <h2 className="text-base font-medium text-slate-100">Recent Stock Movements</h2>
              </div>
              {data.recent_movements.length === 0 ? (
                <p className="text-slate-400 px-5 py-6 text-sm">No stock movements recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-500 text-xs uppercase tracking-wider">
                      <th className="text-left px-5 py-3 font-medium">Product</th>
                      <th className="text-left px-5 py-3 font-medium">Type</th>
                      <th className="text-left px-5 py-3 font-medium">Quantity</th>
                      <th className="text-left px-5 py-3 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_movements.map((m, i) => (
                      <tr key={i} className="border-t border-white/5 hover:bg-white/[0.03] transition">
                        <td className="px-5 py-3 text-slate-100">{m.product__name}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                            m.movement_type === 'IN'
                              ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
                              : 'bg-rose-400/10 text-rose-300 border-rose-400/20'
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
