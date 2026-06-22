import apiClient from './client';

export interface Notification {
  id: number;
  notif_type: 'LOW_STOCK' | 'SPACE_FULL' | 'REPORT_READY' | 'SYSTEM';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const getNotifications = () =>
  apiClient.get<{ results: Notification[] }>('/notifications/notifications/');

export const markAsRead = (id: number) =>
  apiClient.patch(`/notifications/notifications/${id}/`, { is_read: true });

export const markAllAsRead = () =>
  apiClient.post('/notifications/notifications/mark_all_read/');

export const deleteNotification = (id: number) =>
  apiClient.delete(`/notifications/notifications/${id}/`);