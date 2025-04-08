export interface INotification {
  id: string;
  type: "email" | "in_app" | "push";
  title: string;
  content: string;
  is_read: boolean;
  user_id: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
}

export interface INotificationPreferences {
  email_notifications: boolean;
  in_app_notifications: boolean;
  push_notifications: boolean;
}

export interface INotificationFilters {
  type?: "email" | "in_app" | "push";
  is_read?: boolean;
}

export interface INotificationStats {
  unread_count: number;
}
