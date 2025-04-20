import { BaseFilterDto } from '../types';

export interface ICrudService<T, C, U, F extends BaseFilterDto> {
  create(createDto: C): Promise<T>;
  findAll(filterDto: F): Promise<{ items: T[]; total: number }>;
  findOne(id: string): Promise<T>;
  update(id: string, updateDto: U): Promise<T>;
  remove(id: string): Promise<void>;
}

export interface ICrudController<T, C, U, F extends BaseFilterDto> {
  create(createDto: C): Promise<T>;
  findAll(filterDto: F): Promise<{
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  findOne(id: string): Promise<T>;
  update(id: string, updateDto: U): Promise<T>;
  remove(id: string): Promise<void>;
}

export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBaseDto {
  id?: string;
}

export interface IBaseFilterDto extends BaseFilterDto {
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findAll(filter?: any): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  count(filter?: any): Promise<number>;
}
