import { useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';
import { getDashboardSummary } from '../api/dashboard';
import type { DashboardSummary } from '../types/dashboard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, PieChart, Pie, Legend,
} from 'recharts';
import {
  WarehouseIcon, PackageIcon, BoxIcon, AlertTriangleIcon, ArrowDownIcon, ArrowUpIcon,
  ShuffleIcon, AnalyticsIcon, CheckShieldIcon, ReportIcon, SparkleIcon, DollarIcon,
  ClockIcon, TagIcon, GridIcon, RackIcon, ShelfIcon,
} from '../components/icons';

// Ocean palette — each stat keeps one semantic tone drawn from the
// Ocean (#0F1F40) reference swatch instead of a rainbow of neon gradients.
const CARDS = [
  { valueColor: 'text-slate-900 dark:text-slate-100', icon: WarehouseIcon, badge: 'bg-blue-500/15 text-blue-300 border-blue-400/25' },
  { valueColor: 'text-slate-900 dark:text-slate-100', icon: PackageIcon,   badge: 'bg-blue-500/15 text-blue-300 border-blue-400/25' },
  { valueColor: 'text-slate-900 dark:text-slate-100', icon: BoxIcon,       badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/25' },
  { valueColor: 'text-emerald-600 dark:text-emerald-300', icon: DollarIcon, badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25' },
  { valueColor: 'text-amber-600 dark:text-amber-300', icon: AlertTriangleIcon, badge: 'bg-amber-500/15 text-amber-300 border-amber-400/25' },
];

const PIE_COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb923c', '#22d3ee', '#f472b6'];

function StatCard({ label, value, valueColor, icon: Icon, badge }: {
  label: string; value: string | number; valueColor: string;
  icon: (p: { className?: string }) => ReactElement; badge: string;
}) {
  return (
    <div className="relative rounded-2xl border overflow-hidden
      border-slate-200 bg-white shadow-sm
      dark:border-blue-400/[0.1] dark:bg-white/[0.045] dark:backdrop-blur-2xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      {/* glass specular highlight, dark mode only */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px hidden dark:block bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 hidden dark:block bg-gradient-to-br from-white/[0.05] to-transparent" />
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className={`w-7 h-7 rounded-lg border flex items-center justify-center ${badge}`}>
            <Icon className="w-3.5 h-3.5" />
          </span>
        </div>
        <p className="text-[11px] font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className={`text-2xl font-semibold tracking-tight ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}

function InsightCard({ label, value, sub, icon: Icon, badge, chart }: {
  label: string; value: string; sub?: string;
  icon?: (p: { className?: string }) => ReactElement; badge?: string;
  chart?: ReactElement;
}) {
  return (
    <div className="relative rounded-xl border p-3
      border-slate-200 bg-slate-50
      dark:border-blue-400/[0.1] dark:bg-white/[0.03] dark:backdrop-blur-xl">
      <div className="flex items-start justify-between mb-1">
        <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-500">{label}</p>
        {Icon && badge && (
          <span className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${badge}`}>
            <Icon className="w-3 h-3" />
          </span>
        )}
      </div>
      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</p>
      {sub && <p className="text-[11px] mt-0.5 text-slate-500 dark:text-slate-500">{sub}</p>}
      {chart}
    </div>
  );
}

// Small stat pill used for warehouse structure counts (zones/racks/shelves/categories)
function MiniStatPill({ label, value, icon: Icon }: {
  label: string; value: number; icon: (p: { className?: string }) => ReactElement;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5
      border-slate-200 bg-slate-50
      dark:border-blue-400/[0.1] dark:bg-white/[0.03]">
      <span className="w-7 h-7 rounded-lg border flex items-center justify-center shrink-0
        bg-blue-500/15 text-blue-300 border-blue-400/25">
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-base font-semibold leading-tight text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-500 truncate">{label}</p>
      </div>
    </div>
  );
}

// Small ambient sparkline for the Movements Today card — visual texture only,
// not a precise timeline, so we bucket the recent movements payload as-is.
function MovementsSparkline({ movements }: { movements: DashboardSummary['recent_movements'] }) {
  if (!movements.length) return null;
  const points = movements
    .slice()
    .reverse()
    .map((m, i) => ({ i, qty: m.quantity }));

  return (
    <div className="h-7 -mx-1 mt-0.5">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="qty" stroke="#38bdf8" strokeWidth={1.5} fill="url(#sparkGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Signature element: an Ocean-gradient progress ring for average utilization,
// standing in for the plain "—" placeholder used elsewhere.
function UtilizationRing({ percent }: { percent: number | null }) {
  const r = 12;
  const c = 2 * Math.PI * r;
  const pct = percent ?? 0;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative w-7 h-7 shrink-0">
      <svg viewBox="0 0 30 30" className="w-7 h-7 -rotate-90">
        <circle cx="15" cy="15" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-white/[0.08]" />
        {percent !== null && (
          <circle
            cx="15" cy="15" r={r} fill="none" strokeWidth="3" strokeLinecap="round"
            stroke="url(#oceanRingGrad)" strokeDasharray={c} strokeDashoffset={offset}
          />
        )}
        <defs>
          <linearGradient id="oceanRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

interface QuickAction {
  to: string;
  title: string;
  description: string;
  show: boolean;
  icon: (p: { className?: string }) => ReactElement;
}

function QuickActionCard({ action }: { action: QuickAction }) {
  const Icon = action.icon;
  return (
    <Link
      to={action.to}
      className="group relative rounded-2xl border p-4 transition-colors block
        border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-blue-300
        dark:border-blue-400/[0.1] dark:bg-white/[0.03] dark:hover:bg-white/[0.06] dark:hover:border-blue-400/25 dark:backdrop-blur-xl"
    >
      <span className="w-8 h-8 rounded-lg border flex items-center justify-center mb-2.5
        bg-blue-500/15 text-blue-300 border-blue-400/25">
        <Icon className="w-3.5 h-3.5" />
      </span>
      <p className="text-sm font-medium text-slate-900 group-hover:text-slate-950 dark:text-slate-100 dark:group-hover:text-white">{action.title}</p>
      <p className="text-xs mt-1 leading-relaxed text-slate-500 dark:text-slate-500">{action.description}</p>
      <span className="inline-block mt-3 text-xs font-medium text-blue-600 group-hover:text-blue-700 dark:text-blue-300 dark:group-hover:text-blue-200">
        Open →
      </span>
    </Link>
  );
}

// Section wrapper shared by all the chart/table panels below the fold —
// keeps the glass card chrome consistent without repeating it everywhere.
function Section({ title, accent = 'bg-blue-500/70 dark:bg-blue-400/70', children, right }: {
  title: string; accent?: string; children: ReactElement | ReactElement[] | false | null; right?: ReactElement;
}) {
  return (
    <div className="relative rounded-3xl border overflow-hidden
      border-slate-200 bg-white shadow-sm
      dark:border-blue-400/[0.1] dark:bg-white/[0.035] dark:backdrop-blur-2xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px hidden dark:block bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-1 h-5 rounded-full ${accent}`} />
            <h2 className="text-base font-medium text-slate-900 dark:text-slate-100">{title}</h2>
          </div>
          {right}
        </div>
        {children}
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const perms = usePermissions();
  const location = useLocation();
  const { theme } = useTheme();
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
    { label: 'Inventory Value',       value: formatCurrency(data.total_inventory_value ?? 0) },
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

  const categoryPieData = useMemo(() => {
    if (!data) return [];
    return data.category_breakdown.map((c, i) => ({
      name: c.category,
      value: c.total_quantity,
      productCount: c.product_count,
      totalValue: c.total_value,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    }));
  }, [data]);

  const quickActions: QuickAction[] = [
    {
      to: '/assistant',
      title: 'WMS AI',
      description: 'Ask questions about stock levels, movements, or get help navigating the system.',
      show: true,
      icon: SparkleIcon,
    },
    {
      to: '/stock-movements',
      title: 'Stock Movements',
      description: 'Log or review inbound and outbound inventory activity.',
      show: perms.level >= 6,
      icon: ShuffleIcon,
    },
    {
      to: '/analytics',
      title: 'Analytics',
      description: 'Deeper trends across warehouses, products, and turnover.',
      show: perms.canViewAnalytics,
      icon: AnalyticsIcon,
    },
    {
      to: '/approvals',
      title: 'Approvals',
      description: 'Review pending requests waiting on your decision.',
      show: perms.canViewApprovals,
      icon: CheckShieldIcon,
    },
    {
      to: '/reports',
      title: 'Reports',
      description: 'Generate and export warehouse performance reports.',
      show: perms.canViewReports,
      icon: ReportIcon,
    },
    {
      to: '/inventory',
      title: 'Inventory',
      description: 'Browse current stock across every warehouse.',
      show: perms.level >= 6,
      icon: BoxIcon,
    },
  ].filter(a => a.show);

  const isDark = theme === 'dark';
  const chartColors = isDark
    ? { grid: '#ffffff08', axis: '#94a3b8', tooltipBg: 'rgba(11,23,48,0.92)', tooltipBorder: 'rgba(56,189,248,0.25)', tooltipText: '#e2e8f0' }
    : { grid: '#0000000c', axis: '#64748b', tooltipBg: 'rgba(255,255,255,0.97)', tooltipBorder: 'rgba(37,99,235,0.25)', tooltipText: '#1e293b' };

  return (
    <div>
      <div className="relative space-y-6 -m-4 md:-m-8 p-4 md:p-8 min-h-full bg-slate-50 dark:bg-transparent">

        {/* Ambient liquid-glass background accents, dark mode only */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden hidden dark:block">
          <div className="animate-liquid-a absolute -top-24 left-[8%] w-[28rem] h-[28rem] rounded-full bg-blue-500/[0.09] blur-[110px]" />
          <div className="animate-liquid-b absolute top-1/3 right-[5%] w-[24rem] h-[24rem] rounded-full bg-cyan-400/[0.06] blur-[110px]" />
        </div>

        {denied && (
          <div className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm
            bg-rose-50 border border-rose-200 text-rose-700
            dark:bg-rose-500/10 dark:border-rose-500/25 dark:text-rose-300 dark:backdrop-blur-xl">
            <span>You do not have permission to access that page. Your role is <strong>{user?.role}</strong>.</span>
            <button onClick={() => setDenied(false)} className="ml-4 font-medium text-rose-600/80 hover:text-rose-700 dark:text-rose-300/80 dark:hover:text-rose-200">Dismiss</button>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome, <span className="font-medium text-slate-700 dark:text-slate-200">{user?.username}</span>{' '}
            <span className="text-slate-400 dark:text-slate-500">({user?.role})</span>
          </p>
        </div>

        {isLoading && <p className="text-sm text-slate-500 dark:text-slate-400">Loading dashboard data...</p>}
        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {cards.map((c, i) => (
                <StatCard key={i} label={c.label} value={c.value} {...CARDS[i]} />
              ))}
            </div>

            {/* Insights — extra at-a-glance detail derived from the summary data */}
            {insights && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                <InsightCard
                  label="Avg. Utilization"
                  value={data.warehouse_utilization.length ? `${insights.avgUtilization}%` : '—'}
                  sub={insights.busiest ? `Busiest: ${insights.busiest.name}` : 'No warehouse data'}
                  chart={<UtilizationRing percent={data.warehouse_utilization.length ? insights.avgUtilization : null} />}
                />
                <InsightCard
                  label="Movements Today"
                  value={String(insights.movementsToday)}
                  sub="Based on recent activity"
                  chart={<MovementsSparkline movements={data.recent_movements} />}
                />
                <InsightCard
                  label="Recent Stock In"
                  value={String(insights.stockIn)}
                  sub="Of last recorded movements"
                  icon={ArrowDownIcon}
                  badge="bg-emerald-500/15 text-emerald-300 border-emerald-400/25"
                />
                <InsightCard
                  label="Recent Stock Out"
                  value={String(insights.stockOut)}
                  sub="Of last recorded movements"
                  icon={ArrowUpIcon}
                  badge="bg-rose-500/15 text-rose-300 border-rose-400/25"
                />
                <InsightCard
                  label="Pending Approvals"
                  value={String(data.pending_approvals.total)}
                  sub={`${data.pending_approvals.transfers} transfers · ${data.pending_approvals.adjustments} adjustments`}
                  icon={ClockIcon}
                  badge="bg-violet-500/15 text-violet-300 border-violet-400/25"
                />
              </div>
            )}

            {/* Quick actions — surfaces AI Assistant and other frequently used tools */}
            {quickActions.length > 0 && (
              <Section title="Quick Actions">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {quickActions.map(a => (
                    <QuickActionCard key={a.to} action={a} />
                  ))}
                </div>
              </Section>
            )}

            {/* Warehouse structure & capacity — zones/racks/shelves/categories plus overall space usage */}
            <Section title="Warehouse Structure &amp; Capacity">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
                <MiniStatPill label="Zones" value={data.structure_counts.zones} icon={GridIcon} />
                <MiniStatPill label="Racks" value={data.structure_counts.racks} icon={RackIcon} />
                <MiniStatPill label="Shelves" value={data.structure_counts.shelves} icon={ShelfIcon} />
                <MiniStatPill label="Categories" value={data.structure_counts.categories} icon={TagIcon} />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 text-slate-500 dark:text-slate-400">
                  <span>Used {data.capacity_overview.used_capacity.toLocaleString()} / {data.capacity_overview.total_capacity.toLocaleString()} capacity units</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{data.capacity_overview.utilization_percent}%</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600"
                    style={{ width: `${Math.min(100, data.capacity_overview.utilization_percent)}%` }}
                  />
                </div>
                <p className="text-[11px] mt-1.5 text-slate-500 dark:text-slate-500">
                  {data.capacity_overview.available_capacity.toLocaleString()} capacity units still available across all warehouses.
                </p>
              </div>
            </Section>

            {/* Category breakdown + Top products, side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2">
                <Section title="Inventory by Category">
                  {categoryPieData.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No category data yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={2}
                        >
                          {categoryPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: chartColors.tooltipBg,
                            border: `1px solid ${chartColors.tooltipBorder}`,
                            borderRadius: '12px',
                            color: chartColors.tooltipText,
                          }}
                          formatter={((value: number, _name: unknown, props: { payload?: { totalValue?: number; name?: string } }) => [
                            `${value.toLocaleString()} units · ${formatCurrency(props?.payload?.totalValue ?? 0)}`,
                            props?.payload?.name,
                          ]) as any}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 11, color: chartColors.axis }}
                          formatter={(value: string) => <span style={{ color: chartColors.axis }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Section>
              </div>

              <div className="lg:col-span-3">
                <Section title="Top Products by Quantity">
                  {data.top_products.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No product data yet.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={data.top_products} layout="vertical" margin={{ left: 12, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={false} />
                        <XAxis type="number" stroke={chartColors.axis} tick={{ fontSize: 11 }} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke={chartColors.axis}
                          tick={{ fontSize: 11 }}
                          width={110}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: chartColors.tooltipBg,
                            border: `1px solid ${chartColors.tooltipBorder}`,
                            borderRadius: '12px',
                            color: chartColors.tooltipText,
                          }}
                        />
                        <Bar dataKey="quantity" radius={[0, 6, 6, 0]}>
                          {data.top_products.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Section>
              </div>
            </div>

            {/* 14-day movement trend */}
            <Section title="14-Day Movement Trend">
              {data.movement_trend.every(d => d.in === 0 && d.out === 0 && d.transfer === 0) ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No movement activity in the last 14 days.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={data.movement_trend}>
                    <defs>
                      <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f87171" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="transferGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                    <XAxis
                      dataKey="date"
                      stroke={chartColors.axis}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke={chartColors.axis} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: '12px',
                        color: chartColors.tooltipText,
                      }}
                      labelFormatter={((d: string) => new Date(d).toLocaleDateString()) as any}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: chartColors.axis }} />
                    <Area type="monotone" dataKey="in" name="Stock In" stroke="#34d399" strokeWidth={2} fill="url(#inGrad)" />
                    <Area type="monotone" dataKey="out" name="Stock Out" stroke="#f87171" strokeWidth={2} fill="url(#outGrad)" />
                    <Area type="monotone" dataKey="transfer" name="Transfer" stroke="#a78bfa" strokeWidth={2} fill="url(#transferGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Section>

            <Section title="Warehouse Utilization (%)">
              {data.warehouse_utilization.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No warehouse data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.warehouse_utilization}>
                    <defs>
                      <linearGradient id="oceanBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0f1f40" stopOpacity={0.45} />
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
                    <Bar dataKey="utilization_percent" fill="url(#oceanBarGrad)" radius={[6, 6, 0, 0]}>
                      {data.warehouse_utilization.map((_, i) => (
                        <Cell key={i} fill="url(#oceanBarGrad)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Section>

            {/* Low stock items — actionable detail behind the summary count above */}
            <Section title="Low Stock Items" accent="bg-amber-500/70 dark:bg-amber-400/70">
              {data.low_stock_items.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Nothing below the low-stock threshold right now.</p>
              ) : (
                <div className="-mx-5 -mb-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">
                        <th className="text-left px-5 py-3 font-medium">Product</th>
                        <th className="text-left px-5 py-3 font-medium">SKU</th>
                        <th className="text-left px-5 py-3 font-medium">Shelf</th>
                        <th className="text-left px-5 py-3 font-medium">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.low_stock_items.map((item, i) => (
                        <tr key={i} className="border-t transition
                          border-slate-100 hover:bg-slate-50
                          dark:border-white/5 dark:hover:bg-white/[0.03]">
                          <td className="px-5 py-3 text-slate-900 dark:text-slate-100">{item.name}</td>
                          <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{item.sku}</td>
                          <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{item.shelf_code}</td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium border
                              bg-amber-50 text-amber-700 border-amber-200
                              dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20">
                              {item.quantity}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <div className="relative rounded-3xl border overflow-hidden
              border-slate-200 bg-white shadow-sm
              dark:border-blue-400/[0.1] dark:bg-white/[0.035] dark:backdrop-blur-2xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px hidden dark:block bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200 dark:border-blue-400/[0.08]">
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
