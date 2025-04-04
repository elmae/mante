import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { atmService, type ATMFilters, type ATM } from "@/services/api/atm";

export function useATMs(initialFilters: ATMFilters = {}) {
  const [filters, setFilters] = useState<ATMFilters>(initialFilters);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["atms", filters],
    queryFn: () => atmService.getATMs(filters),
  });

  // Mutation para crear un ATM
  const createMutation = useMutation({
    mutationFn: atmService.createATM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atms"] });
    },
  });

  // Mutation para actualizar un ATM
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ATM> }) =>
      atmService.updateATM(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atms"] });
    },
  });

  // Mutation para eliminar un ATM
  const deleteMutation = useMutation({
    mutationFn: atmService.deleteATM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atms"] });
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

  return {
    atms: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 1,
    filters,
    isLoading,
    error,
    updateFilters,
    refetch,
    createATM: createMutation.mutate,
    updateATM: updateMutation.mutate,
    deleteATM: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
}
