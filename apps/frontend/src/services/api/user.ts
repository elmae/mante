import { apiClient, handleApiError } from "./client";
import type {
  UserProfile,
  ProfileUpdateData,
  PasswordChange,
} from "@/types/user";

export class UserError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "UserError";
  }
}

export const userService = {
  // Obtener perfil del usuario actual
  async getCurrentProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get("/users/me");
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new UserError(apiError.message, apiError.code, apiError.details);
    }
  },

  // Actualizar perfil
  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    try {
      const response = await apiClient.patch("/users/me", data);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new UserError(apiError.message, apiError.code, apiError.details);
    }
  },

  // Actualizar avatar
  async updateAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiClient.post("/users/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new UserError(apiError.message, apiError.code, apiError.details);
    }
  },

  // Eliminar avatar
  async deleteAvatar(): Promise<void> {
    try {
      await apiClient.delete("/users/me/avatar");
    } catch (error) {
      const apiError = handleApiError(error);
      throw new UserError(apiError.message, apiError.code, apiError.details);
    }
  },

  // Cambiar contraseña
  async changePassword(data: PasswordChange): Promise<void> {
    try {
      await apiClient.post("/users/me/password", data);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new UserError(apiError.message, apiError.code, apiError.details);
    }
  },

  // Actualizar preferencias
  async updatePreferences(
    preferences: ProfileUpdateData["preferences"]
  ): Promise<UserProfile> {
    try {
      const response = await apiClient.patch("/users/me/preferences", {
        preferences,
      });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new UserError(apiError.message, apiError.code, apiError.details);
    }
  },

  // Obtener notificaciones no leídas
  async getUnreadNotificationsCount(): Promise<number> {
    try {
      const response = await apiClient.get(
        "/users/me/notifications/unread/count"
      );
      return response.data.count;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new UserError(apiError.message, apiError.code, apiError.details);
    }
  },
};
