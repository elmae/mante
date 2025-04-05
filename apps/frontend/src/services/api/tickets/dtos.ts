import { Ticket, TicketComment, TicketAttachment } from "@/types/entities";

export interface CreateTicketDto {
  atmId: string;
  type: "preventive" | "corrective" | "onDemand";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  dueDate?: Date;
}

export interface UpdateTicketDto {
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  dueDate?: Date;
  status?: "open" | "assigned" | "inProgress" | "resolved" | "closed";
}

export interface TicketFilterDto {
  atmId?: string;
  clientId?: string;
  technicianId?: string;
  type?: "preventive" | "corrective" | "onDemand";
  priority?: "low" | "medium" | "high" | "critical";
  status?: "open" | "assigned" | "inProgress" | "resolved" | "closed";
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TicketMetricsFilter {
  clientId?: string;
  technicianId?: string;
  type?: "preventive" | "corrective" | "onDemand";
  priority?: "low" | "medium" | "high" | "critical";
  status?: "open" | "assigned" | "inProgress" | "resolved" | "closed";
  fromDate?: Date;
  toDate?: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TicketMetricsResponse {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  closed: number;
  overdue: number;
  avgResolutionTime: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  byType: {
    preventive: number;
    corrective: number;
    onDemand: number;
  };
}
