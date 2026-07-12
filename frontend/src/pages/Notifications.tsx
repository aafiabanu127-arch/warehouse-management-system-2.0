import { useEffect, useState } from 'react';
import type { Notification } from '../api/notifications';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../api/notifications';

const TYPE_COLORS: Record<string, string> = {
  LOW_STOCK: 'bg-red-100 text-red-700',
  SPACE_FULL: 'bg-orange-100 text-orange-700',
  REPORT_READY: 'bg-blue-100 text-blue-700',
  SYSTEM: 'bg-gray-100 text-gray-700',
};

const TYPE_LABELS: Record<string, string> = {
  LOW_STOCK: 'Low Stock',
  SPACE_FULL: 'Space Full',
  REPORT_READY: 'Report Ready',
  SYSTEM: 'System',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.results ?? (res.data as any));
    } catch {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleDelete = async (id: number) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-blue-600 hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && notifications.length === 0 && (
        <div className="text-center py-20 text-gray-500 dark:text-gray-400">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-lg">No notifications yet</p>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`rounded-lg border p-4 flex items-start gap-4 transition-all ${
              n.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    TYPE_COLORS[n.notif_type]
                  }`}
                >
                  {TYPE_LABELS[n.notif_type]}
                </span>
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                )}
              </div>
              <p className="font-medium text-gray-800">{n.title}</p>
              <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark read
                </button>
              )}
              <button
                onClick={() => handleDelete(n.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}