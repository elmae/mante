import { apiClient, handleApiError } from "./client";
import type {
  SecuritySettings,
  TwoFactorSetup,
  TwoFactorVerification,
  SessionInfo,
  SecurityAuditEvent,
  ApiKey,
  CreateApiKeyRequest,
  ApiKeyResponse,
} from "@/types/security";

export class SecurityServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "SecurityServiceError";
  }
}

export const securityService = {
  // Configuración general de seguridad
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await apiClient.get("/security/settings");
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  // 2FA
  async setup2FA(): Promise<TwoFactorSetup> {
    try {
      const response = await apiClient.post("/security/2fa/setup");
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  async enable2FA(verification: TwoFactorVerification): Promise<void> {
    try {
      await apiClient.post("/security/2fa/enable", verification);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  async disable2FA(verification: TwoFactorVerification): Promise<void> {
    try {
      await apiClient.post("/security/2fa/disable", verification);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  async generateBackupCodes(): Promise<string[]> {
    try {
      const response = await apiClient.post("/security/2fa/backup-codes");
      return response.data.codes;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  // Sesiones
  async getActiveSessions(): Promise<SessionInfo[]> {
    try {
      const response = await apiClient.get("/security/sessions");
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  async revokeSession(sessionId: string): Promise<void> {
    try {
      await apiClient.delete(`/security/sessions/${sessionId}`);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  async revokeAllOtherSessions(): Promise<void> {
    try {
      await apiClient.delete("/security/sessions/all");
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  // Auditoría de seguridad
  async getSecurityAuditLog(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ events: SecurityAuditEvent[]; total: number }> {
    try {
      const response = await apiClient.get("/security/audit-log", { params });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  // API Keys
  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const response = await apiClient.get("/security/api-keys");
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyResponse> {
    try {
      const response = await apiClient.post("/security/api-keys", data);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  async revokeApiKey(keyId: string): Promise<void> {
    try {
      await apiClient.delete(`/security/api-keys/${keyId}`);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  // Utilidades de seguridad
  async validatePassword(password: string): Promise<{
    isValid: boolean;
    score: number;
    feedback: string[];
  }> {
    try {
      const response = await apiClient.post("/security/validate-password", {
        password,
      });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new SecurityServiceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },
};
