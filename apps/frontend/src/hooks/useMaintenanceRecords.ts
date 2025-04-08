import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  maintenanceService,
  MaintenanceError,
  type MaintenanceFilters,
  type CreateMaintenanceRecord,
  type PaginatedMaintenanceRecords,
  type MaintenanceRecord,
} from "@/services/api/maintenance";
import { toast } from "sonner";

interface UseMaintenanceFilters extends MaintenanceFilters {
  atmId?: string;
}

export function useMaintenanceRecords(
  initialFilters: UseMaintenanceFilters = {}
) {
  const [filters, setFilters] = useState<UseMaintenanceFilters>(initialFilters);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<
    PaginatedMaintenanceRecords,
    MaintenanceError
  >({
    queryKey: ["maintenance-records", filters],
    queryFn: () => {
      if (!filters.atmId) {
        throw new MaintenanceError(
          "Se requiere el ID del ATM",
          "VALIDATION_ERROR"
        );
      }
      const { atmId, ...restFilters } = filters;
      return maintenanceService.getMaintenanceHistory(atmId, restFilters);
    },
    enabled: !!filters.atmId,
    retry: (failureCount, error) => {
      if (error.code === "UNAUTHORIZED") return false;
      return failureCount < 3;
    },
  });

  const createMutation = useMutation<
    MaintenanceRecord,
    MaintenanceError,
    { atmId: string; data: CreateMaintenanceRecord }
  >({
    mutationFn: ({ atmId, data }) =>
      maintenanceService.createMaintenance(atmId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-records"] });
      toast.success("Mantenimiento registrado exitosamente");
    },
    onError: (error: MaintenanceError) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation<
    MaintenanceRecord,
    MaintenanceError,
    {
      atmId: string;
      maintenanceId: string;
      data: Partial<CreateMaintenanceRecord>;
    }
  >({
    mutationFn: ({ atmId, maintenanceId, data }) =>
      maintenanceService.updateMaintenance(atmId, maintenanceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-records"] });
      toast.success("Mantenimiento actualizado exitosamente");
    },
    onError: (error: MaintenanceError) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation<
    void,
    MaintenanceError,
    { atmId: string; maintenanceId: string }
  >({
    mutationFn: ({ atmId, maintenanceId }) =>
      maintenanceService.deleteMaintenance(atmId, maintenanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-records"] });
      toast.success("Mantenimiento eliminado exitosamente");
    },
    onError: (error: MaintenanceError) => {
      toast.error(error.message);
    },
  });

  const updateFilters = (newFilters: Partial<UseMaintenanceFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page:
        newFilters.page || (Object.keys(newFilters).length > 0 ? 1 : prev.page),
    }));
  };

  return {
    maintenanceRecords: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}
