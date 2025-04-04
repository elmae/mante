import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  atmService,
  type ATMFilters,
  type ATM,
  ATMError,
} from "@/services/api/atm";
import {
  maintenanceService,
  type CreateMaintenanceRecord,
  MaintenanceError,
} from "@/services/api/maintenance";
import { toast } from "sonner";

interface UseATMsError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export function useATMs(initialFilters: ATMFilters = {}) {
  const [filters, setFilters] = useState<ATMFilters>(initialFilters);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["atms", filters],
    queryFn: () => atmService.getATMs(filters),
    retry: (failureCount, error) => {
      if (error instanceof ATMError && error.code === "UNAUTHORIZED") {
        return false; // No reintentar errores de autenticación
      }
      return failureCount < 3; // Reintentar otras fallas hasta 3 veces
    },
  });

  // Mutation para crear un ATM
  const createMutation = useMutation({
    mutationFn: atmService.createATM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atms"] });
      toast.success("ATM creado exitosamente");
    },
    onError: (error: ATMError) => {
      toast.error(error.message);
    },
  });

  // Mutation para actualizar un ATM
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ATM> }) =>
      atmService.updateATM(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atms"] });
      toast.success("ATM actualizado exitosamente");
    },
    onError: (error: ATMError) => {
      toast.error(error.message);
    },
  });

  // Mutation para eliminar un ATM
  const deleteMutation = useMutation({
    mutationFn: atmService.deleteATM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atms"] });
      toast.success("ATM eliminado exitosamente");
    },
    onError: (error: ATMError) => {
      toast.error(error.message);
    },
  });

  // Mutation para registrar mantenimiento
  const maintenanceMutation = useMutation({
    mutationFn: ({
      atmId,
      data,
    }: {
      atmId: string;
      data: CreateMaintenanceRecord;
    }) => maintenanceService.createMaintenance(atmId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atms"] });
      toast.success("Mantenimiento registrado exitosamente");
    },
    onError: (error: MaintenanceError) => {
      toast.error(error.message);
    },
  });

  const updateFilters = (newFilters: Partial<ATMFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Resetear página si cambian otros filtros
      page:
        newFilters.page || (Object.keys(newFilters).length > 0 ? 1 : prev.page),
    }));
  };

  const formatError = (error: unknown): UseATMsError | null => {
    if (error instanceof ATMError || error instanceof MaintenanceError) {
      return {
        message: error.message,
        code: error.code,
        details: error.details,
      };
    }
    return null;
  };

  return {
    atms: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 1,
    filters,
    isLoading,
    error: formatError(error),
    updateFilters,
    refetch,
    // CRUD operations
    createATM: createMutation.mutate,
    updateATM: updateMutation.mutate,
    deleteATM: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: formatError(createMutation.error),
    updateError: formatError(updateMutation.error),
    deleteError: formatError(deleteMutation.error),
    // Maintenance operations
    registerMaintenance: maintenanceMutation.mutate,
    isRegistering: maintenanceMutation.isPending,
    maintenanceError: formatError(maintenanceMutation.error),
  };
}
