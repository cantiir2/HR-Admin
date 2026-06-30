import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const NotificationBell = ({ pagePath }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const [list, count] = await Promise.all([
        api.get('/api/notifications?limit=10'),
        api.get('/api/notifications/unread-count')
      ]);
      setNotifications(list.data || []);
      setUnreadCount(count.data?.count || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      fetchNotifications();
    } catch {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      fetchNotifications();
    } catch {
      fetchNotifications();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="p-2 rounded-lg bg-white/[0.06] text-surface-400 hover:text-amber-400 transition-colors relative"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-amber-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] glass-card p-3 z-50 animate-slide-down max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between gap-3 px-2 mb-2">
            <p className="text-xs font-semibold text-surface-400 uppercase">Notifikasi</p>
            <button type="button" onClick={markAllRead} className="text-xs text-brand-400 hover:text-brand-300 inline-flex items-center gap-1">
              <CheckCheck size={14} />
              Read all
            </button>
          </div>

          <div className="space-y-1">
            {notifications.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => markRead(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${item.isRead ? 'hover:bg-white/[0.04]' : 'bg-brand-500/10 hover:bg-brand-500/15'}`}
              >
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-surface-400 line-clamp-2">{item.message}</p>
                <p className="text-[11px] text-surface-500 mt-1">{new Date(item.createdAt).toLocaleString('id-ID')}</p>
              </button>
            ))}
            {notifications.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-surface-400">Tidak ada notifikasi</div>
            )}
          </div>

          {pagePath && (
            <button
              type="button"
              onClick={() => { setOpen(false); navigate(pagePath); }}
              className="w-full mt-3 btn-ghost text-sm"
            >
              Lihat Semua
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
