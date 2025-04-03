import {
  MaintenanceRecord,
  MaintenanceType,
} from "../../../../domain/entities/maintenance-record.entity";
import { IMaintenanceInputPort } from "../../ports/input/maintenance.port";
import { IMaintenanceRepositoryPort } from "../../ports/output/maintenance-repository.port";
import {
  MaintenanceCompletionData,
  MaintenanceFilters,
  MaintenancePart,
  MaintenanceStats,
} from "../../ports/input/maintenance.port";

export class MaintenanceService implements IMaintenanceInputPort {
  constructor(
    private readonly maintenanceRepository: IMaintenanceRepositoryPort
  ) {}

  async findById(id: string): Promise<MaintenanceRecord | null> {
    return this.maintenanceRepository.findById(id);
  }

  async create(
    maintenanceData: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord> {
    // Validate that the ATM and ticket exist
    // This should be done in a validation service or similar
    if (!maintenanceData.atm_id || !maintenanceData.ticket_id) {
      throw new Error("ATM and Ticket IDs are required");
    }

    // Set default values if not provided
    maintenanceData.start_time = maintenanceData.start_time || new Date();
    maintenanceData.parts_used = maintenanceData.parts_used || [];

    return this.maintenanceRepository.create(maintenanceData);
  }

  async update(
    id: string,
    maintenanceData: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord> {
    const existingMaintenance = await this.findById(id);
    if (!existingMaintenance) {
      throw new Error("Maintenance record not found");
    }

    // Prevent updating certain fields if maintenance is completed
    if (existingMaintenance.end_time) {
      const forbiddenFields = [
        "start_time",
        "ticket_id",
        "atm_id",
        "technician_id",
      ];
      const attemptedForbiddenUpdate = forbiddenFields.some(
        (field) => field in maintenanceData
      );

      if (attemptedForbiddenUpdate) {
        throw new Error("Cannot update core fields of completed maintenance");
      }
    }

    return this.maintenanceRepository.update(id, maintenanceData);
  }

  async delete(id: string): Promise<void> {
    const maintenance = await this.findById(id);
    if (!maintenance) {
      throw new Error("Maintenance record not found");
    }

    if (maintenance.end_time) {
      throw new Error("Cannot delete completed maintenance records");
    }

    await this.maintenanceRepository.delete(id);
  }

  async list(
    filters: MaintenanceFilters
  ): Promise<{ records: MaintenanceRecord[]; total: number }> {
    return this.maintenanceRepository.list(filters);
  }

  async startMaintenance(
    ticketId: string,
    technicianId: string
  ): Promise<MaintenanceRecord> {
    // Check if ticket is already in maintenance
    const isInMaintenance =
      await this.maintenanceRepository.isTicketInMaintenance(ticketId);
    if (isInMaintenance) {
      throw new Error("Ticket is already in maintenance");
    }

    // Check if technician is available
    const isTechnicianAvailable =
      await this.maintenanceRepository.isTechnicianAvailable(technicianId);
    if (!isTechnicianAvailable) {
      throw new Error("Technician is not available");
    }

    // Get ATM ID from ticket
    const ticket = await this.findByTicket(ticketId);
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Create maintenance record
    const maintenanceData = {
      ticket_id: ticketId,
      atm_id: ticket.atm_id, // Get ATM ID from the ticket
      technician_id: technicianId,
      type: MaintenanceType.FIRST_LINE, // Default to first line maintenance
      start_time: new Date(),
    };

    return this.maintenanceRepository.startMaintenance(maintenanceData);
  }

  async completeMaintenance(
    id: string,
    completionData: MaintenanceCompletionData
  ): Promise<MaintenanceRecord> {
    const maintenance = await this.findById(id);
    if (!maintenance) {
      throw new Error("Maintenance record not found");
    }

    if (maintenance.end_time) {
      throw new Error("Maintenance is already completed");
    }

    // Validate completion data
    const { isValid, errors } =
      await this.maintenanceRepository.validateMaintenanceCompletion(id);
    if (!isValid) {
      throw new Error(`Invalid completion data: ${errors.join(", ")}`);
    }

    return this.maintenanceRepository.completeMaintenance(id, completionData);
  }

  async addParts(
    id: string,
    parts: MaintenancePart[]
  ): Promise<MaintenanceRecord> {
    const maintenance = await this.findById(id);
    if (!maintenance) {
      throw new Error("Maintenance record not found");
    }

    if (maintenance.end_time) {
      throw new Error("Cannot add parts to completed maintenance");
    }

    // Validate parts data
    if (!parts.every((part) => part.name && part.quantity > 0)) {
      throw new Error("Invalid parts data");
    }

    return this.maintenanceRepository.addParts(id, parts);
  }

  async findByTicket(ticketId: string): Promise<MaintenanceRecord | null> {
    return this.maintenanceRepository.findByTicket(ticketId);
  }

  async findByATM(atmId: string): Promise<MaintenanceRecord[]> {
    return this.maintenanceRepository.findByATM(atmId);
  }

  async findByTechnician(technicianId: string): Promise<MaintenanceRecord[]> {
    return this.maintenanceRepository.findByTechnician(technicianId);
  }

  async findInProgress(): Promise<MaintenanceRecord[]> {
    return this.maintenanceRepository.findInProgress();
  }

  async getMaintenanceStats(
    filters: MaintenanceFilters
  ): Promise<MaintenanceStats> {
    return this.maintenanceRepository.getMaintenanceStats(filters);
  }

  async getTicketsRequiringAttention(): Promise<MaintenanceRecord[]> {
    return this.maintenanceRepository.findInProgress();
  }

  private async validateMaintenanceData(
    maintenance: Partial<MaintenanceRecord>
  ): Promise<string[]> {
    const errors: string[] = [];

    if (!maintenance.ticket_id) {
      errors.push("Ticket ID is required");
    }

    if (!maintenance.atm_id) {
      errors.push("ATM ID is required");
    }

    if (!maintenance.technician_id) {
      errors.push("Technician ID is required");
    }

    if (!maintenance.type) {
      errors.push("Maintenance type is required");
    }

    return errors;
  }
}
