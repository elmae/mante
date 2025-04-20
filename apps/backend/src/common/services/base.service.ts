import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { Repository, SelectQueryBuilder, DeepPartial as TypeORMDeepPartial } from 'typeorm';
import {
  FilterDto,
  FilterOptions,
  PaginatedResult,
  SortOrder,
  FILTER_CONSTANTS
} from '../types/filter.types';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export abstract class BaseService<
  T extends BaseEntity,
  CreateDTO = TypeORMDeepPartial<T>,
  UpdateDTO = Partial<CreateDTO>
> {
  protected readonly logger: Logger;

  constructor(
    protected readonly repository: Repository<T>,
    serviceName: string
  ) {
    this.logger = new Logger(serviceName);
  }

  async create(createDto: CreateDTO): Promise<T> {
    try {
      const entity = this.repository.create(createDto as TypeORMDeepPartial<T>);
      return await this.repository.save(entity);
    } catch (error) {
      this.logger.error(`Error creating entity: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(filterDto: FilterDto): Promise<PaginatedResult<T>> {
    try {
      const query = this.repository.createQueryBuilder('entity');

      this.applyFilters(query, filterDto);
      this.applySorting(query, filterDto);

      const [items, total] = await this.applyPagination(query, filterDto);

      return {
        items,
        total,
        page: filterDto.page || FILTER_CONSTANTS.MIN_PAGE,
        limit: filterDto.limit || FILTER_CONSTANTS.DEFAULT_LIMIT,
        totalPages: Math.ceil(total / (filterDto.limit || FILTER_CONSTANTS.DEFAULT_LIMIT))
      };
    } catch (error) {
      this.logger.error(`Error finding entities: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string, relations: string[] = []): Promise<T> {
    try {
      const entity = await this.repository.findOne({
        where: { id } as any,
        relations
      });

      if (!entity) {
        throw new NotFoundException(`Entity with ID '${id}' not found`);
      }

      return entity;
    } catch (error) {
      this.logger.error(`Error finding entity: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: string, updateDto: UpdateDTO): Promise<T> {
    try {
      const entity = await this.findOne(id);
      const updated = Object.assign(entity, updateDto);
      return await this.repository.save(updated);
    } catch (error) {
      this.logger.error(`Error updating entity: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.repository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Entity with ID '${id}' not found`);
      }
    } catch (error) {
      this.logger.error(`Error deleting entity: ${error.message}`, error.stack);
      throw error;
    }
  }

  protected applyFilters(query: SelectQueryBuilder<T>, filterDto: FilterDto): void {
    if (filterDto.search) {
      this.applySearchFilter(query, filterDto.search);
    }

    if (filterDto.startDate && filterDto.endDate) {
      query.andWhere('entity.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filterDto.startDate,
        endDate: filterDto.endDate
      });
    }
  }

  protected applySorting(query: SelectQueryBuilder<T>, filterDto: FilterDto): void {
    const sortBy = filterDto.sortBy || 'createdAt';
    const sortOrder = filterDto.sortOrder || SortOrder.DESC;

    if (!this.isValidSortField(sortBy)) {
      this.logger.warn(`Invalid sort field: ${sortBy}`);
      return;
    }

    query.orderBy(`entity.${sortBy}`, sortOrder);
  }

  protected async applyPagination(
    query: SelectQueryBuilder<T>,
    filterDto: FilterDto
  ): Promise<[T[], number]> {
    const page = filterDto.page || FILTER_CONSTANTS.MIN_PAGE;
    const limit = filterDto.limit || FILTER_CONSTANTS.DEFAULT_LIMIT;

    if (limit > FILTER_CONSTANTS.MAX_LIMIT) {
      throw new BadRequestException(`Limit cannot exceed ${FILTER_CONSTANTS.MAX_LIMIT}`);
    }

    query.skip((page - 1) * limit).take(limit);

    return query.getManyAndCount();
  }

  protected abstract applySearchFilter(query: SelectQueryBuilder<T>, search: string): void;

  protected abstract isValidSortField(field: string): boolean;
}
