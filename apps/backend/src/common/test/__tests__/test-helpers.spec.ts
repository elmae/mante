import {
  createMockExecutionContext,
  createMockConfigService,
  createMockRepository,
  createTestingModule,
  createTestObject,
  expectAsync,
  expectDatesEqual
} from '../test-helpers';
import { ConfigService } from '@nestjs/config';
import { ObjectLiteral } from 'typeorm';

describe('Test Helpers', () => {
  describe('createMockExecutionContext', () => {
    it('should create a basic execution context', () => {
      const context = createMockExecutionContext();
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();

      expect(request.url).toBe('/test');
      expect(request.method).toBe('GET');
      expect(response.statusCode).toBe(200);
    });

    it('should merge custom data', () => {
      const context = createMockExecutionContext({
        request: { url: '/custom', user: { id: 1 } },
        response: { statusCode: 201 }
      });

      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();

      expect(request.url).toBe('/custom');
      expect(request.user.id).toBe(1);
      expect(response.statusCode).toBe(201);
    });
  });

  describe('createMockConfigService', () => {
    it('should return config values', () => {
      const config = {
        key1: 'value1',
        key2: 'value2'
      };

      const configService = createMockConfigService(config);

      // Aseguramos que los métodos están definidos
      expect(configService.get).toBeDefined();
      expect(configService.getOrThrow).toBeDefined();

      // Verificamos el comportamiento
      const value1 = configService.get?.('key1');
      const value2 = configService.get?.('key2');
      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
    });

    it('should throw on getOrThrow for missing keys', () => {
      const configService = createMockConfigService({});
      expect(configService.getOrThrow).toBeDefined();
      expect(() => configService.getOrThrow?.('missing')).toThrow();
    });
  });

  describe('createMockRepository', () => {
    interface TestEntity extends ObjectLiteral {
      id: number;
      name: string;
    }

    let repository: ReturnType<typeof createMockRepository<TestEntity>>;

    beforeEach(() => {
      repository = createMockRepository<TestEntity>();
    });

    it('should create repository with all methods', () => {
      expect(repository.find).toBeDefined();
      expect(repository.findOne).toBeDefined();
      expect(repository.save).toBeDefined();
      expect(repository.create).toBeDefined();
      expect(repository.createQueryBuilder).toBeDefined();
    });

    it('should handle save operations', async () => {
      const entity = { id: 1, name: 'test' };
      const saved = await repository.save(entity);
      expect(saved).toEqual(entity);
    });

    it('should handle query builder operations', () => {
      const queryBuilder = repository.createQueryBuilder();
      expect(queryBuilder.where).toBeDefined();
      expect(queryBuilder.andWhere).toBeDefined();
      expect(queryBuilder.orderBy).toBeDefined();
    });
  });

  describe('createTestingModule', () => {
    it('should create a module with providers', async () => {
      const module = await createTestingModule({
        providers: [{ provide: 'TEST', useValue: 'test' }]
      });

      expect(module).toBeDefined();
      expect(module.get('TEST')).toBe('test');
    });

    it('should inject config service', async () => {
      const module = await createTestingModule({});
      const configService = module.get(ConfigService);

      expect(configService).toBeDefined();
      expect(configService.get('NODE_ENV')).toBe('test');
    });
  });

  describe('expectAsync', () => {
    it('should handle resolved promises', async () => {
      await expectAsync(Promise.resolve('test'), result => expect(result).toBe('test'));
    });

    it('should handle rejected promises', async () => {
      const error = new Error('test error');
      await expectAsync(
        Promise.reject(error),
        () => fail('Should not resolve'),
        err => expect(err).toBe(error)
      );
    });
  });

  describe('createTestObject', () => {
    it('should merge partial with defaults', () => {
      interface TestObject extends ObjectLiteral {
        id: number;
        name: string;
        optional?: string;
      }

      const defaults: Partial<TestObject> = {
        name: 'default',
        optional: 'default'
      };

      const partial: Partial<TestObject> = {
        id: 1,
        name: 'test'
      };

      const result = createTestObject<TestObject>(partial, defaults);
      expect(result).toEqual({
        id: 1,
        name: 'test',
        optional: 'default'
      });
    });
  });

  describe('expectDatesEqual', () => {
    it('should compare dates correctly', () => {
      const date1 = new Date('2025-01-01');
      const date2 = new Date('2025-01-01');
      const date3 = new Date('2025-01-02');

      expect(() => expectDatesEqual(date1, date2)).not.toThrow();
      expect(() => expectDatesEqual(date1, date3)).toThrow();
    });
  });
});
