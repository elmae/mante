import { api } from ".";
import {
  INotification,
  INotificationPreferences,
  INotificationStats,
} from "@/types/notifications";

export const NotificationsAPI = {
  /**
   * Obtiene las notificaciones del usuario actual
   */
  getNotifications: async (): Promise<INotification[]> => {
    const { data } = await api.get<INotification[]>("/notifications");
    return data;
  },

  /**
   * Marca una notificación como leída
   * @param id - ID de la notificación
   */
  markAsRead: async (id: string): Promise<INotification> => {
    const { data } = await api.post<INotification>(`/notifications/${id}/read`);
    return data;
  },

  /**
   * Obtiene el contador de notificaciones no leídas
   */
  getUnreadCount: async (): Promise<INotificationStats> => {
    const { data } = await api.get<INotificationStats>(
      "/notifications/unread-count"
    );
    return data;
  },

  /**
   * Obtiene las preferencias de notificaciones del usuario
   */
  getPreferences: async (): Promise<INotificationPreferences> => {
    const { data } = await api.get<INotificationPreferences>(
      "/notifications/preferences"
    );
    return data;
  },

  /**
   * Actualiza las preferencias de notificaciones del usuario
   * @param preferences - Nuevas preferencias de notificaciones
   */
  updatePreferences: async (
    preferences: INotificationPreferences
  ): Promise<INotificationPreferences> => {
    const { data } = await api.put<INotificationPreferences>(
      "/notifications/preferences",
      preferences
    );
    return data;
  },

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead: async (): Promise<void> => {
    await api.post("/notifications/mark-all-read");
  },
};
