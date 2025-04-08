import { apiClient, handleApiError } from "./client";
import { Ticket } from "@/types/entities";

export interface TicketFilters {
  status?: Ticket["status"];
  priority?: Ticket["priority"];
  type?: Ticket["type"];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class TicketError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "TicketError";
  }
}

export const ticketService = {
  async getTickets(filters: TicketFilters = {}): Promise<PaginatedTickets> {
    try {
      const response = await apiClient.get("/tickets", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new TicketError(apiError.message, apiError.code, apiError.details);
    }
  },

  async getTicket(id: string): Promise<Ticket> {
    try {
      const response = await apiClient.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new TicketError(apiError.message, apiError.code, apiError.details);
    }
  },

  async createTicket(
    data: Omit<Ticket, "id" | "created_at" | "updated_at">
  ): Promise<Ticket> {
    try {
      const response = await apiClient.post("/tickets", data);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new TicketError(apiError.message, apiError.code, apiError.details);
    }
  },

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
    try {
      const response = await apiClient.patch(`/tickets/${id}`, data);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new TicketError(apiError.message, apiError.code, apiError.details);
    }
  },

  async deleteTicket(id: string): Promise<void> {
    try {
      await apiClient.delete(`/tickets/${id}`);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new TicketError(apiError.message, apiError.code, apiError.details);
    }
  },

  async assignTicket(id: string, userId: string): Promise<Ticket> {
    try {
      const response = await apiClient.post(`/tickets/${id}/assign`, {
        userId,
      });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new TicketError(apiError.message, apiError.code, apiError.details);
    }
  },

  async changeStatus(id: string, status: Ticket["status"]): Promise<Ticket> {
    try {
      const response = await apiClient.post(`/tickets/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new TicketError(apiError.message, apiError.code, apiError.details);
    }
  },

  async getTicketStats(): Promise<{
    totalOpen: number;
    totalInProgress: number;
    totalClosed: number;
    averageResolutionTime: string;
  }> {
    try {
      const response = await apiClient.get("/tickets/stats");
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new TicketError(apiError.message, apiError.code, apiError.details);
    }
  },
};
