import { DataSource, Repository } from 'typeorm';
import { SLARepository } from '../../../../src/services/sla/adapters/output/sla.repository';
import { SLAConfig, MaintenanceType } from '../../../../src/domain/entities/sla-config.entity';
import { User } from '../../../../src/domain/entities/user.entity';
import { GeographicZone } from '../../../../src/domain/entities/geographic-zone.entity';

describe('SLARepository', () => {
  let repository: SLARepository;
  let dataSource: jest.Mocked<DataSource>;
  let typeormRepository: jest.Mocked<Repository<SLAConfig>>;
  let managerQueryMock: jest.Mock;

  const mockUser = new User();
  Object.assign(mockUser, {
    id: 'user1',
    username: 'admin',
    email: 'admin@example.com'
  });

  const mockZone = new GeographicZone();
  Object.assign(mockZone, {
    id: 'zone1',
    name: 'Test Zone'
  });

  function createMockSLAConfig(overrides: Partial<SLAConfig> = {}): SLAConfig {
    const sla = new SLAConfig();
    Object.assign(sla, {
      id: 'sla1',
      zone_id: 'zone1',
      client_id: 'client1',
      maintenance_type: MaintenanceType.FIRST_LINE,
      response_time: '2 hours',
      resolution_time: '8 hours',
      created_at: new Date(),
      updated_at: new Date(),
      created_by_id: 'user1',
      updated_by_id: 'user1',
      zone: mockZone,
      client: mockUser,
      created_by: mockUser,
      updated_by: mockUser,
      getResponseTimeInMinutes: jest.fn().mockReturnValue(120),
      getResolutionTimeInMinutes: jest.fn().mockReturnValue(480),
      isWithinResponseTime: jest.fn().mockReturnValue(true),
      isWithinResolutionTime: jest.fn().mockReturnValue(true),
      calculateCompliance: jest.fn().mockReturnValue({
        responseTimeCompliance: 100,
        resolutionTimeCompliance: 100
      }),
      ...overrides
    });
    return sla;
  }

  beforeEach(() => {
    managerQueryMock = jest.fn();
    
    typeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAndCount: jest.fn(),
      createQueryBuilder: jest.fn(),
      count: jest.fn(),
      query: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue({
          count: jest.fn()
        }),
        query: managerQueryMock
      }
    } as unknown as jest.Mocked<Repository<SLAConfig>>;

    dataSource = {
      getRepository: jest.fn().mockReturnValue(typeormRepository)
    } as unknown as jest.Mocked<DataSource>;

    repository = new SLARepository(dataSource);
  });

  describe('CRUD Operations', () => {
    describe('findById', () => {
      it('should find SLA config by id with relations', async () => {
        const mockSLA = createMockSLAConfig();
        typeormRepository.findOne.mockResolvedValue(mockSLA);

        const result = await repository.findById('sla1');

        expect(typeormRepository.findOne).toHaveBeenCalledWith({
          where: { id: 'sla1' },
          relations: ['zone', 'client', 'created_by', 'updated_by']
        });
        expect(result).toEqual(mockSLA);
      });
    });

    describe('create', () => {
      it('should create new SLA config', async () => {
        const mockSLA = createMockSLAConfig();
        typeormRepository.create.mockReturnValue(mockSLA);
        typeormRepository.save.mockResolvedValue(mockSLA);

        const result = await repository.create(mockSLA);

        expect(typeormRepository.create).toHaveBeenCalledWith(mockSLA);
        expect(typeormRepository.save).toHaveBeenCalledWith(mockSLA);
        expect(result).toEqual(mockSLA);
      });
    });

    describe('update', () => {
      it('should update existing SLA config', async () => {
        const mockSLA = createMockSLAConfig();
        const updateData = { response_time: '3 hours' };
        const updatedSLA = createMockSLAConfig({ ...mockSLA, ...updateData });

        typeormRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
        typeormRepository.findOne.mockResolvedValue(updatedSLA);

        const result = await repository.update('sla1', updateData);

        expect(typeormRepository.update).toHaveBeenCalledWith('sla1', updateData);
        expect(result.response_time).toBe('3 hours');
      });
    });
  });

  describe('Specific Queries', () => {
    describe('findByZone', () => {
      it('should find SLA configs by zone', async () => {
        const mockSLA = createMockSLAConfig();
        typeormRepository.find.mockResolvedValue([mockSLA]);

        const result = await repository.findByZone('zone1');

        expect(typeormRepository.find).toHaveBeenCalledWith({
          where: { zone_id: 'zone1' },
          relations: ['client']
        });
        expect(result).toHaveLength(1);
      });
    });

    describe('findActive', () => {
      it('should find all active SLA configs', async () => {
        const mockSLA = createMockSLAConfig();
        typeormRepository.find.mockResolvedValue([mockSLA]);

        const result = await repository.findActive();

        expect(typeormRepository.find).toHaveBeenCalledWith({
          relations: ['zone', 'client']
        });
        expect(result).toHaveLength(1);
      });
    });
  });

  describe('Validations', () => {
    describe('validateConfiguration', () => {
      it('should validate complete SLA configuration', async () => {
        const mockSLA = createMockSLAConfig();
        typeormRepository.manager.getRepository('geographic_zones').count = jest.fn().mockResolvedValue(1);
        typeormRepository.manager.getRepository('users').count = jest.fn().mockResolvedValue(1);
        
        const result = await repository.validateConfiguration(mockSLA);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should return validation errors for invalid configuration', async () => {
        const invalidSLA = createMockSLAConfig({
          zone_id: 'invalid-zone',
          client_id: 'invalid-client',
          response_time: 'invalid-format'
        });

        typeormRepository.manager.getRepository('geographic_zones').count = jest.fn().mockResolvedValue(0);
        typeormRepository.manager.getRepository('users').count = jest.fn().mockResolvedValue(0);

        const result = await repository.validateConfiguration(invalidSLA);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Statistics and Compliance', () => {
    describe('getComplianceStats', () => {
      it('should return compliance statistics', async () => {
        const mockStats = [{
          total_tickets: '10',
          response_violations: '1',
          resolution_violations: '2',
          avg_response_time: '45',
          avg_resolution_time: '240'
        }];

        const mockDetails = [
          {
            ticket_id: 'ticket1',
            response_time: '30',
            resolution_time: '180',
            is_compliant: true
          }
        ];

        managerQueryMock
          .mockResolvedValueOnce(mockStats)
          .mockResolvedValueOnce(mockDetails);

        const result = await repository.getComplianceStats('sla1', new Date(), new Date());

        expect(result.totalTickets).toBe(10);
        expect(result.ticketDetails).toHaveLength(1);
      });
    });

    describe('getZonePerformance', () => {
      it('should return zone performance statistics', async () => {
        const mockStats = [{
          maintenance_type: MaintenanceType.FIRST_LINE,
          total: '10',
          compliant: '8',
          avg_response: '45',
          avg_resolution: '240'
        }];

        managerQueryMock.mockResolvedValue(mockStats);

        const result = await repository.getZonePerformance('zone1', {
          start: new Date(),
          end: new Date()
        });

        expect(result.totalSLAs).toBe(10);
        expect(result.compliantSLAs).toBe(8);
      });
    });
  });
});