import {
  SLAConfig,
  MaintenanceType,
} from "../../../../domain/entities/sla-config.entity";
import {
  ISlaInputPort,
  SLAFilters,
  SLAComplianceResult,
  SLAValidationResult,
} from "../../ports/input/sla.port";
import { ISlaRepositoryPort } from "../../ports/output/sla-repository.port";

type ViolationType = "response_time" | "resolution_time";

export class SLAService implements ISlaInputPort {
  constructor(private readonly slaRepository: ISlaRepositoryPort) {}

  async findById(id: string): Promise<SLAConfig | null> {
    return this.slaRepository.findById(id);
  }

  async create(slaData: Partial<SLAConfig>): Promise<SLAConfig> {
    // Validar la configuración del SLA
    const validation = await this.slaRepository.validateConfiguration(slaData);
    if (!validation.isValid) {
      throw new Error(
        `Invalid SLA configuration: ${validation.errors.join(", ")}`
      );
    }

    // Verificar conflictos con SLAs existentes
    const isConflicting = await this.slaRepository.isConflicting(slaData);
    if (isConflicting) {
      throw new Error(
        "An SLA configuration already exists for this combination of zone, client and maintenance type"
      );
    }

    return this.slaRepository.create(slaData);
  }

  async update(id: string, slaData: Partial<SLAConfig>): Promise<SLAConfig> {
    const existingSLA = await this.findById(id);
    if (!existingSLA) {
      throw new Error("SLA configuration not found");
    }

    // Validar la configuración actualizada
    const validation = await this.slaRepository.validateConfiguration({
      ...existingSLA,
      ...slaData,
    });
    if (!validation.isValid) {
      throw new Error(
        `Invalid SLA configuration: ${validation.errors.join(", ")}`
      );
    }

    return this.slaRepository.update(id, slaData);
  }

  async delete(id: string): Promise<void> {
    const existingSLA = await this.findById(id);
    if (!existingSLA) {
      throw new Error("SLA configuration not found");
    }

    await this.slaRepository.delete(id);
  }

  async list(
    filters: SLAFilters
  ): Promise<{ configs: SLAConfig[]; total: number }> {
    return this.slaRepository.list(filters);
  }

  async findByZone(zoneId: string): Promise<SLAConfig[]> {
    const zoneExists = await this.slaRepository.validateZoneExists(zoneId);
    if (!zoneExists) {
      throw new Error("Zone not found");
    }

    return this.slaRepository.findByZone(zoneId);
  }

  async findByClient(clientId: string): Promise<SLAConfig[]> {
    const clientExists = await this.slaRepository.validateClientExists(
      clientId
    );
    if (!clientExists) {
      throw new Error("Client not found");
    }

    return this.slaRepository.findByClient(clientId);
  }

  async findByMaintenanceType(type: MaintenanceType): Promise<SLAConfig[]> {
    return this.slaRepository.findByMaintenanceType(type);
  }

