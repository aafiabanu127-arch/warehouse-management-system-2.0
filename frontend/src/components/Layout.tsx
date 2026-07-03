import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import apiClient from '../api/client';

interface ActivityItem {
  id: number;
  time: string;
  text: string;
  icon: string;
}

interface SearchResult {
  label: string;
  to: string;
}

const allSearchItems: SearchResult[] = [
  { label: '📊 Dashboard', to: '/dashboard' },
  { label: '🏭 Warehouses', to: '/warehouses' },
  { label: '🗺️ Zones', to: '/zones' },
  { label: '🗄️ Racks', to: '/racks' },
  { label: '📚 Shelves', to: '/shelves' },
  { label: '📦 Inventory', to: '/inventory' },
  { label: '🛒 Products', to: '/products' },
  { label: '🗂️ Categories', to: '/categories' },
  { label: '🔄 Stock Movements', to: '/stock-movements' },
  { label: '📈 Analytics', to: '/analytics' },
  { label: '✅ Approvals', to: '/approvals' },
  { label: '📋 Reports', to: '/reports' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const perms = usePermissions();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard',       label: '📊 Dashboard',       show: true },
    { to: '/warehouses',      label: '🏭 Warehouses',      show: true },
    { to: '/zones',           label: '🗺️ Zones',           show: true },
    { to: '/racks',           label: '🗄️ Racks',           show: true },
    { to: '/shelves',         label: '📚 Shelves',         show: true },
    { to: '/inventory',       label: '📦 Inventory',       show: perms.level >= 6 },
    { to: '/products',        label: '🛒 Products',        show: true },
    { to: '/categories',      label: '🗂️ Categories',      show: perms.level >= 6 },
    { to: '/stock-movements', label: '🔄 Stock Movements', show: perms.level >= 6 },
    { to: '/analytics',       label: '📈 Analytics',       show: perms.canViewAnalytics },
    { to: '/reports',         label: '📋 Reports',         show: perms.canViewReports },
    { to: '/approvals',       label: '✅ Approvals',       show: perms.canViewApprovals },
    { to: '/notifications',   label: '🔔 Notifications',   show: true },
    { to: '/users',           label: '👥 User Management', show: perms.canViewUsers },
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
          icon: '🔄',
        }));
        const approvals: ActivityItem[] = (appRes.data.results || []).map((a: any) => ({
          id: a.id,
          time: new Date(a.created_at || Date.now()).toLocaleTimeString(),
          text: `Approval ${a.status || 'pending'}: ${a.request_type || 'request'} #${a.id}`,
          icon: '✅',
        }));
        setActivity([...moves, ...approvals].slice(0, 8));
        const pending = (appRes.data.results || []).filter((a: any) => a.status === 'PENDING');
        const notifs: ActivityItem[] = pending.map((a: any) => ({
          id: a.id,
          time: new Date(a.created_at || Date.now()).toLocaleTimeString(),
          text: `Pending approval: ${a.request_type || 'request'} #${a.id}`,
          icon: '🔔',
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

  const glass = 'bg-white/5 backdrop-blur-md border border-white/10';
  const dropdownGlass = 'bg-slate-900/90 backdrop-blur-xl border border-white/10';

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at top left, #1a1040 0%, #0a0a1a 50%, #001020 100%)' }}>

      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static z-30 h-full w-64 flex flex-col
        bg-white/5 backdrop-blur-xl border-r border-white/10
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Warehouse System
          </h2>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>✕</button>
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
                    ? 'bg-gradient-to-r from-purple-600/60 to-cyan-600/40 text-white border border-white/20 shadow-lg shadow-purple-500/10'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
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
            <span className="text-cyan-400">({user?.role})</span>
          </p>
          <button
            onClick={logout}
            className="mt-2 w-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-400 text-sm py-1.5 rounded-xl transition"
          >
            🚪 Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className={`${glass} border-b border-white/10 px-4 py-2 flex items-center gap-3 sticky top-0 z-10`}>
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-400 hover:text-white text-xl mr-1">☰</button>
          <span className="md:hidden font-bold text-sm bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Warehouse System
          </span>

          {/* Search */}
          <div className="relative flex-1 max-w-sm" ref={searchRef}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                className="bg-transparent outline-none text-sm w-full text-white placeholder-slate-500"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="text-slate-400">✕</button>
              )}
            </div>
            {showSearch && searchResults.length > 0 && (
              <div className={`absolute top-10 left-0 w-full rounded-xl ${dropdownGlass} shadow-2xl overflow-hidden z-50`}>
                {searchResults.map(r => (
                  <button
                    key={r.to}
                    onClick={() => { navigate(r.to); setShowSearch(false); setSearchQuery(''); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition text-slate-300 hover:text-white"
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
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-lg"
              >🕐</button>
              {showActivity && (
                <div className={`absolute right-0 top-11 w-80 rounded-xl ${dropdownGlass} shadow-2xl z-50`}>
                  <div className="px-4 py-2 border-b border-white/10 font-semibold text-sm text-slate-300">Recent Activity</div>
                  <div className="max-h-72 overflow-y-auto">
                    {activity.length === 0
                      ? <p className="px-4 py-3 text-sm text-slate-500">No recent activity.</p>
                      : activity.map(a => (
                        <div key={a.id} className="px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition">
                          <p className="text-sm text-slate-300">{a.icon} {a.text}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{a.time}</p>
                        </div>
                      ))}
                  </div>
                  <button onClick={() => { navigate('/stock-movements'); setShowActivity(false); }}
                    className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 py-2 transition">
                    View all stock movements →
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowActivity(false); setShowProfile(false); }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-lg relative"
              >
                🔔
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {notifCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className={`absolute right-0 top-11 w-80 rounded-xl ${dropdownGlass} shadow-2xl z-50`}>
                  <div className="px-4 py-2 border-b border-white/10 font-semibold text-sm text-slate-300">Notifications</div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0
                      ? <p className="px-4 py-3 text-sm text-slate-500">No new notifications.</p>
                      : notifications.map(n => (
                        <div key={n.id} className="px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition">
                          <p className="text-sm text-slate-300">{n.icon} {n.text}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
                        </div>
                      ))}
                  </div>
                  <button onClick={() => { navigate('/notifications'); setShowNotifications(false); setNotifCount(0); }}
                    className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 py-2 transition">
                    View all notifications →
                  </button>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowActivity(false); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
              >
                <span className="text-lg">👤</span>
                <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
              </button>
              {showProfile && (
                <div className={`absolute right-0 top-11 w-64 rounded-xl ${dropdownGlass} shadow-2xl z-50`}>
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="font-semibold text-sm text-white">{user?.username}</p>
                    <p className="text-xs text-slate-400">{user?.email}</p>
                    <span className="inline-block mt-1 text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">{user?.role}</span>
                  </div>
                  <div className="px-2 py-2 space-y-1">
                    <div className="px-3 py-2 rounded text-sm text-slate-400">📧 {user?.email || 'No email'}</div>
                    <div className="px-3 py-2 rounded text-sm text-slate-400">🏢 {user?.department || 'No department'}</div>
                    <div className="px-3 py-2 rounded text-sm text-slate-400">📱 {user?.phone || 'No phone'}</div>
                  </div>
                  <div className="px-2 py-2 border-t border-white/10">
                    <button onClick={() => { logout(); setShowProfile(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition">
                      🚪 Log Out
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