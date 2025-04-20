import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral } from 'typeorm';
import { MockQueryBuilder, MockRepository, JestMockFn, DeepPartial } from './types';

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
 * Crear un mock function con tipos
 */
function createMockFn<TResult = any, TArgs extends any[] = any[]>(
  implementation?: (...args: TArgs) => TResult
): JestMockFn<TResult, TArgs> {
  return jest.fn(implementation) as unknown as JestMockFn<TResult, TArgs>;
}

/**
 * Crear un mock de Repository
 */
export function createMockRepository<T extends ObjectLiteral>(): MockRepository<T> {
  const queryBuilder: MockQueryBuilder<T> = {
    where: createMockFn().mockReturnThis(),
    andWhere: createMockFn().mockReturnThis(),
    orderBy: createMockFn().mockReturnThis(),
    skip: createMockFn().mockReturnThis(),
    take: createMockFn().mockReturnThis(),
    getMany: createMockFn<Promise<T[]>>().mockResolvedValue([]),
    getOne: createMockFn<Promise<T | null>>().mockResolvedValue(null),
    getManyAndCount: createMockFn<Promise<[T[], number]>>().mockResolvedValue([[], 0]),
    getCount: createMockFn<Promise<number>>().mockResolvedValue(0)
  };

  return {
    find: createMockFn<Promise<T[]>>().mockResolvedValue([]),
    findOne: createMockFn<Promise<T | null>>().mockResolvedValue(null),
    findOneBy: createMockFn<Promise<T | null>>().mockResolvedValue(null),
    save: createMockFn((entity: DeepPartial<T>) => Promise.resolve(entity as T)),
    create: createMockFn((dto: DeepPartial<T>) => dto as T),
    merge: createMockFn((entity: T, ...dtos: DeepPartial<T>[]) => ({ ...entity, ...dtos[0] })),
    delete: createMockFn().mockResolvedValue({ affected: 1 }),
    update: createMockFn().mockResolvedValue({ affected: 1 }),
    createQueryBuilder: createMockFn(() => queryBuilder)
  };
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
