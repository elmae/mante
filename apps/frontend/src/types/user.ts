export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  preferences: UserPreferences;
}

export type UserRole = "admin" | "technician" | "user";

export interface NotificationPreference {
  enabled: boolean;
  level: "all" | "important" | "none";
  methods: ("email" | "push" | "desktop")[];
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: "es" | "en";
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    categories: {
      tickets: NotificationPreference;
      maintenance: NotificationPreference;
      atms: NotificationPreference;
      system: NotificationPreference;
    };
  };
  dashboard: {
    showStats: boolean;
    defaultView: "tickets" | "maintenance" | "atms";
    refreshInterval: number;
  };
}

// Tipo recursivo para hacer todas las propiedades opcionales
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Tipo para actualizar el perfil
export type ProfileUpdateData = {
  name?: string;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  preferences?: DeepPartial<UserPreferences>;
};

export interface ValidationError {
  field: string;
  message: string;
}