  async calculateCompliance(
    slaId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SLAComplianceResult> {
    const sla = await this.findById(slaId);
    if (!sla) {
      throw new Error("SLA configuration not found");
    }

    const stats = await this.slaRepository.getComplianceStats(
      slaId,
      startDate,
      endDate
    );
    const zonePerformance = await this.slaRepository.getZonePerformance(
      sla.zone_id,
      { start: startDate, end: endDate }
    );

    // Analizar los datos y generar recomendaciones
    const recommendations = this.generateRecommendations(
      stats,
      zonePerformance
    );

    return {
      sla,
      period: { start: startDate, end: endDate },
      metrics: {
        totalTickets: stats.totalTickets,
        responseTimeCompliance:
          ((stats.totalTickets - stats.responseTimeViolations) /
            stats.totalTickets) *
          100,
        resolutionTimeCompliance:
          ((stats.totalTickets - stats.resolutionTimeViolations) /
            stats.totalTickets) *
          100,
        averageResponseTime: stats.averageResponseTime,
        averageResolutionTime: stats.averageResolutionTime,
      },
      details: stats.ticketDetails.map((detail) => ({
        ticketId: detail.ticketId,
        responseTime: detail.responseTime,
        resolutionTime: detail.resolutionTime,
        metResponseSLA:
          detail.responseTime <= this.parseInterval(sla.response_time),
        metResolutionSLA:
          detail.resolutionTime <= this.parseInterval(sla.resolution_time),
      })),
    };
  }

  async validateSLA(
    slaId: string,
    ticketId: string
  ): Promise<SLAValidationResult> {
    const sla = await this.findById(slaId);
    if (!sla) {
      throw new Error("SLA configuration not found");
    }

    // Obtener estadísticas del ticket específico
    const stats = await this.slaRepository.getComplianceStats(
      slaId,
      new Date(0),
      new Date()
    );
    const ticketDetail = stats.ticketDetails.find(
      (d) => d.ticketId === ticketId
    );

    if (!ticketDetail) {
      throw new Error("Ticket not found or not associated with this SLA");
    }

    const expectedResponseTime = this.parseInterval(sla.response_time);
    const expectedResolutionTime = this.parseInterval(sla.resolution_time);
    const violations: Array<{
      type: ViolationType;
      expected: number;
      actual: number;
      difference: number;
    }> = [];

    if (ticketDetail.responseTime > expectedResponseTime) {
      violations.push({
        type: "response_time",
        expected: expectedResponseTime,
        actual: ticketDetail.responseTime,
        difference: ticketDetail.responseTime - expectedResponseTime,
      });
    }

    if (ticketDetail.resolutionTime > expectedResolutionTime) {
      violations.push({
        type: "resolution_time",
        expected: expectedResolutionTime,
        actual: ticketDetail.resolutionTime,
        difference: ticketDetail.resolutionTime - expectedResolutionTime,
      });
    }

    return {
      isValid: violations.length === 0,
      violations,
      recommendations: this.generateTicketRecommendations(violations),
    };
  }

  async getActiveSLAs(): Promise<SLAConfig[]> {
    return this.slaRepository.findActive();
  }

  private parseInterval(interval: string): number {
    const match = interval.match(
      /^(\d+)\s+(minute|minutes|hour|hours|day|days)$/
    );
    if (!match) {
      throw new Error("Invalid interval format");
    }

    const [, value, unit] = match;
    const minutes = parseInt(value);

    switch (unit) {
      case "minute":
      case "minutes":
        return minutes;
      case "hour":
      case "hours":
        return minutes * 60;
      case "day":
      case "days":
        return minutes * 60 * 24;
      default:
        throw new Error("Invalid time unit");
    }
  }

  private generateRecommendations(stats: any, zonePerformance: any): string[] {
    const recommendations: string[] = [];

    const responseTimeComplianceRate =
      (stats.totalTickets - stats.responseTimeViolations) / stats.totalTickets;
    const resolutionTimeComplianceRate =
      (stats.totalTickets - stats.resolutionTimeViolations) /
      stats.totalTickets;

    if (responseTimeComplianceRate < 0.9) {
      recommendations.push(
        "Response time compliance is below 90%. Consider reviewing technician allocation and response procedures."
      );
    }

    if (resolutionTimeComplianceRate < 0.85) {
      recommendations.push(
        "Resolution time compliance is below 85%. Evaluate resource capacity and maintenance procedures."
      );
    }

    if (stats.averageResponseTime > zonePerformance.averageResponseTime * 1.2) {
      recommendations.push(
        "Response times are significantly higher than zone average. Review local response capabilities."
      );
    }

    return recommendations;
  }

  private generateTicketRecommendations(
    violations: Array<{ type: ViolationType; difference: number }>
  ): string[] {
    const recommendations: string[] = [];

    for (const violation of violations) {
      if (violation.type === "response_time") {
        recommendations.push(
          `Response time exceeded by ${Math.round(
            violation.difference
          )} minutes. ` +
            "Consider optimizing technician dispatch and initial response procedures."
        );
      }

      if (violation.type === "resolution_time") {
        recommendations.push(
          `Resolution time exceeded by ${Math.round(
            violation.difference
          )} minutes. ` +
            "Review maintenance procedures and resource allocation."
        );
      }
    }

    return recommendations;
  }
}
