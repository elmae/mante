import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { securityService, SecurityServiceError } from "@/services/api/security";
import type {
  TwoFactorVerification,
  CreateApiKeyRequest,
  ApiKeyResponse,
  TwoFactorSetup,
} from "@/types/security";
import { toast } from "sonner";

export interface SecurityAuditParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export function useSecurity(auditParams: SecurityAuditParams = {}) {
  const queryClient = useQueryClient();
  const [auditFilters, setAuditFilters] =
    useState<SecurityAuditParams>(auditParams);

  // Configuración de seguridad
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError,
  } = useQuery({
    queryKey: ["security", "settings"],
    queryFn: securityService.getSecuritySettings,
  });

  // Sesiones activas
  const {
    data: sessions,
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useQuery({
    queryKey: ["security", "sessions"],
    queryFn: securityService.getActiveSessions,
  });

  // Log de auditoría
  const {
    data: auditLog,
    isLoading: isLoadingAuditLog,
    error: auditError,
  } = useQuery({
    queryKey: ["security", "audit", auditFilters],
    queryFn: () => securityService.getSecurityAuditLog(auditFilters),
  });

  // API Keys
  const {
    data: apiKeys,
    isLoading: isLoadingApiKeys,
    error: apiKeysError,
  } = useQuery({
    queryKey: ["security", "api-keys"],
    queryFn: securityService.getApiKeys,
  });

  // Mutations para 2FA
  const setup2FAMutation = useMutation<TwoFactorSetup, SecurityServiceError>({
    mutationFn: securityService.setup2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "settings"] });
      toast.success("Configuración 2FA iniciada exitosamente");
    },
    onError: (error: SecurityServiceError) => {
      toast.error(error.message);
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: securityService.enable2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "settings"] });
      toast.success("2FA activado exitosamente");
    },
    onError: (error: SecurityServiceError) => {
      toast.error(error.message);
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: securityService.disable2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "settings"] });
      toast.success("2FA desactivado exitosamente");
    },
    onError: (error: SecurityServiceError) => {
      toast.error(error.message);
    },
  });

  // Mutations para sesiones
  const revokeSessionMutation = useMutation({
    mutationFn: securityService.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "sessions"] });
      toast.success("Sesión revocada exitosamente");
    },
    onError: (error: SecurityServiceError) => {
      toast.error(error.message);
    },
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: securityService.revokeAllOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "sessions"] });
      toast.success("Todas las otras sesiones fueron revocadas");
    },
    onError: (error: SecurityServiceError) => {
      toast.error(error.message);
    },
  });

  // Mutations para API Keys
  const createApiKeyMutation = useMutation<
    ApiKeyResponse,
    SecurityServiceError,
    CreateApiKeyRequest
  >({
    mutationFn: securityService.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "api-keys"] });
      toast.success("API Key creada exitosamente");
    },
    onError: (error: SecurityServiceError) => {
      toast.error(error.message);
    },
  });

  const revokeApiKeyMutation = useMutation({
    mutationFn: securityService.revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security", "api-keys"] });
      toast.success("API Key revocada exitosamente");
    },
    onError: (error: SecurityServiceError) => {
      toast.error(error.message);
    },
  });

  return {
    // Estado general
    settings,
    sessions,
    auditLog: auditLog?.events || [],
    totalAuditEvents: auditLog?.total || 0,
    apiKeys: apiKeys || [],
    auditFilters,

    // Estado de carga
    isLoadingSettings,
    isLoadingSessions,
    isLoadingAuditLog,
    isLoadingApiKeys,

    // Errores
    settingsError,
    sessionsError,
    auditError,
    apiKeysError,

    // Acciones 2FA
    setup2FA: () => setup2FAMutation.mutateAsync(),
    enable2FA: (verification: TwoFactorVerification) =>
      enable2FAMutation.mutate(verification),
    disable2FA: (verification: TwoFactorVerification) =>
      disable2FAMutation.mutate(verification),
    isSettingUp2FA: setup2FAMutation.isPending,
    isEnabling2FA: enable2FAMutation.isPending,
    isDisabling2FA: disable2FAMutation.isPending,

    // Acciones sesiones
    revokeSession: revokeSessionMutation.mutate,
    revokeAllOtherSessions: revokeAllSessionsMutation.mutate,
    isRevokingSession: revokeSessionMutation.isPending,
    isRevokingAllSessions: revokeAllSessionsMutation.isPending,

    // Acciones API Keys
    createApiKey: (data: CreateApiKeyRequest) =>
      createApiKeyMutation.mutateAsync(data),
    revokeApiKey: revokeApiKeyMutation.mutate,
    isCreatingApiKey: createApiKeyMutation.isPending,
    isRevokingApiKey: revokeApiKeyMutation.isPending,

    // Utilidades
    updateAuditFilters: setAuditFilters,
  };
}
