import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { getDashboardSummary } from '../api/dashboard';
import type { DashboardSummary } from '../types/dashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

type ThemeMode = 'light' | 'dark';
const THEME_KEY = 'dashboard-theme';

function useDashboardTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(THEME_KEY) : null;
    return stored === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return { theme, toggleTheme: () => setTheme(t => (t === 'dark' ? 'light' : 'dark')) };
}

function ThemeToggle({ theme, onToggle }: { theme: ThemeMode; onToggle: () => void }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle light and dark mode"
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition
        border border-slate-200 bg-white text-slate-600 hover:bg-slate-50
        dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08]"
    >
      {isDark ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      )}
      {isDark ? 'Dark' : 'Light'}
    </button>
  );
}

// Professional, restrained accent set — each stat keeps one semantic tone
// instead of a rainbow of neon gradients.
const CARDS = [
  { valueColor: 'text-slate-900 dark:text-slate-100', accent: 'bg-indigo-400' },
  { valueColor: 'text-slate-900 dark:text-slate-100', accent: 'bg-sky-400' },
  { valueColor: 'text-slate-900 dark:text-slate-100', accent: 'bg-slate-400 dark:bg-slate-300' },
  { valueColor: 'text-amber-600 dark:text-amber-300', accent: 'bg-amber-400' },
];

