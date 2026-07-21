import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Fingerprint, Map as MapIcon, LogOut, Menu, X, User, FileText, CalendarDays, ClipboardCheck, Bell, History, FolderClosed
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import NavItem from './NavItem';
import packageJson from "../../package.json";



const MemberLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const name = user?.name;
  const jobRole = user?.jobRoleCode || 'Member';
  const version = `v${packageJson.version}`;

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { to: '/member', icon: MapIcon, label: 'Dashboard Absensi', end: true },
    {
      label: 'Time Management',
      icon: FolderClosed,
      subItems: [
        { to: '/member/attendance-requests', icon: History, label: 'Attendance Request' },
        { to: '/member/working-report', icon: FileText, label: 'Working Report' },
        { to: '/member/annual-leave', icon: CalendarDays, label: 'Annual Leave' },
      ]
    },
    { to: '/member/projects', icon: FolderClosed, label: 'Project Saya' },
    { to: '/member/profile', icon: User, label: 'Profil Saya' },
    ...(user?.jobRoleCode === 'PM' ? [{ to: '/member/leave-approval', icon: ClipboardCheck, label: 'Leave Approval' }] : []),
    { to: '/member/notifications', icon: Bell, label: 'Inbox' },
  ];

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-[70] w-64 bg-surface-900/70 backdrop-blur-xl border-r border-white/[0.06] flex flex-col transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Fingerprint size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Project Resource Management System</h1>
              <p className="text-[11px] text-surface-400">Employee Portal</p>
              <p className="text-[11px] text-surface-400">{version}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-surface-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 mt-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <NavItem key={item.label || item.to || index} item={item} setSidebarOpen={setSidebarOpen} />
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <div className="mb-3 flex justify-end gap-2 lg:hidden">
            {/* <ThemeToggle /> */}
            {/* <NotificationBell pagePath="/member/notifications" /> */}
          </div>
          <div className="flex items-center gap-3 mb-3 px-1">
            <UserAvatar name={name} photo={user?.profilePhoto} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{name}</p>
              <p className="text-[11px] text-surface-500">{jobRole}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-surface-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-sm">
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar for Desktop */}
        <div className="hidden lg:flex absolute top-6 right-8 z-50 items-center gap-2">
          <ThemeToggle />
          <NotificationBell pagePath="/member/notifications" />
        </div>

        {/* Top Bar for Mobile */}
        <header className="lg:hidden glass-card rounded-none border-x-0 border-t-0 px-4 py-3 flex items-center justify-between gap-4 flex-shrink-0 z-50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Fingerprint size={16} />
            </div>
            <h1 className="text-sm font-bold text-white leading-tight">
              Project Resource Management System
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell pagePath="/member/notifications" />
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-white/[0.06] text-surface-400"
            >
              <Menu size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MemberLayout;
