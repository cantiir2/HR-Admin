import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import api from '../lib/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications?limit=100');
      setNotifications(res.data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await api.put('/api/notifications/read-all');
    fetchNotifications();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={30} className="animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Inbox</h2>
          <p className="text-sm text-surface-400">Daftar notifikasi aplikasi Anda</p>
        </div>
        <button type="button" onClick={markAllRead} className="btn-ghost text-sm inline-flex items-center gap-2">
          <CheckCheck size={16} />
          Read All
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-white/[0.04]">
          {notifications.map(item => (
            <button
              type="button"
              key={item.id}
              onClick={() => markRead(item.id)}
              className={`w-full text-left p-4 transition-colors ${item.isRead ? 'hover:bg-white/[0.03]' : 'bg-brand-500/10 hover:bg-brand-500/15'}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/[0.06] text-amber-400">
                  <Bell size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    {!item.isRead && <span className="w-2 h-2 rounded-full bg-brand-400" />}
                  </div>
                  <p className="text-sm text-surface-400">{item.message}</p>
                  <p className="text-xs text-surface-500 mt-2">{new Date(item.createdAt).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </button>
          ))}
          {notifications.length === 0 && (
            <div className="py-14 text-center text-sm text-surface-400">Tidak ada notifikasi</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
