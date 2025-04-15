import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  maintenanceService,
  MaintenanceError,
} from "@/services/api/maintenance";
import type {
  MaintenanceFilters,
  CreateMaintenanceRecord,
  MaintenanceRecord,
  MaintenanceStats,
} from "@/types/maintenance";
import type { PaginatedMaintenanceRecords } from "@/services/api/maintenance";
import { toast } from "sonner";

type UseMaintenanceFilters = MaintenanceFilters;

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
    queryFn: () => maintenanceService.getMaintenanceRecords(filters),
    enabled: true,
    retry: (failureCount, error) => {
      if (error.code === "UNAUTHORIZED") return false;
      return failureCount < 3;
    },
  });

  const { data: statsData, isLoading: isLoadingStats } = useQuery<
    MaintenanceStats,
    MaintenanceError
  >({
    queryKey: ["maintenance-stats"],
    queryFn: () => maintenanceService.getMaintenanceStats(),
  });

  const createMutation = useMutation<
    MaintenanceRecord,
    MaintenanceError,
    CreateMaintenanceRecord
  >({
    mutationFn: (data) => maintenanceService.createMaintenanceRecord(data),
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
    { id: string; data: Partial<MaintenanceRecord> }
  >({
    mutationFn: ({ id, data }) =>
      maintenanceService.updateMaintenanceRecord(id, data),
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
    { maintenanceId: string }
  >({
    mutationFn: ({ maintenanceId }) =>
      maintenanceService.deleteMaintenanceRecord(maintenanceId),
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

  const defaultStats: MaintenanceStats = {
    totalPending: 0,
    totalInProgress: 0,
    totalCompleted: 0,
    totalCancelled: 0,
    averageDuration: 0,
    upcomingMaintenance: 0,
    overdueCount: 0,
    byType: {
      preventive: 0,
      corrective: 0,
      installation: 0,
    },
    byATM: [],
  };

  return {
    records: data?.data || [],
    totalRecords: data?.total || 0,
    currentPage: data?.page || 1,
    totalPages: data?.totalPages || 1,
    isLoading,
    error,
    filters,
    updateFilters,
    refetch,
    stats: statsData || defaultStats,
    isLoadingStats,
    create: (data: CreateMaintenanceRecord) => createMutation.mutate(data),
    update: (id: string, data: Partial<MaintenanceRecord>) =>
      updateMutation.mutate({ id, data }),
    delete: (id: string) => deleteMutation.mutate({ maintenanceId: id }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}
