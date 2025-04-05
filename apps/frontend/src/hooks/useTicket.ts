import { useState, useEffect } from "react";
import { Ticket } from "@/types/entities";
import { api } from "@/services/api";

export const useTicket = (id?: string) => {
  const [data, setData] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/tickets/${id}`);
      setData(response.data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicket = async (ticketData: Partial<Ticket>) => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await api.put(`/tickets/${id}`, ticketData);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createTicket = async (
    ticketData: Omit<Ticket, "id" | "created_at" | "updated_at">
  ) => {
    try {
      setIsLoading(true);
      const response = await api.post("/tickets", ticketData);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch: fetchTicket,
    updateTicket,
    createTicket,
  };
};
