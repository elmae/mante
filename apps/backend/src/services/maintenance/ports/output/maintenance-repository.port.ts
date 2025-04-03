import {
  MaintenanceRecord,
  MaintenanceType,
} from "../../../../domain/entities/maintenance-record.entity";
import {
  MaintenanceFilters,
  MaintenanceStats,
  MaintenancePart,
} from "../input/maintenance.port";

export interface IMaintenanceRepositoryPort {
  findById(id: string): Promise<MaintenanceRecord | null>;
  create(
    maintenanceData: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord>;
  update(
    id: string,
    maintenanceData: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord>;
  delete(id: string): Promise<void>;
  list(
    filters: MaintenanceFilters
  ): Promise<{ records: MaintenanceRecord[]; total: number }>;

  // Consultas específicas
  findByTicket(ticketId: string): Promise<MaintenanceRecord | null>;
  findByATM(atmId: string): Promise<MaintenanceRecord[]>;
  findByTechnician(technicianId: string): Promise<MaintenanceRecord[]>;
  findInProgress(): Promise<MaintenanceRecord[]>;

  // Consultas de estado y validación
  isTicketInMaintenance(ticketId: string): Promise<boolean>;
  isTechnicianAvailable(technicianId: string): Promise<boolean>;

  // Operaciones de mantenimiento
  startMaintenance(data: {
    ticket_id: string;
    atm_id: string;
    technician_id: string;
    type: MaintenanceType;
    start_time: Date;
  }): Promise<MaintenanceRecord>;

  completeMaintenance(
    id: string,
    data: {
      diagnosis: string;
      work_performed: string;
      parts_used: MaintenancePart[];
      end_time: Date;
    }
  ): Promise<MaintenanceRecord>;

  addParts(id: string, parts: MaintenancePart[]): Promise<MaintenanceRecord>;

  // Análisis y estadísticas
  getMaintenanceStats(filters: MaintenanceFilters): Promise<MaintenanceStats>;
  getAverageDuration(filters?: MaintenanceFilters): Promise<number>;
  getMostUsedParts(
    limit?: number
  ): Promise<Array<{ name: string; count: number }>>;
  getTechnicianPerformance(technicianId: string): Promise<{
    completed_count: number;
    average_duration: number;
    most_common_type: MaintenanceType;
  }>;

  // Consultas de auditoría
  getMaintenanceHistory(atmId: string): Promise<{
    total_count: number;
    last_maintenance: Date | null;
    maintenance_types: Record<MaintenanceType, number>;
    total_parts_used: number;
    common_issues: string[];
  }>;

  // Métodos de validación
  validateMaintenanceCompletion(id: string): Promise<{
    isValid: boolean;
    errors: string[];
  }>;
}
