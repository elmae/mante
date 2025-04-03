import {
  Ticket,
  TicketStatus,
  TicketType,
  TicketPriority,
} from "../../../../domain/entities/ticket.entity";
import { TicketFilters } from "../input/ticket.port";

export interface ITicketRepositoryPort {
  findById(id: string): Promise<Ticket | null>;
  create(ticketData: Partial<Ticket>): Promise<Ticket>;
  update(id: string, ticketData: Partial<Ticket>): Promise<Ticket>;
  delete(id: string): Promise<void>;
  list(filters: TicketFilters): Promise<{ tickets: Ticket[]; total: number }>;

  // Métodos específicos para consultas
  findByAtm(atmId: string): Promise<Ticket[]>;
  findByTechnician(technicianId: string): Promise<Ticket[]>;
  findByStatus(status: TicketStatus[]): Promise<Ticket[]>;
  findByType(type: TicketType[]): Promise<Ticket[]>;
  findByPriority(priority: TicketPriority[]): Promise<Ticket[]>;
  findOverdue(): Promise<Ticket[]>;
  findRequiringAttention(): Promise<Ticket[]>;

  // Métodos para reportes y análisis
  getTicketStats(filters: TicketFilters): Promise<{
    total: number;
    byStatus: Record<TicketStatus, number>;
    byType: Record<TicketType, number>;
    byPriority: Record<TicketPriority, number>;
    averageResolutionTime: number;
    overdueCount: number;
  }>;

  // Métodos para relaciones
  addAttachment(ticketId: string, attachmentData: any): Promise<Ticket>;
  getAttachments(ticketId: string): Promise<any[]>;
  getMaintenanceRecord(ticketId: string): Promise<any | null>;

  // Búsqueda avanzada
  search(query: string): Promise<Ticket[]>;
  findByDateRange(fromDate: Date, toDate: Date): Promise<Ticket[]>;
  findByMultipleStatuses(statuses: TicketStatus[]): Promise<Ticket[]>;

  // Validaciones de estado
  validateStatusTransition(
    ticketId: string,
    newStatus: TicketStatus
  ): Promise<boolean>;
  checkAssignmentEligibility(ticketId: string): Promise<boolean>;
}
