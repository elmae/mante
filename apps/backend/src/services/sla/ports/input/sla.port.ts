import {
  SLAConfig,
  MaintenanceType,
} from "../../../../domain/entities/sla-config.entity";

export interface ISlaInputPort {
  findById(id: string): Promise<SLAConfig | null>;
  create(slaData: Partial<SLAConfig>): Promise<SLAConfig>;
  update(id: string, slaData: Partial<SLAConfig>): Promise<SLAConfig>;
  delete(id: string): Promise<void>;
  list(filters: SLAFilters): Promise<{ configs: SLAConfig[]; total: number }>;

  // Métodos específicos de SLA
  findByZone(zoneId: string): Promise<SLAConfig[]>;
  findByClient(clientId: string): Promise<SLAConfig[]>;
  findByMaintenanceType(type: MaintenanceType): Promise<SLAConfig[]>;
  calculateCompliance(
    slaId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SLAComplianceResult>;
  validateSLA(slaId: string, ticketId: string): Promise<SLAValidationResult>;
  getActiveSLAs(): Promise<SLAConfig[]>;
}

export interface SLAFilters {
  page?: number;
  limit?: number;
  zoneId?: string;
  clientId?: string;
  maintenanceType?: MaintenanceType;
  fromDate?: Date;
  toDate?: Date;
  isActive?: boolean;
}

export interface SLAComplianceResult {
  sla: SLAConfig;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalTickets: number;
    responseTimeCompliance: number;
    resolutionTimeCompliance: number;
    averageResponseTime: number;
    averageResolutionTime: number;
  };
  details: Array<{
    ticketId: string;
    responseTime: number;
    resolutionTime: number;
    metResponseSLA: boolean;
    metResolutionSLA: boolean;
  }>;
}

export interface SLAValidationResult {
  isValid: boolean;
  violations: Array<{
    type: "response_time" | "resolution_time";
    expected: number;
    actual: number;
    difference: number;
  }>;
  recommendations: string[];
}

export interface SLAStatistics {
  totalSLAs: number;
  activeSLAs: number;
  complianceByType: Record<
    MaintenanceType,
    {
      total: number;
      compliant: number;
      percentage: number;
    }
  >;
  averageCompliance: {
    responseTime: number;
    resolutionTime: number;
  };
  worstPerformingZones: Array<{
    zoneId: string;
    zoneName: string;
    compliance: number;
  }>;
  bestPerformingZones: Array<{
    zoneId: string;
    zoneName: string;
    compliance: number;
  }>;
}
