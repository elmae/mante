import { Repository, DataSource, Between, In, IsNull, Not } from "typeorm";
import {
  SLAConfig,
  MaintenanceType,
} from "../../../../domain/entities/sla-config.entity";
import { ISlaRepositoryPort } from "../../ports/output/sla-repository.port";
import { SLAFilters } from "../../ports/input/sla.port";

export class SLARepository implements ISlaRepositoryPort {
  private repository: Repository<SLAConfig>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(SLAConfig);
  }

  async findById(id: string): Promise<SLAConfig | null> {
    return this.repository.findOne({
      where: { id },
      relations: ["zone", "client", "created_by", "updated_by"],
    });
  }

  async create(slaData: Partial<SLAConfig>): Promise<SLAConfig> {
    const sla = this.repository.create(slaData);
    return this.repository.save(sla);
  }

  async update(id: string, slaData: Partial<SLAConfig>): Promise<SLAConfig> {
    await this.repository.update(id, slaData);
    const updatedSLA = await this.findById(id);
    if (!updatedSLA) {
      throw new Error("SLA configuration not found after update");
    }
    return updatedSLA;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async list(
    filters: SLAFilters
  ): Promise<{ configs: SLAConfig[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder("sla")
      .leftJoinAndSelect("sla.zone", "zone")
      .leftJoinAndSelect("sla.client", "client");

    if (filters.zoneId) {
      queryBuilder.andWhere("sla.zone_id = :zoneId", {
        zoneId: filters.zoneId,
      });
    }

    if (filters.clientId) {
      queryBuilder.andWhere("sla.client_id = :clientId", {
        clientId: filters.clientId,
      });
    }

    if (filters.maintenanceType) {
      queryBuilder.andWhere("sla.maintenance_type = :type", {
        type: filters.maintenanceType,
      });
    }

    if (filters.fromDate && filters.toDate) {
      queryBuilder.andWhere("sla.created_at BETWEEN :fromDate AND :toDate", {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("sla.created_at", "DESC");

    const [configs, total] = await queryBuilder.getManyAndCount();
    return { configs, total };
  }

  async findByZone(zoneId: string): Promise<SLAConfig[]> {
    return this.repository.find({
      where: { zone_id: zoneId },
      relations: ["client"],
    });
  }

  async findByClient(clientId: string): Promise<SLAConfig[]> {
    return this.repository.find({
      where: { client_id: clientId },
      relations: ["zone"],
    });
  }

  async findByMaintenanceType(type: MaintenanceType): Promise<SLAConfig[]> {
    return this.repository.find({
      where: { maintenance_type: type },
      relations: ["zone", "client"],
    });
  }

  async findActive(): Promise<SLAConfig[]> {
    return this.repository.find({
      relations: ["zone", "client"],
    });
  }

  async isConflicting(slaData: Partial<SLAConfig>): Promise<boolean> {
    const queryBuilder = this.repository.createQueryBuilder("sla");

    queryBuilder.where("sla.zone_id = :zoneId", { zoneId: slaData.zone_id });
    queryBuilder.andWhere("sla.maintenance_type = :type", {
      type: slaData.maintenance_type,
    });

    if (slaData.client_id) {
      queryBuilder.andWhere("sla.client_id = :clientId", {
        clientId: slaData.client_id,
      });
    } else {
      queryBuilder.andWhere("sla.client_id IS NULL");
    }

    if (slaData.id) {
      queryBuilder.andWhere("sla.id != :id", { id: slaData.id });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async validateZoneExists(zoneId: string): Promise<boolean> {
    const count = await this.repository.manager
      .getRepository("geographic_zones")
      .count({ where: { id: zoneId } });
    return count > 0;
  }

  async validateClientExists(clientId: string): Promise<boolean> {
    const count = await this.repository.manager
      .getRepository("users")
      .count({ where: { id: clientId } });
    return count > 0;
  }

  async getComplianceStats(
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
  }> {
    // Esta consulta requiere joins con la tabla de tickets y mantenimiento
    const stats = await this.repository.manager.query(
      `
      WITH ticket_times AS (
        SELECT 
          t.id as ticket_id,
          EXTRACT(EPOCH FROM (m.start_time - t.created_at))/60 as response_time,
          CASE WHEN m.end_time IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (m.end_time - t.created_at))/60
            ELSE NULL
          END as resolution_time
        FROM tickets t
        LEFT JOIN maintenance_records m ON t.id = m.ticket_id
        WHERE t.created_at BETWEEN $1 AND $2
        AND t.sla_id = $3
      )
      SELECT
        COUNT(*) as total_tickets,
        COUNT(*) FILTER (WHERE response_time > $4) as response_violations,
        COUNT(*) FILTER (WHERE resolution_time > $5) as resolution_violations,
        AVG(response_time) as avg_response_time,
        AVG(resolution_time) as avg_resolution_time
      FROM ticket_times
    `,
      [startDate, endDate, slaId, 0, 0]
    ); // Los valores 0,0 deben ser reemplazados por los tiempos del SLA

    // Obtener detalles de tickets
    const details = await this.repository.manager.query(
      `
      SELECT 
        t.id as ticket_id,
        EXTRACT(EPOCH FROM (m.start_time - t.created_at))/60 as response_time,
        EXTRACT(EPOCH FROM (m.end_time - t.created_at))/60 as resolution_time,
        CASE 
          WHEN EXTRACT(EPOCH FROM (m.start_time - t.created_at))/60 <= $4 
          AND EXTRACT(EPOCH FROM (m.end_time - t.created_at))/60 <= $5
          THEN true
          ELSE false
        END as is_compliant
      FROM tickets t
      LEFT JOIN maintenance_records m ON t.id = m.ticket_id
      WHERE t.created_at BETWEEN $1 AND $2
      AND t.sla_id = $3
    `,
      [startDate, endDate, slaId, 0, 0]
    ); // Los valores 0,0 deben ser reemplazados por los tiempos del SLA

    return {
      totalTickets: parseInt(stats[0].total_tickets),
      responseTimeViolations: parseInt(stats[0].response_violations),
      resolutionTimeViolations: parseInt(stats[0].resolution_violations),
      averageResponseTime: parseFloat(stats[0].avg_response_time),
      averageResolutionTime: parseFloat(stats[0].avg_resolution_time),
      ticketDetails: details,
    };
  }

  async getZonePerformance(
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
  }> {
    const stats = await this.repository.manager.query(
      `
      WITH sla_compliance AS (
        SELECT 
          s.maintenance_type,
          COUNT(*) as total,
          COUNT(*) FILTER (
            WHERE EXTRACT(EPOCH FROM (m.start_time - t.created_at))/60 <= s.response_time::interval
            AND EXTRACT(EPOCH FROM (m.end_time - t.created_at))/60 <= s.resolution_time::interval
          ) as compliant,
          AVG(EXTRACT(EPOCH FROM (m.start_time - t.created_at))/60) as avg_response,
          AVG(EXTRACT(EPOCH FROM (m.end_time - t.created_at))/60) as avg_resolution
        FROM sla_configs s
        JOIN tickets t ON t.sla_id = s.id
        JOIN maintenance_records m ON t.id = m.ticket_id
        WHERE s.zone_id = $1
        AND t.created_at BETWEEN $2 AND $3
        GROUP BY s.maintenance_type
      )
      SELECT *
      FROM sla_compliance
    `,
      [zoneId, period.start, period.end]
    );

    const complianceByType = stats.reduce((acc: any, stat: any) => {
      acc[stat.maintenance_type] = {
        total: parseInt(stat.total),
        compliant: parseInt(stat.compliant),
      };
      return acc;
    }, {});

    return {
      totalSLAs: stats.reduce(
        (sum: number, stat: any) => sum + parseInt(stat.total),
        0
      ),
      compliantSLAs: stats.reduce(
        (sum: number, stat: any) => sum + parseInt(stat.compliant),
        0
      ),
      averageResponseTime:
        stats.reduce(
          (sum: number, stat: any) => sum + parseFloat(stat.avg_response),
          0
        ) / stats.length,
      averageResolutionTime:
        stats.reduce(
          (sum: number, stat: any) => sum + parseFloat(stat.avg_resolution),
          0
        ) / stats.length,
      complianceByType,
    };
  }

  async getComplianceTrends(period: { start: Date; end: Date }): Promise<
    Array<{
      date: Date;
      responseTimeCompliance: number;
      resolutionTimeCompliance: number;
    }>
  > {
    return this.repository.manager.query(
      `
      WITH daily_compliance AS (
        SELECT 
          DATE_TRUNC('day', t.created_at) as date,
          COUNT(*) as total,
          COUNT(*) FILTER (
            WHERE EXTRACT(EPOCH FROM (m.start_time - t.created_at))/60 <= s.response_time::interval
          ) as response_compliant,
          COUNT(*) FILTER (
            WHERE EXTRACT(EPOCH FROM (m.end_time - t.created_at))/60 <= s.resolution_time::interval
          ) as resolution_compliant
        FROM sla_configs s
        JOIN tickets t ON t.sla_id = s.id
        JOIN maintenance_records m ON t.id = m.ticket_id
        WHERE t.created_at BETWEEN $1 AND $2
        GROUP BY DATE_TRUNC('day', t.created_at)
      )
      SELECT 
        date,
        (response_compliant::float / total) * 100 as response_time_compliance,
        (resolution_compliant::float / total) * 100 as resolution_time_compliance
      FROM daily_compliance
      ORDER BY date
    `,
      [period.start, period.end]
    );
  }

  async getMostFrequentViolations(limit: number = 10): Promise<
    Array<{
      violationType: "response_time" | "resolution_time";
      count: number;
      averageDeviation: number;
      maintenanceType: MaintenanceType;
    }>
  > {
    return this.repository.manager.query(
      `
      WITH violations AS (
        SELECT 
          s.maintenance_type,
          'response_time' as violation_type,
          COUNT(*) as count,
          AVG(EXTRACT(EPOCH FROM (m.start_time - t.created_at))/60 - s.response_time::interval) as avg_deviation
        FROM sla_configs s
        JOIN tickets t ON t.sla_id = s.id
        JOIN maintenance_records m ON t.id = m.ticket_id
        WHERE EXTRACT(EPOCH FROM (m.start_time - t.created_at))/60 > s.response_time::interval
        GROUP BY s.maintenance_type, violation_type
        UNION ALL
        SELECT 
          s.maintenance_type,
          'resolution_time' as violation_type,
          COUNT(*) as count,
          AVG(EXTRACT(EPOCH FROM (m.end_time - t.created_at))/60 - s.resolution_time::interval) as avg_deviation
        FROM sla_configs s
        JOIN tickets t ON t.sla_id = s.id
        JOIN maintenance_records m ON t.id = m.ticket_id
        WHERE EXTRACT(EPOCH FROM (m.end_time - t.created_at))/60 > s.resolution_time::interval
        GROUP BY s.maintenance_type, violation_type
      )
      SELECT *
      FROM violations
      ORDER BY count DESC
      LIMIT $1
    `,
      [limit]
    );
  }

  async getSLAHistory(slaId: string): Promise<
    Array<{
      timestamp: Date;
      action: "created" | "updated" | "deleted";
      userId: string;
      changes: Record<string, any>;
    }>
  > {
    // Esta implementación requiere una tabla de auditoría
    return this.repository.manager.query(
      `
      SELECT 
        created_at as timestamp,
        action,
        created_by_id as user_id,
        changes
      FROM sla_audit_log
      WHERE sla_id = $1
      ORDER BY created_at DESC
    `,
      [slaId]
    );
  }

  async validateConfiguration(config: Partial<SLAConfig>): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Validar zona
    if (config.zone_id) {
      const zoneExists = await this.validateZoneExists(config.zone_id);
      if (!zoneExists) {
        errors.push("Invalid zone_id: Zone does not exist");
      }
    }

    // Validar cliente si se proporciona
    if (config.client_id) {
      const clientExists = await this.validateClientExists(config.client_id);
      if (!clientExists) {
        errors.push("Invalid client_id: Client does not exist");
      }
    }

    // Validar conflictos
    if (await this.isConflicting(config)) {
      errors.push(
        "An SLA configuration already exists for this combination of zone, client and maintenance type"
      );
    }

    // Validar intervalos
    const intervalRegex = /^(\d+)\s+(minute|minutes|hour|hours|day|days)$/;
    if (config.response_time && !intervalRegex.test(config.response_time)) {
      errors.push("Invalid response_time format");
    }
    if (config.resolution_time && !intervalRegex.test(config.resolution_time)) {
      errors.push("Invalid resolution_time format");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
