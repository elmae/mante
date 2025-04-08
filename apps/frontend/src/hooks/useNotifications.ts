import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationsAPI } from "@/services/api/notifications";
import { INotification, INotificationPreferences } from "@/types/notifications";

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const NOTIFICATIONS_KEY = "notifications";
  const UNREAD_COUNT_KEY = "notifications-unread";
  const PREFERENCES_KEY = "notifications-preferences";

  // Obtener todas las notificaciones
  const { data: notifications, isLoading } = useQuery<INotification[]>({
    queryKey: [NOTIFICATIONS_KEY],
    queryFn: NotificationsAPI.getNotifications,
  });

  // Obtener contador de no leídas
  const { data: unreadCount } = useQuery({
    queryKey: [UNREAD_COUNT_KEY],
    queryFn: NotificationsAPI.getUnreadCount,
    refetchInterval: 30000, // Refresca cada 30 segundos
  });

  // Marcar como leída
  const markAsRead = useMutation({
    mutationFn: NotificationsAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
    },
  });

  // Marcar todas como leídas
  const markAllAsRead = useMutation({
    mutationFn: NotificationsAPI.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_KEY] });
    },
  });

  // Actualizar preferencias
  const updatePreferences = useMutation({
    mutationFn: NotificationsAPI.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PREFERENCES_KEY] });
    },
  });

  // Obtener preferencias
  const { data: preferences } = useQuery<INotificationPreferences>({
    queryKey: [PREFERENCES_KEY],
    queryFn: NotificationsAPI.getPreferences,
  });

  return {
    notifications: notifications || [],
    unreadCount: unreadCount?.unread_count || 0,
    preferences,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    updatePreferences: updatePreferences.mutate,
  };
};