function StatCard({ label, value, valueColor, accent }: {
  label: string; value: string | number; valueColor: string; accent: string;
}) {
  return (
    <div className="relative rounded-3xl border overflow-hidden
      border-slate-200 bg-white shadow-sm
      dark:border-white/10 dark:bg-white/[0.045] dark:backdrop-blur-2xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      {/* glass specular highlight, dark mode only */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px hidden dark:block bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 hidden dark:block bg-gradient-to-br from-white/[0.05] to-transparent" />
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-1.5 h-1.5 rounded-full ${accent}`} />
          <p className="text-xs font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400">{label}</p>
        </div>
        <p className={`text-3xl font-semibold tracking-tight ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

function InsightCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="relative rounded-2xl border p-4
      border-slate-200 bg-slate-50
      dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-xl">
      <p className="text-xs uppercase tracking-wider mb-1.5 text-slate-500 dark:text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      {sub && <p className="text-xs mt-1 text-slate-500 dark:text-slate-500">{sub}</p>}
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
      className="group relative rounded-2xl border p-4 transition-colors block
        border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300
        dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:hover:border-indigo-400/25 dark:backdrop-blur-xl"
    >
      <p className="text-sm font-medium text-slate-900 group-hover:text-slate-950 dark:text-slate-100 dark:group-hover:text-white">{action.title}</p>
      <p className="text-xs mt-1 leading-relaxed text-slate-500 dark:text-slate-500">{action.description}</p>
      <span className="inline-block mt-3 text-xs font-medium text-indigo-600 group-hover:text-indigo-700 dark:text-indigo-300 dark:group-hover:text-indigo-200">
        Open →
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const perms = usePermissions();
  const location = useLocation();
  const { theme, toggleTheme } = useDashboardTheme();
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

  const isDark = theme === 'dark';
  const chartColors = isDark
    ? { grid: '#ffffff08', axis: '#94a3b8', tooltipBg: 'rgba(15,23,42,0.9)', tooltipBorder: 'rgba(129,140,248,0.25)', tooltipText: '#e2e8f0' }
    : { grid: '#0000000c', axis: '#64748b', tooltipBg: 'rgba(255,255,255,0.97)', tooltipBorder: 'rgba(99,102,241,0.25)', tooltipText: '#1e293b' };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="relative space-y-6 -m-4 md:-m-8 p-4 md:p-8 min-h-full bg-slate-50 dark:bg-transparent">

        {/* Ambient liquid-glass background accents, dark mode only */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden hidden dark:block">
          <div className="animate-liquid-a absolute -top-24 left-[8%] w-[28rem] h-[28rem] rounded-full bg-indigo-500/10 blur-[110px]" />
          <div className="animate-liquid-b absolute top-1/3 right-[5%] w-[24rem] h-[24rem] rounded-full bg-sky-400/[0.07] blur-[110px]" />
        </div>

        {denied && (
          <div className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm
            bg-rose-50 border border-rose-200 text-rose-700
            dark:bg-rose-500/10 dark:border-rose-500/25 dark:text-rose-300 dark:backdrop-blur-xl">
            <span>You do not have permission to access that page. Your role is <strong>{user?.role}</strong>.</span>
            <button onClick={() => setDenied(false)} className="ml-4 font-medium text-rose-600/80 hover:text-rose-700 dark:text-rose-300/80 dark:hover:text-rose-200">Dismiss</button>
          </div>
        )}

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Welcome, <span className="font-medium text-slate-700 dark:text-slate-200">{user?.username}</span>{' '}
              <span className="text-slate-400 dark:text-slate-500">({user?.role})</span>
            </p>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading dashboard data...</p>}
        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

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
              <div className="relative rounded-3xl border overflow-hidden
                border-slate-200 bg-white shadow-sm
                dark:border-white/10 dark:bg-white/[0.03] dark:backdrop-blur-2xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px hidden dark:block bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <div className="relative z-10 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 rounded-full bg-indigo-500/70 dark:bg-indigo-400/70" />
                    <h2 className="text-base font-medium text-slate-900 dark:text-slate-100">Quick Actions</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {quickActions.map(a => (
                      <QuickActionCard key={a.to} action={a} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="relative rounded-3xl border overflow-hidden
              border-slate-200 bg-white shadow-sm
              dark:border-white/10 dark:bg-white/[0.035] dark:backdrop-blur-2xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px hidden dark:block bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="relative z-10 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 rounded-full bg-indigo-500/70 dark:bg-indigo-400/70" />
                  <h2 className="text-base font-medium text-slate-900 dark:text-slate-100">Warehouse Utilization (%)</h2>
                </div>
                {data.warehouse_utilization.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No warehouse data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.warehouse_utilization}>
                      <defs>
                        <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#312e81" stopOpacity={0.35} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                      <XAxis dataKey="name" stroke={chartColors.axis} tick={{ fontSize: 11 }} />
                      <YAxis stroke={chartColors.axis} domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: chartColors.tooltipBg,
                          border: `1px solid ${chartColors.tooltipBorder}`,
                          borderRadius: '12px',
                          color: chartColors.tooltipText,
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

            <div className="relative rounded-3xl border overflow-hidden
              border-slate-200 bg-white shadow-sm
              dark:border-white/10 dark:bg-white/[0.035] dark:backdrop-blur-2xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px hidden dark:block bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200 dark:border-white/10">
                  <div className="w-1 h-5 rounded-full bg-slate-400/60 dark:bg-slate-300/60" />
                  <h2 className="text-base font-medium text-slate-900 dark:text-slate-100">Recent Stock Movements</h2>
                </div>
                {data.recent_movements.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">No stock movements recorded yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">
                        <th className="text-left px-5 py-3 font-medium">Product</th>
                        <th className="text-left px-5 py-3 font-medium">Type</th>
                        <th className="text-left px-5 py-3 font-medium">Quantity</th>
                        <th className="text-left px-5 py-3 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_movements.map((m, i) => (
                        <tr key={i} className="border-t transition
                          border-slate-100 hover:bg-slate-50
                          dark:border-white/5 dark:hover:bg-white/[0.03]">
                          <td className="px-5 py-3 text-slate-900 dark:text-slate-100">{m.product__name}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                              m.movement_type === 'IN'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20'
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/20'
                            }`}>
                              {m.movement_type}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{m.quantity}</td>
                          <td className="px-5 py-3 text-slate-400 dark:text-slate-500">{new Date(m.timestamp).toLocaleString()}</td>
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
    </div>
  );
}
