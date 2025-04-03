import {
  MaintenanceRecord,
  MaintenanceType,
} from "../../../../domain/entities/maintenance-record.entity";

export interface IMaintenanceInputPort {
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

  // Métodos específicos para mantenimiento
  startMaintenance(
    ticketId: string,
    technicianId: string
  ): Promise<MaintenanceRecord>;
  completeMaintenance(
    id: string,
    completionData: MaintenanceCompletionData
  ): Promise<MaintenanceRecord>;
  addParts(id: string, parts: MaintenancePart[]): Promise<MaintenanceRecord>;
  findByTicket(ticketId: string): Promise<MaintenanceRecord | null>;
  findByATM(atmId: string): Promise<MaintenanceRecord[]>;
  findByTechnician(technicianId: string): Promise<MaintenanceRecord[]>;
  findInProgress(): Promise<MaintenanceRecord[]>;
  getMaintenanceStats(filters: MaintenanceFilters): Promise<MaintenanceStats>;
}

export interface MaintenanceFilters {
  page?: number;
  limit?: number;
  type?: MaintenanceType[];
  atmId?: string;
  technicianId?: string;
  fromDate?: Date;
  toDate?: Date;
  isComplete?: boolean;
  ticketId?: string;
}

export interface MaintenancePart {
  name: string;
  quantity: number;
  serialNumber?: string;
  notes?: string;
}

export interface MaintenanceCompletionData {
  diagnosis: string;
  work_performed: string;
  parts_used: MaintenancePart[];
  end_time: Date;
}

export interface MaintenanceStats {
  totalCount: number;
  completedCount: number;
  averageDuration: number;
  byType: Record<MaintenanceType, number>;
  mostCommonParts: Array<{
    name: string;
    count: number;
  }>;
  technicianPerformance: Array<{
    technician_id: string;
    completed_count: number;
    average_duration: number;
  }>;
}
