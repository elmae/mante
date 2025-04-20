import { Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe, Logger } from '@nestjs/common';
import { BaseService } from '../services/base.service';
import { FilterDto, PaginatedResult } from '../types/filter.types';
import { BaseEntity } from '../services/base.service';

export abstract class BaseController<
  T extends BaseEntity,
  CreateDTO,
  UpdateDTO = Partial<CreateDTO>
> {
  protected readonly logger: Logger;

  constructor(
    protected readonly service: BaseService<T, CreateDTO, UpdateDTO>,
    controllerName: string
  ) {
    this.logger = new Logger(controllerName);
  }

  @Post()
  async create(@Body() createDto: CreateDTO): Promise<T> {
    this.logger.log(`Creating new entity with data: ${JSON.stringify(createDto)}`);
    return this.service.create(createDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterDto): Promise<PaginatedResult<T>> {
    this.logger.debug(`Finding all entities with filters: ${JSON.stringify(filterDto)}`);
    return this.service.findAll(filterDto);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('relations') relations?: string
  ): Promise<T> {
    const relationArray = relations ? relations.split(',') : [];
    this.logger.debug(`Finding entity by id: ${id} with relations: ${relationArray}`);
    return this.service.findOne(id, relationArray);
  }

  @Put(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDto: UpdateDTO): Promise<T> {
    this.logger.log(`Updating entity ${id} with data: ${JSON.stringify(updateDto)}`);
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.log(`Removing entity ${id}`);
    return this.service.delete(id);
  }

  // Helper method para formatear respuestas de error
  protected formatError(error: any): string {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'An unexpected error occurred';
  }

  // Helper method para validar IDs
  protected validateId(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  // Helper method para sanear datos de entrada
  protected sanitizeInput(data: any): any {
    if (!data) return data;

    const sanitized = { ...data };

    // Remover campos vacíos o undefined
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined || sanitized[key] === '') {
        delete sanitized[key];
      }
    });

    return sanitized;
  }
}
