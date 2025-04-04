import {
  Ticket,
  TicketStatus,
} from "../../../../domain/entities/ticket.entity";
import { Comment } from "../../../../domain/entities/comment.entity";
import {
  TicketFilters,
  TicketMetrics,
  MetricsFilters,
  SearchResult,
} from "../input/ticket.port";

export interface ITicketRepositoryPort {
  // Operaciones CRUD básicas
  findById(id: string): Promise<Ticket | null>;
  create(ticketData: Partial<Ticket>): Promise<Ticket>;
  update(id: string, ticketData: Partial<Ticket>): Promise<Ticket>;
  delete(id: string): Promise<void>;
  list(filters: TicketFilters): Promise<SearchResult>;

  // Métodos específicos para consultas
  findByAtm(atmId: string): Promise<Ticket[]>;
  findByTechnician(technicianId: string): Promise<Ticket[]>;
  findOverdue(): Promise<Ticket[]>;
  findRequiringAttention(): Promise<Ticket[]>;

  // Métodos para comentarios
  addComment(ticketId: string, commentData: Partial<Comment>): Promise<Comment>;
  getComments(ticketId: string): Promise<Comment[]>;
  deleteComment(ticketId: string, commentId: string): Promise<void>;

  // Métodos para adjuntos
  addAttachment(ticketId: string, attachmentData: any): Promise<Ticket>;
  getAttachments(ticketId: string): Promise<any[]>;
  deleteAttachment(ticketId: string, attachmentId: string): Promise<void>;

  // Búsqueda y métricas
  search(filters: TicketFilters): Promise<SearchResult>;
  getMetrics(filters: MetricsFilters): Promise<TicketMetrics>;

  // Validaciones de estado
  validateStatusTransition(
    ticketId: string,
    newStatus: TicketStatus
  ): Promise<boolean>;
  checkAssignmentEligibility(ticketId: string): Promise<boolean>;
}
