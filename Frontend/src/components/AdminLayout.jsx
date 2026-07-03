import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Fingerprint, Map as MapIcon, List, Users, FolderKanban,
  Settings, LogOut, Menu, X, CalendarCheck, FileText, CalendarDays, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import packageJson from "../../package.json";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const name = user?.name;
  const version = `v${packageJson.version}`;

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { to: '/admin', icon: MapIcon, label: 'Dashboard', end: true },
    { to: '/admin/attendance', icon: List, label: 'Absensi' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/projects', icon: FolderKanban, label: 'Project' },
    { to: '/admin/project-resources', icon: CalendarCheck, label: 'Project Resource' },
    { to: '/admin/available-members', icon: CalendarCheck, label: 'Available Member' },
    { to: '/admin/working-reports', icon: FileText, label: 'Working Report' },
    { to: '/admin/leaves', icon: CalendarDays, label: 'Annual Leave' },
    { to: '/admin/notifications', icon: Bell, label: 'Inbox' },
    { to: '/admin/system', icon: Settings, label: 'System Master' },
  ];

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-surface-900/70 backdrop-blur-xl border-r border-white/[0.06] flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Fingerprint size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Project Resource Management System</h1>
              <p className="text-[11px] text-surface-400">Admin Panel</p>
              <p className="text-[11px] text-surface-400">{version}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-surface-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 mt-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                  ? 'gradient-brand text-white shadow-lg shadow-brand-500/20'
                  : 'text-surface-400 hover:text-white hover:bg-white/[0.06]'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <UserAvatar name={name} photo={user?.profilePhoto} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{name}</p>
              <p className="text-[11px] text-surface-500">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-sm">
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <header className="glass-card rounded-none border-x-0 border-t-0 px-4 lg:px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0 z-50">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg bg-white/[0.06] text-surface-400">
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell pagePath="/admin/notifications" />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
