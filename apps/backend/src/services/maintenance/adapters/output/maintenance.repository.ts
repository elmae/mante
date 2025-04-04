import { Repository, DataSource, Between, In, IsNull, Not, SelectQueryBuilder } from "typeorm";
import {
  MaintenanceRecord,
  MaintenanceType,
} from "../../../../domain/entities/maintenance-record.entity";
import { Attachment } from "../../../../domain/entities/attachment.entity";
import { MaintenanceComment } from "../../../../domain/entities/maintenance-comment.entity";
import { IMaintenanceRepositoryPort } from "../../ports/output/maintenance-repository.port";
import {
  MaintenanceFilters,
  MaintenanceStats,
  MaintenancePart,
  MaintenanceCommentData,
  TechnicalMeasurement,
  AttachmentData,
} from "../../ports/input/maintenance.port";

// Interfaces auxiliares para tipos de datos raw
interface TechnicianStatsRaw {
  technician_id: string;
  completed_count: string;
  avg_duration: string;
}

interface PartsStatsRaw {
  name: string;
  count: string;
}

interface TypeStatsRaw {
  type: MaintenanceType;
  count: string;
}

interface BasicStatsRaw {
  total_count: string;
  completed_count: string;
  avg_duration: string;
}

export class MaintenanceRepository implements IMaintenanceRepositoryPort {
  private repository: Repository<MaintenanceRecord>;
  private commentRepository: Repository<MaintenanceComment>;
  private attachmentRepository: Repository<Attachment>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(MaintenanceRecord);
    this.commentRepository = dataSource.getRepository(MaintenanceComment);
    this.attachmentRepository = dataSource.getRepository(Attachment);
  }

  // Métodos CRUD básicos
  async findById(id: string): Promise<MaintenanceRecord | null> {
    return this.repository.findOne({
      where: { id },
      relations: [
        "ticket",
        "atm",
        "technician",
        "created_by",
        "updated_by",
        "comments",
        "attachments"
      ],
    });
  }

  async create(maintenanceData: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const maintenance = this.repository.create(maintenanceData);
    return this.repository.save(maintenance);
  }

  async update(
    id: string,
    maintenanceData: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord> {
    await this.repository.update(id, maintenanceData);
    const updatedMaintenance = await this.findById(id);
    if (!updatedMaintenance) {
      throw new Error("Maintenance record not found after update");
    }
    return updatedMaintenance;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async list(
    filters: MaintenanceFilters
  ): Promise<{ records: MaintenanceRecord[]; total: number }> {
    const queryBuilder = this.repository
      .createQueryBuilder("maintenance")
      .leftJoinAndSelect("maintenance.ticket", "ticket")
      .leftJoinAndSelect("maintenance.atm", "atm")
      .leftJoinAndSelect("maintenance.technician", "technician")
      .leftJoinAndSelect("maintenance.comments", "comments")
      .leftJoinAndSelect("maintenance.attachments", "attachments");

    if (filters.type?.length) {
      queryBuilder.andWhere("maintenance.type IN (:...type)", {
        type: filters.type,
      });
    }

    if (filters.atmId) {
      queryBuilder.andWhere("maintenance.atm_id = :atmId", {
        atmId: filters.atmId,
      });
    }

    if (filters.technicianId) {
      queryBuilder.andWhere("maintenance.technician_id = :technicianId", {
        technicianId: filters.technicianId,
      });
    }

    if (filters.fromDate && filters.toDate) {
      queryBuilder.andWhere(
        "maintenance.created_at BETWEEN :fromDate AND :toDate",
        {
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        }
      );
    }

    if (filters.requiresFollowUp !== undefined) {
      queryBuilder.andWhere("maintenance.requires_follow_up = :requiresFollowUp", {
        requiresFollowUp: filters.requiresFollowUp,
      });
    }

    if (typeof filters.isComplete !== undefined) {
      if (filters.isComplete) {
        queryBuilder.andWhere("maintenance.end_time IS NOT NULL");
      } else {
        queryBuilder.andWhere("maintenance.end_time IS NULL");
      }
    }

    if (filters.searchTerm) {
      queryBuilder.andWhere(
        "(maintenance.work_performed ILIKE :search OR maintenance.diagnosis ILIKE :search)",
        { search: `%${filters.searchTerm}%` }
      );
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("maintenance.created_at", "DESC");

    const [records, total] = await queryBuilder.getManyAndCount();

    return { records, total };
  }

  // Consultas específicas básicas
  async findByTicket(ticketId: string): Promise<MaintenanceRecord | null> {
    return this.repository.findOne({
      where: { ticket_id: ticketId },
      relations: ["technician", "atm", "comments", "attachments"],
    });
  }

  async findByATM(atmId: string): Promise<MaintenanceRecord[]> {
    return this.repository.find({
      where: { atm_id: atmId },
      relations: ["technician", "ticket", "comments", "attachments"],
      order: { created_at: "DESC" },
    });
  }

  async findByTechnician(technicianId: string): Promise<MaintenanceRecord[]> {
    return this.repository.find({
      where: { technician_id: technicianId },
      relations: ["atm", "ticket", "comments", "attachments"],
      order: { created_at: "DESC" },
    });
  }

  async findInProgress(): Promise<MaintenanceRecord[]> {
    return this.repository.find({
      where: { end_time: IsNull() },
      relations: ["atm", "technician", "ticket", "comments", "attachments"],
    });
  }

  // Validaciones y verificaciones
  async isTicketInMaintenance(ticketId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        ticket_id: ticketId,
        end_time: IsNull(),
      },
    });
    return count > 0;
  }

  async isTechnicianAvailable(technicianId: string): Promise<boolean> {
    const activeMaintenanceCount = await this.repository.count({
      where: {
        technician_id: technicianId,
        end_time: IsNull(),
      },
    });
    return activeMaintenanceCount === 0;
  }

  // Operaciones principales de mantenimiento
  async startMaintenance(data: {
    ticket_id: string;
    atm_id: string;
    technician_id: string;
    type: MaintenanceType;
    start_time: Date;
  }): Promise<MaintenanceRecord> {
    const maintenance = this.repository.create(data);
    return this.repository.save(maintenance);
  }

  async completeMaintenance(
    id: string,
    data: {
      diagnosis: string;
      work_performed: string;
      parts_used: MaintenancePart[];
      end_time: Date;
    }
  ): Promise<MaintenanceRecord> {
    const maintenance = await this.findById(id);
    if (!maintenance) {
      throw new Error("Maintenance record not found");
    }

    Object.assign(maintenance, data);
    return this.repository.save(maintenance);
  }

  async addParts(id: string, parts: MaintenancePart[]): Promise<MaintenanceRecord> {
    const maintenance = await this.findById(id);
    if (!maintenance) {
      throw new Error("Maintenance record not found");
    }

    maintenance.parts_used = [...(maintenance.parts_used || []), ...parts];
    return this.repository.save(maintenance);
  }

  async validateMaintenanceCompletion(id: string): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const maintenance = await this.findById(id);
    if (!maintenance) {
      return { isValid: false, errors: ["Maintenance record not found"] };
    }

    const errors: string[] = [];

    if (!maintenance.diagnosis) {
      errors.push("Diagnosis is required");
    }

    if (!maintenance.work_performed) {
      errors.push("Work performed description is required");
    }

    if (!maintenance.parts_used || maintenance.parts_used.length === 0) {
      errors.push("At least one part must be registered");
    }

    if (!maintenance.end_time) {
      errors.push("End time must be set");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Métodos de estadísticas y análisis
  async getMaintenanceStats(filters: MaintenanceFilters): Promise<MaintenanceStats> {
    const queryBuilder = this.repository.createQueryBuilder("maintenance");

    if (filters.fromDate && filters.toDate) {
      queryBuilder.andWhere(
        "maintenance.created_at BETWEEN :fromDate AND :toDate",
        {
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        }
      );
    }

    const basicStats = await this.getBasicStats(queryBuilder);
    const partsStats = await this.getPartsStats(queryBuilder);
    const technicianStats = await this.getTechnicianPerformanceStats(queryBuilder);

    return {
      totalCount: basicStats.totalCount,
      completedCount: basicStats.completedCount,
      averageDuration: basicStats.averageDuration,
      byType: basicStats.byType,
      mostCommonParts: partsStats,
      technicianPerformance: technicianStats,
    };
  }

  async getAverageDuration(filters?: MaintenanceFilters): Promise<number> {
    const queryBuilder = this.repository
      .createQueryBuilder("maintenance")
      .where("maintenance.end_time IS NOT NULL");

    if (filters?.fromDate && filters?.toDate) {
      queryBuilder.andWhere(
        "maintenance.created_at BETWEEN :fromDate AND :toDate",
        {
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        }
      );
    }

    const result = await queryBuilder
      .select("AVG(EXTRACT(EPOCH FROM (end_time - start_time)))", "average_duration")
      .getRawOne();

    return result?.average_duration || 0;
  }

  async getMostUsedParts(limit: number = 10): Promise<Array<{ name: string; count: number }>> {
    const result = await this.repository
      .createQueryBuilder("maintenance")
      .select([
        'jsonb_array_elements(parts_used)->>"name" as name',
        'SUM((jsonb_array_elements(parts_used)->>"quantity")::int) as count',
      ])
      .groupBy("name")
      .orderBy("count", "DESC")
      .limit(limit)
      .getRawMany();

    return result.map((item) => ({
      name: item.name,
      count: parseInt(item.count),
    }));
  }

  async getTechnicianPerformance(technicianId: string): Promise<{
    completed_count: number;
    average_duration: number;
    most_common_type: MaintenanceType;
  }> {
    const stats = await this.repository
      .createQueryBuilder("maintenance")
      .where("maintenance.technician_id = :technicianId", { technicianId })
      .andWhere("maintenance.end_time IS NOT NULL")
      .select([
        "COUNT(*) as completed_count",
        "AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as average_duration",
        "mode() WITHIN GROUP (ORDER BY type) as most_common_type",
      ])
      .getRawOne();

    return {
      completed_count: parseInt(stats.completed_count) || 0,
      average_duration: parseFloat(stats.average_duration) || 0,
      most_common_type: stats.most_common_type as MaintenanceType,
    };
  }

  async getMaintenanceHistory(atmId: string): Promise<{
    total_count: number;
    last_maintenance: Date | null;
    maintenance_types: Record<MaintenanceType, number>;
    total_parts_used: number;
    common_issues: string[];
  }> {
    const queryBuilder = this.repository.createQueryBuilder("maintenance");

    // Get basic statistics
    const basicStats = await queryBuilder
      .select([
        "COUNT(*) as total_count",
        "MAX(maintenance.created_at) as last_maintenance",
      ])
      .where("maintenance.atm_id = :atmId", { atmId })
      .getRawOne();

    // Get maintenance types distribution
    const typeStats: TypeStatsRaw[] = await queryBuilder
      .select(["maintenance.type", "COUNT(*) as count"])
      .where("maintenance.atm_id = :atmId", { atmId })
      .groupBy("maintenance.type")
      .getRawMany();

    // Get total parts used
    const partsStats = await queryBuilder
      .select('SUM((jsonb_array_elements(maintenance.parts_used)->>"quantity")::int) as total')
      .where("maintenance.atm_id = :atmId", { atmId })
      .getRawOne();

    // Get common issues (from diagnosis field)
    const issues = await queryBuilder
      .select("maintenance.diagnosis")
      .where("maintenance.atm_id = :atmId", { atmId })
      .andWhere("maintenance.diagnosis IS NOT NULL")
      .orderBy("maintenance.created_at", "DESC")
      .limit(10)
      .getRawMany();

    const maintenanceTypes = typeStats.reduce<Record<MaintenanceType, number>>(
      (acc, stat) => {
        acc[stat.type] = parseInt(stat.count);
        return acc;
      },
      {} as Record<MaintenanceType, number>
    );

    return {
      total_count: parseInt(basicStats.total_count) || 0,
      last_maintenance: basicStats.last_maintenance
        ? new Date(basicStats.last_maintenance)
        : null,
      maintenance_types: maintenanceTypes,
      total_parts_used: parseInt(partsStats?.total) || 0,
      common_issues: issues
        .map((issue: { diagnosis: string }) => issue.diagnosis)
        .filter(Boolean),
    };
  }

  // Métodos para comentarios
  async addComment(
    id: string,
    commentData: MaintenanceCommentData
  ): Promise<MaintenanceComment> {
    const maintenance = await this.findById(id);
    if (!maintenance) {
      throw new Error("Maintenance record not found");
    }

    const comment = this.commentRepository.create({
      ...commentData,
      maintenance_record_id: id,
    });

    return this.commentRepository.save(comment);
  }

  async getComments(id: string): Promise<MaintenanceComment[]> {
    return this.commentRepository.find({
      where: { maintenance_record_id: id },
      relations: ["created_by"],
      order: { created_at: "DESC" },
    });
  }

  async deleteComment(maintenanceId: string, commentId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, maintenance_record_id: maintenanceId },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    await this.commentRepository.remove(comment);
  }

  // Métodos para mediciones y seguimiento
  async updateMeasurements(
    id: string,
    measurements: TechnicalMeasurement[]
  ): Promise<MaintenanceRecord> {
    const maintenance = await this.findById(id);
    if (!maintenance) {
      throw new Error("Maintenance record not found");
    }

    maintenance.technical_measurements = measurements;
    return this.repository.save(maintenance);
  }

  async setFollowUpStatus(
    id: string,
    requiresFollowUp: boolean,
    notes?: string
  ): Promise<MaintenanceRecord> {
    const maintenance = await this.findById(id);
    if (!maintenance) {
      throw new Error("Maintenance record not found");
    }

    maintenance.requires_follow_up = requiresFollowUp;
    if (notes) {
      maintenance.follow_up_notes = notes;
    }

    return this.repository.save(maintenance);
  }

  async findRequiringFollowUp(): Promise<MaintenanceRecord[]> {
    return this.repository.find({
      where: { requires_follow_up: true },
      relations: ["atm", "technician", "ticket", "comments", "attachments"],
      order: { created_at: "DESC" },
    });
  }

  // Métodos para adjuntos
  async addAttachment(
    id: string,
    attachmentData: AttachmentData
  ): Promise<MaintenanceRecord> {
    const maintenance = await this.findById(id);
    if (!maintenance) {
      throw new Error("Maintenance record not found");
    }

    const attachment = this.attachmentRepository.create({
      ...attachmentData,
      maintenance_record_id: id,
    });

    await this.attachmentRepository.save(attachment);
    return this.findById(id);
  }

  async getAttachments(id: string): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { maintenance_record_id: id },
      relations: ["created_by"],
      order: { created_at: "DESC" },
    });
  }

  async deleteAttachment(maintenanceId: string, attachmentId: string): Promise<void> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId, maintenance_record_id: maintenanceId },
    });

    if (!attachment) {
      throw new Error("Attachment not found");
    }

    await this.attachmentRepository.remove(attachment);
  }

  // Métodos auxiliares para estadísticas
  private async getBasicStats(queryBuilder: SelectQueryBuilder<MaintenanceRecord>): Promise<{
    totalCount: number;
    completedCount: number;
    averageDuration: number;
    byType: Record<MaintenanceType, number>;
  }> {
    const stats = await queryBuilder
      .select([
        "COUNT(*) as total_count",
        "COUNT(CASE WHEN end_time IS NOT NULL THEN 1 END) as completed_count",
        "AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_duration",
      ])
      .getRawOne();

    return {
      totalCount: parseInt(stats.total_count) || 0,
      completedCount: parseInt(stats.completed_count) || 0,
      averageDuration: parseFloat(stats.avg_duration) || 0,
      byType: await this.getStatsByType(queryBuilder),
    };
  }

  private async getPartsStats(
    queryBuilder: SelectQueryBuilder<MaintenanceRecord>
  ): Promise<Array<{ name: string; count: number }>> {
    return this.getMostUsedParts(10);
  }

  private async getTechnicianPerformanceStats(
    queryBuilder: SelectQueryBuilder<MaintenanceRecord>
  ): Promise<Array<{
    technician_id: string;
    completed_count: number;
    average_duration: number;
  }>> {
    const stats = await queryBuilder
      .select([
        "technician_id",
        "COUNT(*) as completed_count",
        "AVG(EXTRACT(EPOCH FROM (end_time - start_time))) as avg_duration",
      ])
      .where("end_time IS NOT NULL")
      .groupBy("technician_id")
      .getRawMany();

    return stats.map((stat) => ({
      technician_id: stat.technician_id,
      completed_count: parseInt(stat.completed_count) || 0,
      average_duration: parseFloat(stat.avg_duration) || 0,
    }));
  }

  private async getStatsByType(
    queryBuilder: SelectQueryBuilder<MaintenanceRecord>
  ): Promise<Record<MaintenanceType, number>> {
    const stats = await queryBuilder
      .select(["type", "COUNT(*) as count"])
      .groupBy("type")
      .getRawMany();

    return stats.reduce<Record<MaintenanceType, number>>(
      (acc, stat) => ({
        ...acc,
        [stat.type]: parseInt(stat.count),
      }),
      {} as Record<MaintenanceType, number>
    );
  }
}
