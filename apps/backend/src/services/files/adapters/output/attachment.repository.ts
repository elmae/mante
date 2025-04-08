import { DataSource, Repository, IsNull, Not } from 'typeorm';
import {
  IAttachmentRepositoryPort,
  AttachmentData,
  RetentionRule
} from '../../ports/output/storage.port';
import { Attachment } from '../../../../domain/entities/attachment.entity';
import { BadRequestError } from '../../../../common/exceptions/bad-request.exception';

export class AttachmentRepository implements IAttachmentRepositoryPort {
  private repository: Repository<Attachment>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Attachment);
  }

  async save(data: AttachmentData): Promise<AttachmentData> {
    const attachment = this.repository.create({
      ...data,
      file_name: data.file_name,
      file_path: data.file_path,
      mime_type: data.mime_type,
      file_size: data.file_size,
      created_by_id: data.created_by_id
    });

    await this.repository.save(attachment);
    return this.mapToData(attachment);
  }

  async update(id: string, data: Partial<AttachmentData>): Promise<AttachmentData> {
    const attachment = await this.repository.findOne({
      where: { id }
    });

    if (!attachment) {
      throw new BadRequestError('Attachment not found');
    }

    Object.assign(attachment, data);
    await this.repository.save(attachment);

    return this.mapToData(attachment);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new BadRequestError('Attachment not found');
    }
  }

  async findById(id: string): Promise<AttachmentData | null> {
    const attachment = await this.repository.findOne({
      where: { id },
      relations: ['ticket', 'maintenance_record', 'created_by']
    });

    return attachment ? this.mapToData(attachment) : null;
  }

  async findByParent(parentType: string, parentId: string): Promise<AttachmentData[]> {
    const where =
      parentType === 'ticket' ? { ticket_id: parentId } : { maintenance_record_id: parentId };

    const attachments = await this.repository.find({
      where,
      relations: ['created_by']
    });

    return attachments.map(attachment => this.mapToData(attachment));
  }

  async markAsDeleted(id: string): Promise<void> {
    await this.repository.update(id, {
      deleted_at: new Date()
    });
  }

  async markAsRestored(id: string): Promise<void> {
    await this.repository.update(id, {
      deleted_at: undefined,
      deleted_by_id: undefined
    });
  }

  async getDeletedByUser(userId: string): Promise<AttachmentData[]> {
    const attachments = await this.repository.find({
      where: {
        created_by_id: userId,
        deleted_at: Not(IsNull())
      },
      relations: ['created_by']
    });

    return attachments.map(attachment => this.mapToData(attachment));
  }

  async getExpiredFiles(rules: RetentionRule[]): Promise<AttachmentData[]> {
    const result: AttachmentData[] = [];

    for (const rule of rules) {
      const qb = this.repository
        .createQueryBuilder('attachment')
        .leftJoinAndSelect('attachment.ticket', 'ticket')
        .leftJoinAndSelect('attachment.maintenance_record', 'maintenance')
        .where('attachment.mime_type ~ :pattern', { pattern: rule.mimeTypePattern })
        .andWhere('attachment.deleted_at IS NULL');

      // Aplicar filtros de tipo de padre si se especifican
      if (rule.parentType) {
        if (rule.parentType === 'ticket') {
          qb.andWhere('attachment.ticket_id IS NOT NULL');
        } else if (rule.parentType === 'maintenance') {
          qb.andWhere('attachment.maintenance_record_id IS NOT NULL');
        }
      }

      // Aplicar filtros de estado si se especifican
      if (rule.parentStatus && rule.parentStatus.length > 0) {
        if (rule.parentType === 'ticket') {
          qb.andWhere('ticket.status IN (:...statuses)', { statuses: rule.parentStatus });
        } else if (rule.parentType === 'maintenance') {
          qb.andWhere('maintenance.status IN (:...statuses)', { statuses: rule.parentStatus });
        }
      }

      // Calcular la fecha límite basada en los días de retención
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - rule.retentionDays);
      qb.andWhere('attachment.created_at <= :retentionDate', { retentionDate });

      const attachments = await qb.getMany();
      result.push(...attachments.map(attachment => this.mapToData(attachment)));
    }

    return result;
  }

  private mapToData(entity: Attachment): AttachmentData {
    return {
      id: entity.id,
      ticket_id: entity.ticket_id,
      maintenance_record_id: entity.maintenance_record_id,
      file_name: entity.file_name,
      file_path: entity.file_path,
      mime_type: entity.mime_type,
      file_size: entity.file_size,
      created_at: entity.created_at,
      created_by_id: entity.created_by_id,
      deleted_at: entity.deleted_at,
      deleted_by_id: entity.deleted_by_id
    };
  }
}
