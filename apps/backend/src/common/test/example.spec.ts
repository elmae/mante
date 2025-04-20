import { Test, TestingModule } from '@nestjs/testing';
import { ObjectLiteral } from 'typeorm';
import {
  createMockRepository,
  createTestingModule,
  createTestObject,
  expectAsync,
  TEST_CONFIG,
  TEST_CONSTANTS,
  MockRepository,
  JestMockFn
} from './';

// Example entity for testing
interface TestEntity extends ObjectLiteral {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Example service for testing
class TestService {
  constructor(private repository: MockRepository<TestEntity>) {}

  async findAll(): Promise<TestEntity[]> {
    return this.repository.find();
  }

  async findOne(id: string): Promise<TestEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<TestEntity>): Promise<TestEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }
}

describe('Test Utilities Example', () => {
  let module: TestingModule;
  let service: TestService;
  let repository: MockRepository<TestEntity>;

  beforeAll(async () => {
    // Crear módulo de prueba
    module = await Test.createTestingModule({
      providers: [
        TestService,
        {
          provide: 'TEST_REPOSITORY',
          useFactory: () => createMockRepository<TestEntity>()
        }
      ]
    }).compile();

    service = module.get(TestService);
    repository = module.get('TEST_REPOSITORY');
  });

  beforeEach(() => {
    // Limpiar mocks entre pruebas
    jest.clearAllMocks();
  });

  describe('Repository Mocking', () => {
    it('should mock find operation', async () => {
      const mockData: TestEntity[] = [
        {
          id: TEST_CONSTANTS.VALID_UUID,
          name: 'Test Entity',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Configurar mock
      jest.spyOn(repository, 'find').mockResolvedValue(mockData);

      // Ejecutar y verificar
      const result = await service.findAll();
      expect(result).toEqual(mockData);
      expect(repository.find).toHaveBeenCalled();
    });

    it('should mock findOne operation', async () => {
      const mockEntity = createTestObject<TestEntity>({
        id: TEST_CONSTANTS.VALID_UUID,
        name: 'Test Entity',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockEntity);

      const result = await service.findOne(TEST_CONSTANTS.VALID_UUID);
      expect(result).toEqual(mockEntity);
      expect(repository.findOne).toHaveBeenCalled();
    });

    it('should handle async operations with expectAsync', async () => {
      const mockError = new Error('Not found');
      jest.spyOn(repository, 'findOne').mockRejectedValue(mockError);

      await expectAsync(
        service.findOne('invalid-id'),
        () => fail('Should not resolve'),
        error => expect(error).toBe(mockError)
      );
    });
  });

  describe('Query Builder Mocking', () => {
    it('should mock complex queries', async () => {
      const queryBuilder = repository.createQueryBuilder();
      const mockResult: TestEntity[] = [
        {
          id: '1',
          name: 'Test',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      queryBuilder.where.mockReturnThis();
      queryBuilder.andWhere.mockReturnThis();
      queryBuilder.orderBy.mockReturnThis();
      queryBuilder.getMany.mockResolvedValue(mockResult);

      const result = await queryBuilder
        .where('entity.name = :name', { name: 'Test' })
        .andWhere('entity.active = :active', { active: true })
        .orderBy('entity.createdAt', 'DESC')
        .getMany();

      expect(result).toEqual(mockResult);
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.andWhere).toHaveBeenCalled();
      expect(queryBuilder.orderBy).toHaveBeenCalled();
    });
  });

  describe('Custom Matchers', () => {
    it('should validate UUIDs', () => {
      expect(TEST_CONSTANTS.VALID_UUID).toBeUUID();
      expect(TEST_CONSTANTS.INVALID_UUID).not.toBeUUID();
    });

    it('should validate ISO dates', () => {
      const isoDate = new Date().toISOString();
      expect(isoDate).toBeISODate();
      expect('invalid-date').not.toBeISODate();
    });
  });

  describe('Configuration', () => {
    it('should provide test configuration', () => {
      expect(TEST_CONFIG.database).toBeDefined();
      expect(TEST_CONFIG.database.host).toBe('localhost');
      expect(TEST_CONFIG.database.port).toBe(5432);
    });

    it('should provide test constants', () => {
      expect(TEST_CONSTANTS.VALID_EMAIL).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
      expect(TEST_CONSTANTS.VALID_PASSWORD).toMatch(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
      );
    });
  });
});
