import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  LayoutDashboard, 
  CircleDollarSign, 
  Receipt, 
  Calculator, 
  FileText, 
  Bell, 
  Settings, 
  LogOut, 
  Users, 
  ShieldAlert, 
  Search,
  ChevronDown,
  Bot
} from 'lucide-react';

export const ProtectedLayout: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      const unread = res.data.notifications.filter((n: any) => n.Status === 'Unread');
      setUnreadCount(unread.length);
    } catch (err) {
      console.error('Failed to load notifications count:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const sidebarLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Automation Hub', path: '/automation', icon: Bot },
    { name: 'Income', path: '/income', icon: CircleDollarSign },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Tax Return', path: '/tax/return', icon: Calculator },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : undefined },
  ];

  if (user.Role === 'Accountant') {
    sidebarLinks.push({ name: 'Clients', path: '/accountant/dashboard', icon: Users });
  }
  if (user.Role === 'System Administrator') {
    sidebarLinks.push({ name: 'Administration', path: '/admin/dashboard', icon: ShieldAlert });
  }

  sidebarLinks.push({ name: 'Settings', path: '/settings', icon: Settings });

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/income?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden antialiased selection:bg-primary/20">
      
      {/* SIDEBAR (Midnight Slate Glow Gradient) */}
      <aside className="w-68 bg-gradient-to-b from-[#0B120F] via-[#0E1B16] to-[#09100D] text-slate-300 flex flex-col justify-between border-r border-[#1E293B]/30 shrink-0">
        <div>
          {/* Logo Brand Header */}
          <div className="h-18 flex items-center gap-3 px-6 border-b border-[#1E293B]/40 bg-[#070B13]/30">
            <div className="bg-gradient-to-tr from-primary to-[#10B981] p-2 rounded-xl shadow-md shadow-primary/20">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-white tracking-wider block">TFAT</span>
              <span className="text-[9px] font-mono uppercase bg-primary/20 text-blue-400 border border-primary/30 px-1 rounded">Tax Automation</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 mt-4">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-250 relative group ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/15'
                      : 'hover:bg-white/5 hover:text-white text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                    <span>{link.name}</span>
                  </div>
                  {link.badge !== undefined && (
                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold ring-2 ring-[#0E1527]">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-white rounded-r"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout (Bottom Panel) */}
        <div className="p-4 border-t border-[#1E293B]/30 bg-[#070B13]/30 flex flex-col gap-3">
          <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-[#10B981] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user.Name.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate leading-tight">{user.Name}</div>
              <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5 capitalize">{user.Role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-red-950/20 hover:text-red-400 transition-colors duration-200"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER NAVBAR (Glass effect, sticky) */}
        <header className="h-18 bg-white/70 backdrop-blur-md border-b border-border/80 flex items-center justify-between px-8 z-30 shrink-0">
          
          {/* Global Search Bar (Modern glass style) */}
          <form onSubmit={handleGlobalSearch} className="relative w-96">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search records, invoices, logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 pl-11 pr-4 py-2.5 border border-border/80 rounded-xl text-xs font-mono focus:outline-none focus:border-primary/80 focus:bg-white focus:shadow-sm transition-all"
            />
          </form>

          {/* User & Actions */}
          <div className="flex items-center gap-6">
            {/* Notification Badge Bell */}
            <Link to="/notifications" className="relative p-2 text-slate-400 hover:text-primary transition-colors hover:bg-slate-50 rounded-lg">
              <Bell className="h-5.5 w-5.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </Link>

            <div className="h-6 w-[1px] bg-border/85"></div>

            {/* Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2.5 text-slate-700 hover:text-primary transition-colors focus:outline-none"
              >
                <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-tr from-primary to-[#10B981] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.Name.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <span className="text-xs font-bold block text-slate-900">{user.Name}</span>
                  <span className="text-[9px] text-slate-400 block font-mono tracking-wider capitalize leading-tight">{user.Role}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2.5 w-52 bg-white border border-border rounded-xl shadow-xl py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-border/70">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Authorized Account</span>
                      <span className="text-xs font-bold text-slate-800 truncate block mt-0.5 font-mono">{user.Email}</span>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout Account</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* BREADCRUMBS & SCROLLABLE VIEW CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8">
          {/* Custom breadcrumb style */}
          <div className="mb-6 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
            <span className="hover:text-primary transition-colors cursor-pointer">TFAT Workspace</span>
            <span>/</span>
            <span className="text-slate-600">{location.pathname.split('/').filter(Boolean).join(' / ') || 'Dashboard'}</span>
          </div>
          
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
