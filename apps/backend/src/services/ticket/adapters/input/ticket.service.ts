import {
  Ticket,
  TicketStatus,
  TicketPriority,
} from "../../../../domain/entities/ticket.entity";
import { ITicketInputPort, TicketFilters } from "../../ports/input/ticket.port";
import { ITicketRepositoryPort } from "../../ports/output/ticket-repository.port";

export class TicketService implements ITicketInputPort {
  constructor(private readonly ticketRepository: ITicketRepositoryPort) {}

  async findById(id: string): Promise<Ticket | null> {
    return this.ticketRepository.findById(id);
  }

  async create(ticketData: Partial<Ticket>): Promise<Ticket> {
    // Validaciones de negocio
    if (!ticketData.atm_id) {
      throw new Error("ATM ID is required");
    }

    if (!ticketData.title || !ticketData.description) {
      throw new Error("Title and description are required");
    }

    // Establecer valores por defecto si no se proporcionan
    if (!ticketData.status) {
      ticketData.status = TicketStatus.OPEN;
    }

    return this.ticketRepository.create(ticketData);
  }

  async update(id: string, ticketData: Partial<Ticket>): Promise<Ticket> {
    const existingTicket = await this.findById(id);
    if (!existingTicket) {
      throw new Error("Ticket not found");
    }

    // Si se está actualizando el estado, validar la transición
    if (ticketData.status && ticketData.status !== existingTicket.status) {
      const isValidTransition =
        await this.ticketRepository.validateStatusTransition(
          id,
          ticketData.status
        );
      if (!isValidTransition) {
        throw new Error("Invalid status transition");
      }
    }

    return this.ticketRepository.update(id, ticketData);
  }

  async delete(id: string): Promise<void> {
    const existingTicket = await this.findById(id);
    if (!existingTicket) {
      throw new Error("Ticket not found");
    }

    // Solo se pueden eliminar tickets en estado OPEN
    if (existingTicket.status !== TicketStatus.OPEN) {
      throw new Error("Can only delete tickets in OPEN status");
    }

    await this.ticketRepository.delete(id);
  }

  async list(
    filters: TicketFilters
  ): Promise<{ tickets: Ticket[]; total: number }> {
    return this.ticketRepository.list(filters);
  }

  async assignTechnician(id: string, technicianId: string): Promise<Ticket> {
    const ticket = await this.findById(id);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const canBeAssigned =
      await this.ticketRepository.checkAssignmentEligibility(id);
    if (!canBeAssigned) {
      throw new Error("Ticket cannot be assigned in its current state");
    }

    return this.update(id, {
      assigned_to: technicianId,
      status: TicketStatus.ASSIGNED,
    });
  }

  async updateStatus(id: string, status: TicketStatus): Promise<Ticket> {
    const ticket = await this.findById(id);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const isValidTransition =
      await this.ticketRepository.validateStatusTransition(id, status);
    if (!isValidTransition) {
      throw new Error("Invalid status transition");
    }

    return this.update(id, { status });
  }

  async addAttachment(id: string, attachmentData: any): Promise<Ticket> {
    const ticket = await this.findById(id);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    return this.ticketRepository.addAttachment(id, attachmentData);
  }

  async findByAtm(atmId: string): Promise<Ticket[]> {
    return this.ticketRepository.findByAtm(atmId);
  }

  async findByTechnician(technicianId: string): Promise<Ticket[]> {
    return this.ticketRepository.findByTechnician(technicianId);
  }

  async getOverdueTickets(): Promise<Ticket[]> {
    return this.ticketRepository.findOverdue();
  }

  async getTicketsRequiringAttention(): Promise<Ticket[]> {
    return this.ticketRepository.findRequiringAttention();
  }

  // Métodos de utilidad privados
  private calculatePriority(ticket: Partial<Ticket>): TicketPriority {
    // Implementar lógica de cálculo de prioridad basada en diferentes factores
    // Por ejemplo: tipo de ATM, historial de problemas, SLA, etc.
    return ticket.priority || TicketPriority.MEDIUM;
  }

  private async validateTicketData(ticket: Partial<Ticket>): Promise<void> {
    // Implementar validaciones adicionales de negocio
    // Por ejemplo: verificar que el ATM existe, que el técnico está disponible, etc.
  }

  private async notifyStakeholders(ticket: Ticket): Promise<void> {
    // Implementar notificaciones a las partes interesadas
    // Por ejemplo: enviar emails, notificaciones push, etc.
  }
}
