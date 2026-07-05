import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import apiClient from '../api/client';

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
  { label: 'AI Assistant', to: '/assistant' },
];

function initials(name?: string) {
  if (!name) return '?';
  return name.trim().slice(0, 2).toUpperCase();
}

export default function Layout() {
  const { user, logout } = useAuth();
  const perms = usePermissions();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard',       label: 'Dashboard',       show: true },
    { to: '/warehouses',      label: 'Warehouses',      show: true },
    { to: '/zones',           label: 'Zones',           show: true },
    { to: '/racks',           label: 'Racks',           show: true },
    { to: '/shelves',         label: 'Shelves',         show: true },
    { to: '/inventory',       label: 'Inventory',       show: perms.level >= 6 },
    { to: '/products',        label: 'Products',        show: true },
    { to: '/categories',      label: 'Categories',      show: perms.level >= 6 },
    { to: '/stock-movements', label: 'Stock Movements', show: perms.level >= 6 },
    { to: '/analytics',       label: 'Analytics',       show: perms.canViewAnalytics },
    { to: '/reports',         label: 'Reports',         show: perms.canViewReports },
    { to: '/approvals',       label: 'Approvals',       show: perms.canViewApprovals },
    { to: '/notifications',   label: 'Notifications',   show: true },
    { to: '/assistant',       label: 'AI Assistant',    show: true },
    { to: '/users',           label: 'User Management', show: perms.canViewUsers },
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

  const glass = 'bg-white/[0.04] backdrop-blur-2xl border border-white/10';
  const dropdownGlass = 'bg-slate-950/80 backdrop-blur-2xl border border-white/10';

  return (
    <div className="h-screen bg-[#05070d] text-slate-100 flex overflow-hidden relative"
      style={{ background: 'radial-gradient(ellipse at top left, #131a30 0%, #0a0e1a 55%, #05070d 100%)' }}>

      {/* Ambient liquid-glass orbs, professional single-hue tint */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-liquid-a absolute -top-32 -left-16 w-[32rem] h-[32rem] rounded-full bg-indigo-500/[0.06] blur-[120px]" />
        <div className="animate-liquid-b absolute bottom-0 right-0 w-[26rem] h-[26rem] rounded-full bg-slate-400/[0.04] blur-[120px]" />
      </div>

      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static z-30 h-full w-64 flex flex-col
        bg-white/[0.035] backdrop-blur-2xl border-r border-white/10
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-100">
            Warehouse System
          </h2>
          <button
            className="md:hidden text-xs font-medium text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition"
            onClick={() => setSidebarOpen(false)}
          >
            Close
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-500/[0.14] text-white border border-indigo-400/25 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]'
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-sm text-slate-300">
            {user?.username}{' '}
            <span className="text-slate-500">({user?.role})</span>
          </p>
          <button
            onClick={logout}
            className="mt-2 w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 text-sm font-medium py-1.5 rounded-xl transition"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className={`${glass} border-b border-white/10 px-4 py-2 flex items-center gap-3 sticky top-0 z-10`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-xs font-medium text-slate-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/10 transition mr-1"
          >
            Menu
          </button>
          <span className="md:hidden font-semibold text-sm text-slate-100">
            Warehouse System
          </span>

          {/* Search */}
          <div className="relative flex-1 max-w-sm" ref={searchRef}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 focus-within:border-indigo-400/40 transition">
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                className="bg-transparent outline-none text-sm w-full text-white placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="text-xs text-slate-400 hover:text-white font-medium"
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
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/[0.06] transition text-slate-300 hover:text-white"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">

            {/* Activity */}
            <div className="relative" ref={activityRef}>
              <button
                onClick={() => { setShowActivity(!showActivity); setShowNotifications(false); setShowProfile(false); }}
                className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition text-sm font-medium text-slate-300"
              >
                Activity
              </button>
              {showActivity && (
                <div className={`absolute right-0 top-11 w-80 rounded-xl ${dropdownGlass} shadow-2xl z-50`}>
                  <div className="px-4 py-2 border-b border-white/10 font-medium text-sm text-slate-300">Recent Activity</div>
                  <div className="max-h-72 overflow-y-auto">
                    {activity.length === 0
                      ? <p className="px-4 py-3 text-sm text-slate-500">No recent activity.</p>
                      : activity.map(a => (
                        <div key={a.id} className="px-4 py-2.5 border-b border-white/5 hover:bg-white/[0.04] transition">
                          <p className="text-sm text-slate-300">{a.text}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{a.time}</p>
                        </div>
                      ))}
                  </div>
                  <button onClick={() => { navigate('/stock-movements'); setShowActivity(false); }}
                    className="w-full text-center text-xs text-indigo-300 hover:text-indigo-200 py-2 transition font-medium">
                    View all stock movements →
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowActivity(false); setShowProfile(false); }}
                className="relative px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition text-sm font-medium text-slate-300"
              >
                Notifications
                {notifCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                    {notifCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className={`absolute right-0 top-11 w-80 rounded-xl ${dropdownGlass} shadow-2xl z-50`}>
                  <div className="px-4 py-2 border-b border-white/10 font-medium text-sm text-slate-300">Notifications</div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0
                      ? <p className="px-4 py-3 text-sm text-slate-500">No new notifications.</p>
                      : notifications.map(n => (
                        <div key={n.id} className="px-4 py-2.5 border-b border-white/5 hover:bg-white/[0.04] transition">
                          <p className="text-sm text-slate-300">{n.text}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                        </div>
                      ))}
                  </div>
                  <button onClick={() => { navigate('/notifications'); setShowNotifications(false); setNotifCount(0); }}
                    className="w-full text-center text-xs text-indigo-300 hover:text-indigo-200 py-2 transition font-medium">
                    View all notifications →
                  </button>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowActivity(false); }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition"
              >
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-semibold flex items-center justify-center">
                  {initials(user?.username)}
                </span>
                <span className="text-sm font-medium hidden sm:block text-slate-300">{user?.username}</span>
              </button>
              {showProfile && (
                <div className={`absolute right-0 top-11 w-64 rounded-xl ${dropdownGlass} shadow-2xl z-50`}>
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="font-medium text-sm text-white">{user?.username}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                    <span className="inline-block mt-1 text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-400/20 px-2 py-0.5 rounded-full">{user?.role}</span>
                  </div>
                  <div className="px-2 py-2 space-y-1">
                    <div className="px-3 py-2 rounded text-sm text-slate-400">Email: {user?.email || 'Not set'}</div>
                    <div className="px-3 py-2 rounded text-sm text-slate-400">Department: {user?.department || 'Not set'}</div>
                    <div className="px-3 py-2 rounded text-sm text-slate-400">Phone: {user?.phone || 'Not set'}</div>
                  </div>
                  <div className="px-2 py-2 border-t border-white/10">
                    <button onClick={() => { logout(); setShowProfile(false); }}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/10 rounded-lg transition">
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
      </div>
    </div>
  );
}
