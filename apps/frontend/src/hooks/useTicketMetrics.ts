import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { TicketStatus, TicketPriority } from "@/types/entities";

interface TicketMetrics {
  total: number;
  by_status: Record<TicketStatus, number>;
  by_priority: Record<TicketPriority, number>;
  average_resolution_time: number;
  sla_compliance: number;
}

interface MetricsFilters {
  start_date?: string;
  end_date?: string;
  atm_id?: string;
  technician_id?: string;
}

export const useTicketMetrics = (filters?: MetricsFilters) => {
  const [data, setData] = useState<TicketMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, [
    filters?.start_date,
    filters?.end_date,
    filters?.atm_id,
    filters?.technician_id,
  ]);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters?.start_date) params.append("start_date", filters.start_date);
      if (filters?.end_date) params.append("end_date", filters.end_date);
      if (filters?.atm_id) params.append("atm_id", filters.atm_id);
      if (filters?.technician_id)
        params.append("technician_id", filters.technician_id);

      const response = await api.get(`/tickets/metrics?${params.toString()}`);
      setData(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch: fetchMetrics,
  };
};
