"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService, TicketError } from "@/services/api/ticket";
import type { TicketFilters } from "@/services/api/ticket";
import { toast } from "sonner";
import type { Ticket } from "@/types/entities";

export function useTickets(initialFilters: TicketFilters = {}) {
  const [filters, setFilters] = useState<TicketFilters>(initialFilters);
  const queryClient = useQueryClient();

  // Query para obtener tickets con filtros
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tickets", filters],
    queryFn: () => ticketService.getTickets(filters),
    retry: (failureCount, error) => {
      if (error instanceof TicketError && error.code === "UNAUTHORIZED") {
        return false; // No reintentar errores de autenticación
      }
      return failureCount < 3; // Reintentar otras fallas hasta 3 veces
    },
  });

  // Query para estadísticas
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["tickets", "stats"],
    queryFn: ticketService.getTicketStats,
  });

  // Mutation para crear ticket
  const createMutation = useMutation({
    mutationFn: ticketService.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket creado exitosamente");
    },
    onError: (error: TicketError) => {
      toast.error(error.message);
    },
  });

  // Mutation para actualizar ticket
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ticket> }) =>
      ticketService.updateTicket(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket actualizado exitosamente");
    },
    onError: (error: TicketError) => {
      toast.error(error.message);
    },
  });

  // Mutation para eliminar ticket
  const deleteMutation = useMutation({
    mutationFn: ticketService.deleteTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket eliminado exitosamente");
    },
    onError: (error: TicketError) => {
      toast.error(error.message);
    },
  });

  // Mutation para asignar ticket
  const assignMutation = useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      ticketService.assignTicket(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket asignado exitosamente");
    },
    onError: (error: TicketError) => {
      toast.error(error.message);
    },
  });

  // Mutation para cambiar estado
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Ticket["status"] }) =>
      ticketService.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Estado actualizado exitosamente");
    },
    onError: (error: TicketError) => {
      toast.error(error.message);
    },
  });

  const updateFilters = (newFilters: Partial<TicketFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page:
        newFilters.page || (Object.keys(newFilters).length > 0 ? 1 : prev.page),
    }));
  };

  return {
    // Datos y estado de la consulta principal
    tickets: data?.data || [],
    totalTickets: data?.total || 0,
    currentPage: data?.page || 1,
    totalPages: data?.totalPages || 1,
    filters,
    isLoading,
    error,

    // Estadísticas
    stats,
    isLoadingStats,
    statsError,

    // Acciones
    updateFilters,
    refetch,
    createTicket: createMutation.mutate,
    updateTicket: updateMutation.mutate,
    deleteTicket: deleteMutation.mutate,
    assignTicket: assignMutation.mutate,
    changeStatus: statusMutation.mutate,

    // Estado de las mutaciones
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAssigning: assignMutation.isPending,
    isChangingStatus: statusMutation.isPending,

    // Errores de las mutaciones
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    assignError: assignMutation.error,
    statusError: statusMutation.error,
  };
}
