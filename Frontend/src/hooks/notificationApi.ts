import { apiGet, apiPost } from './apiClient';

export interface ManagerNotification {
  id: string;
  title: string;
  message?: string | null;
  type: string;
  targetType?: string | null;
  targetId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  list: () => apiGet<ManagerNotification[]>('/api/notifications'),
  markRead: (notificationId: string) =>
    apiPost<{ success: boolean }>(`/api/notifications/${notificationId}/read`),
  markAllRead: () => apiPost<{ success: boolean }>('/api/notifications/read-all'),
};
