import {
  Ticket,
  TicketStatus,
  TicketType,
  TicketPriority,
} from "../../../../domain/entities/ticket.entity";
import { Attachment } from "../../../../domain/entities/attachment.entity";

export interface TicketComment {
  id: string;
  content: string;
  ticket_id: string;
  created_by: any;
  created_at: Date;
  updated_at: Date;
}

export interface TicketMetrics {
  total: number;
  by_status: Record<TicketStatus, number>;
  by_priority: Record<TicketPriority, number>;
  average_resolution_time: number;
  sla_compliance: number;
}

export interface MetricsFilters {
  start_date?: string;
  end_date?: string;
  atm_id?: string;
  technician_id?: string;
}

export interface SearchResult {
  tickets: Ticket[];
  total: number;
}

export interface ITicketInputPort {
  findById(id: string): Promise<Ticket | null>;
  create(ticketData: Partial<Ticket>): Promise<Ticket>;
  update(id: string, ticketData: Partial<Ticket>): Promise<Ticket>;
  delete(id: string): Promise<void>;
  list(filters: TicketFilters): Promise<{ tickets: Ticket[]; total: number }>;

  // Métodos específicos para la gestión de tickets
  assignTechnician(id: string, technicianId: string): Promise<Ticket>;
  updateStatus(id: string, status: TicketStatus): Promise<Ticket>;
  addAttachment(id: string, attachmentData: any): Promise<Ticket>;
  findByAtm(atmId: string): Promise<Ticket[]>;
  findByTechnician(technicianId: string): Promise<Ticket[]>;
  getOverdueTickets(): Promise<Ticket[]>;
  getTicketsRequiringAttention(): Promise<Ticket[]>;

  // Nuevos métodos para comentarios
  addComment(id: string, commentData: Partial<TicketComment>): Promise<TicketComment>;
  getComments(id: string): Promise<TicketComment[]>;
  deleteComment(ticketId: string, commentId: string): Promise<void>;

  // Nuevos métodos para adjuntos
  getAttachments(id: string): Promise<Attachment[]>;
  deleteAttachment(ticketId: string, attachmentId: string): Promise<void>;

  // Métricas y búsqueda avanzada
  getMetrics(filters: MetricsFilters): Promise<TicketMetrics>;
  search(filters: TicketFilters): Promise<SearchResult>;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: TicketStatus[];
  type?: TicketType[];
  priority?: TicketPriority[];
  atmId?: string;
  technicianId?: string;
  fromDate?: Date;
  toDate?: Date;
  isOverdue?: boolean;
  searchTerm?: string;
}
