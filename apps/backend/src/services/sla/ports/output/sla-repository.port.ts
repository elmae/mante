import {
  SLAConfig,
  MaintenanceType,
} from "../../../../domain/entities/sla-config.entity";
import { SLAFilters, SLAComplianceResult } from "../input/sla.port";

export interface ISlaRepositoryPort {
  findById(id: string): Promise<SLAConfig | null>;
  create(slaData: Partial<SLAConfig>): Promise<SLAConfig>;
  update(id: string, slaData: Partial<SLAConfig>): Promise<SLAConfig>;
  delete(id: string): Promise<void>;
  list(filters: SLAFilters): Promise<{ configs: SLAConfig[]; total: number }>;

  // Consultas específicas
  findByZone(zoneId: string): Promise<SLAConfig[]>;
  findByClient(clientId: string): Promise<SLAConfig[]>;
  findByMaintenanceType(type: MaintenanceType): Promise<SLAConfig[]>;
  findActive(): Promise<SLAConfig[]>;

  // Consultas de validación
  isConflicting(slaData: Partial<SLAConfig>): Promise<boolean>;
  validateZoneExists(zoneId: string): Promise<boolean>;
  validateClientExists(clientId: string): Promise<boolean>;

  // Consultas de cumplimiento y estadísticas
  getComplianceStats(
    slaId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalTickets: number;
    responseTimeViolations: number;
    resolutionTimeViolations: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    ticketDetails: Array<{
      ticketId: string;
      responseTime: number;
      resolutionTime: number;
      isCompliant: boolean;
    }>;
  }>;

  getZonePerformance(
    zoneId: string,
    period: { start: Date; end: Date }
  ): Promise<{
    totalSLAs: number;
    compliantSLAs: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    complianceByType: Record<
      MaintenanceType,
      {
        total: number;
        compliant: number;
      }
    >;
  }>;

  // Consultas de análisis
  getComplianceTrends(period: { start: Date; end: Date }): Promise<
    Array<{
      date: Date;
      responseTimeCompliance: number;
      resolutionTimeCompliance: number;
    }>
  >;

  getMostFrequentViolations(limit?: number): Promise<
    Array<{
      violationType: "response_time" | "resolution_time";
      count: number;
      averageDeviation: number;
      maintenanceType: MaintenanceType;
    }>
  >;

  // Consultas de auditoría
  getSLAHistory(slaId: string): Promise<
    Array<{
      timestamp: Date;
      action: "created" | "updated" | "deleted";
      userId: string;
      changes: Record<string, any>;
    }>
  >;

  // Validaciones
  validateConfiguration(config: Partial<SLAConfig>): Promise<{
    isValid: boolean;
    errors: string[];
  }>;
}
