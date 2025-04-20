import { jest, expect } from '@jest/globals';
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { Repository, SelectQueryBuilder, ObjectLiteral, DeleteResult, UpdateResult } from 'typeorm';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

interface BaseRepository<T extends ObjectLiteral> {
  find(): Promise<T[]>;
  findOne(options?: any): Promise<T | null>;
  findOneBy(where: any): Promise<T | null>;
  save(entity: DeepPartial<T>): Promise<T>;
  create(entityLike: DeepPartial<T>): T;
  merge(entity: T, ...entityLikes: DeepPartial<T>[]): T;
  delete(criteria: any): Promise<DeleteResult>;
  update(criteria: any, partialEntity: DeepPartial<T>): Promise<UpdateResult>;
  createQueryBuilder(alias?: string): SelectQueryBuilder<T>;
}

/**
 * Crear un mock básico de ExecutionContext
 */
export function createMockExecutionContext(data: any = {}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        url: '/test',
        method: 'GET',
        headers: {},
        query: {},
        params: {},
        user: undefined,
        ...data.request
      }),
      getResponse: () => ({
        statusCode: 200,
        getHeader: jest.fn(),
        setHeader: jest.fn(),
        ...data.response
      })
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
    ...data
  } as ExecutionContext;
}

/**
 * Crear un mock de ConfigService
 */
export function createMockConfigService(config: Record<string, any> = {}): Partial<ConfigService> {
  return {
    get: jest.fn((key: string) => config[key]),
    getOrThrow: jest.fn((key: string) => {
      if (key in config) return config[key];
      throw new Error(`Config key "${key}" not found`);
    })
  };
}

/**
 * Crear un mock de Repository
 */
export function createMockRepository<T extends ObjectLiteral>(): jest.Mocked<BaseRepository<T>> {
  const queryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    getCount: jest.fn().mockResolvedValue(0)
  };

  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    findOneBy: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockImplementation((entity: DeepPartial<T>) => Promise.resolve(entity as T)),
    create: jest.fn().mockImplementation((dto: DeepPartial<T>) => dto as T),
    merge: jest
      .fn()
      .mockImplementation((entity: T, ...dtos: DeepPartial<T>[]) => ({ ...entity, ...dtos[0] })),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder)
  } as jest.Mocked<BaseRepository<T>>;
}

/**
 * Crear un módulo de prueba con providers mockeados
 */
export async function createTestingModule({
  imports = [],
  controllers = [],
  providers = [],
  entities = []
}: {
  imports?: any[];
  controllers?: any[];
  providers?: any[];
  entities?: any[];
}): Promise<TestingModule> {
  const repositoryProviders = entities.map(entity => ({
    provide: getRepositoryToken(entity),
    useFactory: createMockRepository
  }));

  const configProvider = {
    provide: ConfigService,
    useFactory: () =>
      createMockConfigService({
        NODE_ENV: 'test',
        'database.host': 'localhost',
        'database.port': 5432
      })
  };

  return Test.createTestingModule({
    imports,
    controllers,
    providers: [...providers, ...repositoryProviders, configProvider]
  }).compile();
}

/**
 * Limpiar todos los mocks después de cada prueba
 */
export function clearAllMocks(): void {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

/**
 * Helper para esperar a que una promesa se resuelva o rechace
 */
export async function expectAsync<T>(
  promise: Promise<T>,
  matcher: (result: T) => void,
  errorMatcher?: (error: any) => void
): Promise<void> {
  try {
    const result = await promise;
    matcher(result);
  } catch (error) {
    if (errorMatcher) {
      errorMatcher(error);
    } else {
      throw error;
    }
  }
}

/**
 * Helper para crear objetos de prueba
 */
export function createTestObject<T extends ObjectLiteral>(
  partial: Partial<T>,
  defaults: Partial<T> = {}
): T {
  return {
    ...defaults,
    ...partial
  } as T;
}

/**
 * Helper para comparar fechas en pruebas
 */
export function expectDatesEqual(date1: Date, date2: Date): void {
  expect(date1.getTime()).toBe(date2.getTime());
}
