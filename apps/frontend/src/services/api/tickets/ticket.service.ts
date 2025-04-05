import { Ticket, TicketComment, TicketAttachment } from "@/types/entities";
import { apiClient } from "@/services/api/client";
import {
  CreateTicketDto,
  UpdateTicketDto,
  TicketFilterDto,
  TicketMetricsFilter,
  PaginatedResponse,
  TicketMetricsResponse,
} from ".";

export class TicketService {
  private basePath = "/tickets";

  // Operaciones CRUD básicas
  async create(ticketData: CreateTicketDto): Promise<Ticket> {
    const response = await apiClient.post(`${this.basePath}`, ticketData);
    return response.data;
  }

  async getById(id: string): Promise<Ticket> {
    const response = await apiClient.get(`${this.basePath}/${id}`);
    return response.data;
  }

  async update(id: string, ticketData: UpdateTicketDto): Promise<Ticket> {
    const response = await apiClient.patch(
      `${this.basePath}/${id}`,
      ticketData
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  // Listado y búsqueda
  async list(filters: TicketFilterDto): Promise<PaginatedResponse<Ticket>> {
    const response = await apiClient.get(`${this.basePath}`, {
      params: filters,
    });
    return response.data;
  }

  async search(filters: TicketFilterDto): Promise<PaginatedResponse<Ticket>> {
    const response = await apiClient.get(`${this.basePath}/search`, {
      params: filters,
    });
    return response.data;
  }

  // Gestión de técnicos y estado
  async assignTechnician(id: string, technicianId: string): Promise<Ticket> {
    const response = await apiClient.post(`${this.basePath}/${id}/assign`, {
      technicianId,
    });
    return response.data;
  }

  async updateStatus(id: string, status: string): Promise<Ticket> {
    const response = await apiClient.patch(`${this.basePath}/${id}/status`, {
      status,
    });
    return response.data;
  }

  // Comentarios
  async addComment(id: string, content: string): Promise<TicketComment> {
    const response = await apiClient.post(`${this.basePath}/${id}/comments`, {
      content,
    });
    return response.data;
  }

  async getComments(id: string): Promise<TicketComment[]> {
    const response = await apiClient.get(`${this.basePath}/${id}/comments`);
    return response.data;
  }

  async deleteComment(ticketId: string, commentId: string): Promise<void> {
    await apiClient.delete(
      `${this.basePath}/${ticketId}/comments/${commentId}`
    );
  }

  // Adjuntos
  async addAttachment(id: string, file: File): Promise<TicketAttachment> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      `${this.basePath}/${id}/attachments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async getAttachments(id: string): Promise<TicketAttachment[]> {
    const response = await apiClient.get(`${this.basePath}/${id}/attachments`);
    return response.data;
  }

  async deleteAttachment(
    ticketId: string,
    attachmentId: string
  ): Promise<void> {
    await apiClient.delete(
      `${this.basePath}/${ticketId}/attachments/${attachmentId}`
    );
  }

  // Métricas y reportes
  async getMetrics(
    filters: TicketMetricsFilter
  ): Promise<TicketMetricsResponse> {
    const response = await apiClient.get(`${this.basePath}/metrics`, {
      params: filters,
    });
    return response.data;
  }

  async getOverdue(): Promise<Ticket[]> {
    const response = await apiClient.get(`${this.basePath}/overdue`);
    return response.data;
  }

  async getRequiringAttention(): Promise<Ticket[]> {
    const response = await apiClient.get(`${this.basePath}/attention-required`);
    return response.data;
  }

  // Consultas específicas
  async getByAtm(atmId: string): Promise<Ticket[]> {
    const response = await apiClient.get(`${this.basePath}/atm/${atmId}`);
    return response.data;
  }

  async getByTechnician(technicianId: string): Promise<Ticket[]> {
    const response = await apiClient.get(
      `${this.basePath}/technician/${technicianId}`
    );
    return response.data;
  }
}

export const ticketService = new TicketService();
