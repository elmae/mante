import { useState, useEffect } from "react";
import { Ticket } from "@/types/entities";
import { api } from "@/services/api";
import { ITicketFilters } from "@/components/tickets/TicketFilters";

export interface UseTicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: Error | null;
  filters: ITicketFilters;
  updateFilters: (newFilters: ITicketFilters) => void;
  setPage: (page: number) => void;
  refreshData: () => Promise<void>;
}

export const useTickets = (
  initialFilters: ITicketFilters = {}
): UseTicketsResponse => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ITicketFilters>(initialFilters);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      // Añadir filtros a la query
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.status?.length)
        queryParams.append("status", filters.status.join(","));
      if (filters.priority?.length)
        queryParams.append("priority", filters.priority.join(","));
      if (filters.type?.length)
        queryParams.append("type", filters.type.join(","));
      if (filters.atm_id) queryParams.append("atm_id", filters.atm_id);
      if (filters.assigned_to)
        queryParams.append("assigned_to", filters.assigned_to);
      if (filters.date_from)
        queryParams.append("date_from", filters.date_from.toISOString());
      if (filters.date_to)
        queryParams.append("date_to", filters.date_to.toISOString());
      if (filters.met_sla !== undefined)
        queryParams.append("met_sla", filters.met_sla.toString());

      const response = await api.get(`/tickets?${queryParams.toString()}`);

      setTickets(response.data.items);
      setTotal(response.data.total);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, filters]);

  const updateFilters = (newFilters: ITicketFilters) => {
    setPage(1); // Reset to first page when filters change
    setFilters(newFilters);
  };

  return {
    tickets,
    total,
    page,
    limit,
    isLoading,
    error,
    filters,
    updateFilters,
    setPage,
    refreshData: fetchTickets,
  };
};
