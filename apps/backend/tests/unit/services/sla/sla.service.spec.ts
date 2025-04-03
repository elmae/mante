import { SLAConfig, MaintenanceType } from '../../../../src/domain/entities/sla-config.entity';
import { SLAService } from '../../../../src/services/sla/adapters/input/sla.service';
import { ISlaRepositoryPort } from '../../../../src/services/sla/ports/output/sla-repository.port';
import { SLAFilters, SLAComplianceResult, SLAValidationResult } from '../../../../src/services/sla/ports/input/sla.port';
import { User } from '../../../../src/domain/entities/user.entity';
import { GeographicZone } from '../../../../src/domain/entities/geographic-zone.entity';

describe('SLAService', () => {
  let service: SLAService;
  let repository: jest.Mocked<ISlaRepositoryPort>;

  const mockUser: Partial<User> = {
    id: 'user1',
    email: 'admin@example.com'
  };

  const mockZone: Partial<GeographicZone> = {
    id: 'zone1',
    name: 'Santo Domingo'
  };

  function createMockSLAConfig(data: Partial<SLAConfig> = {}): SLAConfig {
    const config = new SLAConfig();
    Object.assign(config, {
      id: '1',
      zone_id: 'zone1',
      client_id: 'client1',
      maintenance_type: MaintenanceType.FIRST_LINE,
      response_time: '2 hours',
      resolution_time: '8 hours',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: mockUser as User,
      updated_by: mockUser as User,
      zone: mockZone as GeographicZone,
      ...data
    });
    return config;
  }

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      findByZone: jest.fn(),
      findByClient: jest.fn(),
      findByMaintenanceType: jest.fn(),
      findActive: jest.fn(),
      validateConfiguration: jest.fn(),
      isConflicting: jest.fn(),
      validateZoneExists: jest.fn(),
      validateClientExists: jest.fn(),
      getComplianceStats: jest.fn(),
      getZonePerformance: jest.fn(),
      getComplianceTrends: jest.fn(),
      getMostFrequentViolations: jest.fn(),
      getSLAHistory: jest.fn()
    };

    service = new SLAService(repository);
  });

  describe('create', () => {
    const createSLAData: Partial<SLAConfig> = {
      zone_id: 'zone1',
      maintenance_type: MaintenanceType.FIRST_LINE,
      response_time: '2 hours',
      resolution_time: '8 hours'
    };

    it('should create an SLA configuration successfully', async () => {
      repository.validateConfiguration.mockResolvedValue({ isValid: true, errors: [] });
      repository.isConflicting.mockResolvedValue(false);
      
      const mockConfig = createMockSLAConfig(createSLAData);
      repository.create.mockResolvedValue(mockConfig);

      const result = await service.create(createSLAData);

      expect(repository.validateConfiguration).toHaveBeenCalledWith(createSLAData);
      expect(repository.isConflicting).toHaveBeenCalledWith(createSLAData);
      expect(repository.create).toHaveBeenCalledWith(createSLAData);
      expect(result).toEqual(mockConfig);
    });

    it('should throw error if configuration is invalid', async () => {
      repository.validateConfiguration.mockResolvedValue({
        isValid: false,
        errors: ['Invalid response time format']
      });

      await expect(service.create(createSLAData)).rejects.toThrow('Invalid SLA configuration: Invalid response time format');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw error if configuration conflicts with existing SLA', async () => {
      repository.validateConfiguration.mockResolvedValue({ isValid: true, errors: [] });
      repository.isConflicting.mockResolvedValue(true);

      await expect(service.create(createSLAData)).rejects.toThrow(
        'An SLA configuration already exists for this combination of zone, client and maintenance type'
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateSLAData: Partial<SLAConfig> = {
      response_time: '3 hours',
      resolution_time: '12 hours'
    };

    it('should update an SLA configuration successfully', async () => {
      const existingConfig = createMockSLAConfig();
      const updatedConfig = createMockSLAConfig(updateSLAData);

      repository.findById.mockResolvedValue(existingConfig);
      repository.validateConfiguration.mockResolvedValue({ isValid: true, errors: [] });
      repository.update.mockResolvedValue(updatedConfig);

      const result = await service.update('1', updateSLAData);

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.validateConfiguration).toHaveBeenCalledWith(expect.objectContaining({
        ...existingConfig,
        ...updateSLAData
      }));
      expect(repository.update).toHaveBeenCalledWith('1', updateSLAData);
      expect(result).toEqual(updatedConfig);
    });

    it('should throw error if SLA configuration does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('999', updateSLAData)).rejects.toThrow('SLA configuration not found');
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('compliance calculations', () => {
    const mockComplianceStats = {
      totalTickets: 10,
      responseTimeViolations: 2,
      resolutionTimeViolations: 1,
      averageResponseTime: 90,
      averageResolutionTime: 360,
      ticketDetails: [
        {
          ticketId: 'ticket1',
          responseTime: 45,
          resolutionTime: 180,
          isCompliant: true
        }
      ]
    };

    const mockZonePerformance = {
      totalSLAs: 5,
      compliantSLAs: 4,
      averageResponseTime: 75,
      averageResolutionTime: 240,
      complianceByType: {
        [MaintenanceType.FIRST_LINE]: { total: 3, compliant: 2 },
        [MaintenanceType.SECOND_LINE]: { total: 2, compliant: 2 },
        [MaintenanceType.VISIT]: { total: 0, compliant: 0 }
      }
    };

    it('should calculate compliance successfully', async () => {
      const config = createMockSLAConfig();
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      repository.findById.mockResolvedValue(config);
      repository.getComplianceStats.mockResolvedValue(mockComplianceStats);
      repository.getZonePerformance.mockResolvedValue(mockZonePerformance);

      const result = await service.calculateCompliance('1', startDate, endDate);

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.getComplianceStats).toHaveBeenCalledWith('1', startDate, endDate);
      expect(result).toMatchObject({
        sla: config,
        period: { start: startDate, end: endDate },
        metrics: {
          totalTickets: 10,
          responseTimeCompliance: 80,
          resolutionTimeCompliance: 90
        }
      });
    });

    it('should validate SLA for specific ticket', async () => {
      const config = createMockSLAConfig();
      repository.findById.mockResolvedValue(config);
      repository.getComplianceStats.mockResolvedValue(mockComplianceStats);

      const result = await service.validateSLA('1', 'ticket1');

      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.recommendations).toHaveLength(0);
    });

    it('should identify SLA violations for ticket', async () => {
      const config = createMockSLAConfig();
      const statsWithViolations = {
        ...mockComplianceStats,
        ticketDetails: [{
          ticketId: 'ticket1',
          responseTime: 180, // 3 hours, exceeds 2-hour response time
          resolutionTime: 540, // 9 hours, exceeds 8-hour resolution time
          isCompliant: false
        }]
      };

      repository.findById.mockResolvedValue(config);
      repository.getComplianceStats.mockResolvedValue(statsWithViolations);

      const result = await service.validateSLA('1', 'ticket1');

      expect(result.isValid).toBe(false);
      expect(result.violations).toHaveLength(2);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('active SLAs', () => {
    it('should get list of active SLAs', async () => {
      const configs = [createMockSLAConfig()];
      repository.findActive.mockResolvedValue(configs);

      const result = await service.getActiveSLAs();

      expect(repository.findActive).toHaveBeenCalled();
      expect(result).toEqual(configs);
    });
  });
});