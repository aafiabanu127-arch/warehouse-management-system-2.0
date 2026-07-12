import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';
import apiClient from '../api/client';
import ThemeToggle from './ThemeToggle';
import {
  HomeIcon, WarehouseIcon, GridIcon, RackIcon, ShelfIcon, BoxIcon, PackageIcon,
  TagIcon, ShuffleIcon, AnalyticsIcon, ReportIcon, CheckShieldIcon, BellIcon,
  UsersIcon, SearchIcon, ActivityIcon, LogOutIcon, MenuIcon,
} from './icons';

interface ActivityItem {
  id: number;
  time: string;
  text: string;
}

interface SearchResult {
  label: string;
  to: string;
}

const allSearchItems: SearchResult[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Warehouses', to: '/warehouses' },
  { label: 'Zones', to: '/zones' },
  { label: 'Racks', to: '/racks' },
  { label: 'Shelves', to: '/shelves' },
  { label: 'Inventory', to: '/inventory' },
  { label: 'Products', to: '/products' },
  { label: 'Categories', to: '/categories' },
  { label: 'Stock Movements', to: '/stock-movements' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Approvals', to: '/approvals' },
  { label: 'Reports', to: '/reports' },
  { label: 'WMS AI', to: '/assistant' },
];

function initials(name?: string) {
  if (!name) return '?';
  return name.trim().slice(0, 2).toUpperCase();
}

type NavItem = { to: string; label: string; icon?: (p: { className?: string }) => ReactElement };

function NavItemLink({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-blue-500/[0.12] text-blue-700 border border-blue-400/30 dark:bg-blue-500/[0.16] dark:text-white dark:border-blue-400/25 dark:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]'
            : 'text-slate-500 hover:bg-slate-900/[0.04] hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-slate-100 border border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-slate-400 dark:text-slate-500'}`} />}
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const perms = usePermissions();
  const navigate = useNavigate();

  const dashboardItem = { to: '/dashboard', label: 'Dashboard', icon: HomeIcon, show: true };
  const aiItem = { to: '/assistant', label: 'WMS AI', show: true };

  const managementItems = [
    { to: '/warehouses',      label: 'Warehouses',      icon: WarehouseIcon, show: true },
    { to: '/zones',           label: 'Zones',           icon: GridIcon,      show: true },
    { to: '/racks',           label: 'Racks',           icon: RackIcon,      show: true },
    { to: '/shelves',         label: 'Shelves',         icon: ShelfIcon,     show: true },
    { to: '/inventory',       label: 'Inventory',       icon: BoxIcon,       show: perms.level >= 6 },
    { to: '/products',        label: 'Products',        icon: PackageIcon,   show: true },
    { to: '/categories',      label: 'Categories',      icon: TagIcon,       show: perms.level >= 6 },
    { to: '/stock-movements', label: 'Stock Movements', icon: ShuffleIcon,   show: perms.level >= 6 },
  ].filter(item => item.show);

  const operationsItems = [
    { to: '/analytics',     label: 'Analytics',       icon: AnalyticsIcon,   show: perms.canViewAnalytics },
    { to: '/reports',       label: 'Reports',          icon: ReportIcon,      show: perms.canViewReports },
    { to: '/approvals',     label: 'Approvals',        icon: CheckShieldIcon, show: perms.canViewApprovals },
    { to: '/notifications', label: 'Notifications',    icon: BellIcon,        show: true },
    { to: '/users',         label: 'User Management',  icon: UsersIcon,       show: perms.canViewUsers },
  ].filter(item => item.show);

  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch]           = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showActivity, setShowActivity]       = useState(false);
  const [showProfile, setShowProfile]         = useState(false);
  const [notifications, setNotifications]     = useState<ActivityItem[]>([]);
  const [activity, setActivity]               = useState<ActivityItem[]>([]);
  const [notifCount, setNotifCount]           = useState(0);

  const searchRef   = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const profileRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (activityRef.current && !activityRef.current.contains(e.target as Node)) setShowActivity(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const [movRes, appRes] = await Promise.all([
          apiClient.get('/stock-movements/?page_size=5'),
          apiClient.get('/approvals/?page_size=5'),
        ]);
        const moves: ActivityItem[] = (movRes.data.results || []).map((m: any) => ({
          id: m.id,
          time: new Date(m.created_at || m.timestamp || Date.now()).toLocaleTimeString(),
          text: `Stock ${m.movement_type || 'movement'}: ${m.product_name || m.product || 'item'} × ${m.quantity}`,
        }));
        const approvals: ActivityItem[] = (appRes.data.results || []).map((a: any) => ({
          id: a.id,
          time: new Date(a.created_at || Date.now()).toLocaleTimeString(),
          text: `Approval ${a.status || 'pending'}: ${a.request_type || 'request'} #${a.id}`,
        }));
        setActivity([...moves, ...approvals].slice(0, 8));
        const pending = (appRes.data.results || []).filter((a: any) => a.status === 'PENDING');
        const notifs: ActivityItem[] = pending.map((a: any) => ({
          id: a.id,
          time: new Date(a.created_at || Date.now()).toLocaleTimeString(),
          text: `Pending approval: ${a.request_type || 'request'} #${a.id}`,
        }));
        setNotifications(notifs);
        setNotifCount(notifs.length);
      } catch { /* silent */ }
    };
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(allSearchItems.filter(i => i.label.toLowerCase().includes(q)));
  }, [searchQuery]);

  const glass = 'bg-white/70 border border-slate-200 dark:bg-white/[0.04] dark:backdrop-blur-2xl dark:border-blue-400/[0.08]';
  const dropdownGlass = 'bg-white border border-slate-200 dark:bg-[#0a1428]/90 dark:backdrop-blur-2xl dark:border-blue-400/[0.1]';

  return (
    <div className="h-screen bg-slate-50 text-slate-900 dark:bg-[#04070f] dark:text-slate-100 flex overflow-hidden relative"
      style={isDark ? { background: 'radial-gradient(ellipse at top left, #16294f 0%, #0b1730 45%, #04070f 100%)' } : undefined}>

      {/* Ambient liquid-glass orbs, Ocean-tinted — dark mode only */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden hidden dark:block">
        <div className="animate-liquid-a absolute -top-32 -left-16 w-[32rem] h-[32rem] rounded-full bg-blue-500/[0.08] blur-[120px]" />
        <div className="animate-liquid-b absolute bottom-0 right-0 w-[26rem] h-[26rem] rounded-full bg-cyan-400/[0.05] blur-[120px]" />
      </div>

      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static z-30 h-full w-64 flex flex-col
        bg-white border-r border-slate-200 dark:bg-white/[0.03] dark:backdrop-blur-2xl dark:border-blue-400/[0.08]
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-200 dark:border-blue-400/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0
              bg-gradient-to-br from-blue-500 to-blue-800 shadow-[0_2px_10px_rgba(37,99,235,0.4)]">
              <WarehouseIcon className="w-4 h-4" />
            </span>
            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Warehouse System
            </h2>
          </div>
          <button
            className="md:hidden text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-900/5 dark:hover:bg-white/10 transition"
            onClick={() => setSidebarOpen(false)}
          >
            Close
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          <div className="space-y-1">
            <NavItemLink item={dashboardItem} onClick={() => setSidebarOpen(false)} />
            <NavItemLink item={aiItem} onClick={() => setSidebarOpen(false)} />
          </div>

          {managementItems.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500/70">Management</p>
              {managementItems.map(item => (
                <NavItemLink key={item.to} item={item} onClick={() => setSidebarOpen(false)} />
              ))}
            </div>
          )}

          {operationsItems.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500/70">Operations</p>
              {operationsItems.map(item => (
                <NavItemLink key={item.to} item={item} onClick={() => setSidebarOpen(false)} />
              ))}
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-slate-200 dark:border-blue-400/[0.08] space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0
              bg-gradient-to-br from-blue-400/25 to-blue-700/25 border border-blue-400/25 text-blue-700 dark:text-blue-200">
              {initials(user?.username)}
            </span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-tight truncate">
              {user?.username}<br />
              <span className="text-xs text-slate-400 dark:text-slate-500">{user?.role}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-sm font-medium py-1.5 rounded-xl transition"
          >
            <LogOutIcon className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className={`${glass} border-b border-slate-200 dark:border-blue-400/[0.08] px-4 py-2 flex items-center gap-3 sticky top-0 z-10`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden flex items-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-900/5 dark:hover:bg-white/10 transition mr-1"
          >
            <MenuIcon className="w-4 h-4" />
          </button>
          <span className="md:hidden font-semibold text-sm text-slate-900 dark:text-slate-100">
            Warehouse System
          </span>

          {/* Search */}
          <div className="relative flex-1 max-w-sm" ref={searchRef}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/[0.03] border border-slate-200 dark:bg-white/[0.04] dark:border-blue-400/[0.1] focus-within:border-blue-400/40 transition">
              <SearchIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                className="bg-transparent outline-none text-sm w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            {showSearch && searchResults.length > 0 && (
              <div className={`absolute top-10 left-0 w-full rounded-xl ${dropdownGlass} shadow-2xl overflow-hidden z-50`}>
                {searchResults.map(r => (
                  <button
                    key={r.to}
                    onClick={() => { navigate(r.to); setShowSearch(false); setSearchQuery(''); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-900/5 dark:hover:bg-white/[0.06] transition text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />

            {/* Activity */}
            <div className="relative" ref={activityRef}>
              <button
                onClick={() => { setShowActivity(!showActivity); setShowNotifications(false); setShowProfile(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/[0.03] hover:bg-slate-900/[0.06] border border-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-blue-400/[0.1] transition text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                <ActivityIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                <span className="hidden sm:inline">Activity</span>
              </button>
              {showActivity && (
                <div className={`absolute right-0 top-11 w-80 rounded-xl ${dropdownGlass} shadow-2xl z-50`}>
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-blue-400/[0.08] font-medium text-sm text-slate-600 dark:text-slate-300">Recent Activity</div>
                  <div className="max-h-72 overflow-y-auto">
                    {activity.length === 0
                      ? <p className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">No recent activity.</p>
                      : activity.map(a => (
                        <div key={a.id} className="px-4 py-2.5 border-b border-slate-100 dark:border-white/5 hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04] transition">
                          <p className="text-sm text-slate-700 dark:text-slate-300">{a.text}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{a.time}</p>
                        </div>
                      ))}
                  </div>
                  <button onClick={() => { navigate('/stock-movements'); setShowActivity(false); }}
                    className="w-full text-center text-xs text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 py-2 transition font-medium">
                    View all stock movements →
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowActivity(false); setShowProfile(false); }}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/[0.03] hover:bg-slate-900/[0.06] border border-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-blue-400/[0.1] transition text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                <BellIcon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                <span className="hidden sm:inline">Notifications</span>
                {notifCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                    {notifCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className={`absolute right-0 top-11 w-80 rounded-xl ${dropdownGlass} shadow-2xl z-50`}>
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-blue-400/[0.08] font-medium text-sm text-slate-600 dark:text-slate-300">Notifications</div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0
                      ? <p className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500">No new notifications.</p>
                      : notifications.map(n => (
                        <div key={n.id} className="px-4 py-2.5 border-b border-slate-100 dark:border-white/5 hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04] transition">
                          <p className="text-sm text-slate-700 dark:text-slate-300">{n.text}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{n.time}</p>
                        </div>
                      ))}
                  </div>
                  <button onClick={() => { navigate('/notifications'); setShowNotifications(false); setNotifCount(0); }}
                    className="w-full text-center text-xs text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 py-2 transition font-medium">
                    View all notifications →
                  </button>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowActivity(false); }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/[0.03] hover:bg-slate-900/[0.06] border border-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-blue-400/[0.1] transition"
              >
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400/30 to-blue-700/30 border border-blue-400/30 text-blue-700 dark:text-blue-200 text-[11px] font-semibold flex items-center justify-center">
                  {initials(user?.username)}
                </span>
                <span className="text-sm font-medium hidden sm:block text-slate-600 dark:text-slate-300">{user?.username}</span>
              </button>
              {showProfile && (
                <div className={`absolute right-0 top-11 w-64 rounded-xl ${dropdownGlass} shadow-2xl z-50`}>
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-blue-400/[0.08]">
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{user?.username}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                    <span className="inline-block mt-1 text-xs bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-400/20 px-2 py-0.5 rounded-full">{user?.role}</span>
                  </div>
                  <div className="px-2 py-2 space-y-1">
                    <div className="px-3 py-2 rounded text-sm text-slate-500 dark:text-slate-400">Email: {user?.email || 'Not set'}</div>
                    <div className="px-3 py-2 rounded text-sm text-slate-500 dark:text-slate-400">Department: {user?.department || 'Not set'}</div>
                    <div className="px-3 py-2 rounded text-sm text-slate-500 dark:text-slate-400">Phone: {user?.phone || 'Not set'}</div>
                  </div>
                  <div className="px-2 py-2 border-t border-slate-200 dark:border-blue-400/[0.08]">
                    <button onClick={() => { logout(); setShowProfile(false); }}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-300 hover:bg-rose-500/10 rounded-lg transition">
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-full">
          <Outlet />
        </main>

        <footer className="px-6 py-3 border-t border-slate-200 dark:border-blue-400/[0.06] flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>© {new Date().getFullYear()} Warehouse System. All rights reserved.</span>
          <span className="font-mono">v2.0.0</span>
        </footer>
      </div>
    </div>
  );
}
