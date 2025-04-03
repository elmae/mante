import {
  Ticket,
  TicketStatus,
  TicketType,
  TicketPriority,
} from "../../../../domain/entities/ticket.entity";

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
