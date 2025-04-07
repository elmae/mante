import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MaintenanceFilters } from "@/types/maintenance";
import {
  maintenanceService,
  MaintenanceError,
} from "@/services/api/maintenance";
import { toast } from "sonner";

export function useMaintenance(initialFilters: MaintenanceFilters = {}) {
  const [filters, setFilters] = useState<MaintenanceFilters>(initialFilters);
  const queryClient = useQueryClient();

  // Query para obtener registros de mantenimiento
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["maintenance", "records", filters],
    queryFn: () => maintenanceService.getMaintenanceRecords(filters),
    retry: (failureCount, error) => {
      if (error instanceof MaintenanceError && error.code === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Query para programación de mantenimiento
  const {
    data: schedules,
    isLoading: isLoadingSchedules,
    error: schedulesError,
  } = useQuery({
    queryKey: ["maintenance", "schedules"],
    queryFn: maintenanceService.getMaintenanceSchedules,
  });

  // Query para estadísticas
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["maintenance", "stats"],
    queryFn: maintenanceService.getMaintenanceStats,
  });

  // Mutation para crear registro
  const createMutation = useMutation({
    mutationFn: maintenanceService.createMaintenanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Registro de mantenimiento creado exitosamente");
    },
    onError: (error: MaintenanceError) => {
      toast.error(error.message);
    },
  });

  // Mutation para actualizar registro
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof maintenanceService.updateMaintenanceRecord>[1];
    }) => maintenanceService.updateMaintenanceRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Registro de mantenimiento actualizado exitosamente");
    },
    onError: (error: MaintenanceError) => {
      toast.error(error.message);
    },
  });

  // Mutation para eliminar registro
  const deleteMutation = useMutation({
    mutationFn: maintenanceService.deleteMaintenanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
      toast.success("Registro de mantenimiento eliminado exitosamente");
    },
    onError: (error: MaintenanceError) => {
      toast.error(error.message);
    },
  });

  // Mutation para crear programación
  const createScheduleMutation = useMutation({
    mutationFn: maintenanceService.createMaintenanceSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", "schedules"] });
      toast.success("Programación de mantenimiento creada exitosamente");
    },
    onError: (error: MaintenanceError) => {
      toast.error(error.message);
    },
  });

  // Mutation para actualizar programación
  const updateScheduleMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof maintenanceService.updateMaintenanceSchedule>[1];
    }) => maintenanceService.updateMaintenanceSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", "schedules"] });
      toast.success("Programación de mantenimiento actualizada exitosamente");
    },
    onError: (error: MaintenanceError) => {
      toast.error(error.message);
    },
  });

  // Mutation para eliminar programación
  const deleteScheduleMutation = useMutation({
    mutationFn: maintenanceService.deleteMaintenanceSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", "schedules"] });
      toast.success("Programación de mantenimiento eliminada exitosamente");
    },
    onError: (error: MaintenanceError) => {
      toast.error(error.message);
    },
  });

  const updateFilters = (newFilters: Partial<MaintenanceFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page:
        newFilters.page || (Object.keys(newFilters).length > 0 ? 1 : prev.page),
    }));
  };

  return {
    // Datos y estado principal
    records: data?.data || [],
    totalRecords: data?.total || 0,
    currentPage: data?.page || 1,
    totalPages: data?.totalPages || 1,
    filters,
    isLoading,
    error,

    // Programación
    schedules: schedules || [],
    isLoadingSchedules,
    schedulesError,

    // Estadísticas
    stats,
    isLoadingStats,
    statsError,

    // Acciones
    updateFilters,
    refetch,
    createRecord: createMutation.mutate,
    updateRecord: updateMutation.mutate,
    deleteRecord: deleteMutation.mutate,
    createSchedule: createScheduleMutation.mutate,
    updateSchedule: updateScheduleMutation.mutate,
    deleteSchedule: deleteScheduleMutation.mutate,

    // Estado de mutaciones
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCreatingSchedule: createScheduleMutation.isPending,
    isUpdatingSchedule: updateScheduleMutation.isPending,
    isDeletingSchedule: deleteScheduleMutation.isPending,

    // Errores de mutaciones
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    createScheduleError: createScheduleMutation.error,
    updateScheduleError: updateScheduleMutation.error,
    deleteScheduleError: deleteScheduleMutation.error,
  };
}
