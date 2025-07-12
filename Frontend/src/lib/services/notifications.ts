import { api, API_ENDPOINTS, handleApiError, PaginatedResponse } from '@/lib/api';

// Notification interface
export interface Notification {
  _id: string;
  type: 'answer' | 'comment' | 'mention' | 'vote' | 'accept';
  questionId: {
    _id: string;
    title: string;
  };
  answerId?: string; // Changed from object to string to match backend response
  content: string;
  isRead: boolean;
  senderId?: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

// Notifications filter interface
export interface NotificationsFilter {
  page?: number;
  limit?: number;
}

// Notifications service
export const notificationsService = {
  // Get user notifications
  async getNotifications(filter: NotificationsFilter = {}): Promise<PaginatedResponse<Notification>> {
    try {
      const params = new URLSearchParams();
      
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());

      const response = await api.get(`${API_ENDPOINTS.NOTIFICATIONS}?${params.toString()}`);
      
      // Transform the backend response to match the expected PaginatedResponse structure
      return {
        success: response.data.success,
        data: response.data.notifications,
        pagination: response.data.pagination
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get(API_ENDPOINTS.UNREAD_COUNT);
      return response.data.count;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await api.put(API_ENDPOINTS.MARK_READ(id));
      return response.data.notification;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      await api.put(API_ENDPOINTS.MARK_ALL_READ);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    try {
      await api.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
}; 