import { MaintenanceRecord, MaintenanceType } from '../../../../src/domain/entities/maintenance-record.entity';
import { MaintenanceService } from '../../../../src/services/maintenance/adapters/input/maintenance.service';
import { IMaintenanceRepositoryPort } from '../../../../src/services/maintenance/ports/output/maintenance-repository.port';
import { MaintenanceFilters, MaintenanceCompletionData, MaintenancePart, MaintenanceStats } from '../../../../src/services/maintenance/ports/input/maintenance.port';
import { User } from '../../../../src/domain/entities/user.entity';
import { ATM } from '../../../../src/domain/entities/atm.entity';

describe('MaintenanceService', () => {
  let service: MaintenanceService;
  let repository: jest.Mocked<IMaintenanceRepositoryPort>;

  const mockUser: Partial<User> = {
    id: 'user1',
    email: 'technician@example.com'
  };

  const mockAtm: Partial<ATM> = {
    id: 'atm1',
    serial_number: 'ATM001'
  };

  function createMockMaintenanceRecord(data: Partial<MaintenanceRecord> = {}): MaintenanceRecord {
    const record = new MaintenanceRecord();
    Object.assign(record, {
      id: '1',
      ticket_id: 'ticket1',
      atm_id: 'atm1',
      technician_id: 'tech1',
      type: MaintenanceType.FIRST_LINE,
      diagnosis: 'Initial diagnosis',
      work_performed: 'Work in progress',
      parts_used: [],
      start_time: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
      created_by: mockUser as User,
      updated_by: mockUser as User,
      atm: mockAtm as ATM,
      ...data
    });
    return record;
  }

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      findByTicket: jest.fn(),
      findByATM: jest.fn(),
      findByTechnician: jest.fn(),
      findInProgress: jest.fn(),
      isTicketInMaintenance: jest.fn(),
      isTechnicianAvailable: jest.fn(),
      startMaintenance: jest.fn(),
      completeMaintenance: jest.fn(),
      addParts: jest.fn(),
      getMaintenanceStats: jest.fn(),
      getAverageDuration: jest.fn(),
      getMostUsedParts: jest.fn(),
      getTechnicianPerformance: jest.fn(),
      getMaintenanceHistory: jest.fn(),
      validateMaintenanceCompletion: jest.fn()
    };

    service = new MaintenanceService(repository);
  });

  describe('create', () => {
    const createMaintenanceData: Partial<MaintenanceRecord> = {
      ticket_id: 'ticket1',
      atm_id: 'atm1',
      technician_id: 'tech1',
      type: MaintenanceType.FIRST_LINE
    };

    it('should create a maintenance record successfully', async () => {
      const mockRecord = createMockMaintenanceRecord(createMaintenanceData);
      repository.create.mockResolvedValue(mockRecord);

      const result = await service.create(createMaintenanceData);

      expect(repository.create).toHaveBeenCalledWith({
        ...createMaintenanceData,
        start_time: expect.any(Date),
        parts_used: []
      });
      expect(result).toEqual(mockRecord);
    });

    it('should throw error if ATM ID is missing', async () => {
      const invalidData = { ...createMaintenanceData, atm_id: undefined };

      await expect(service.create(invalidData)).rejects.toThrow('ATM and Ticket IDs are required');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw error if ticket ID is missing', async () => {
      const invalidData = { ...createMaintenanceData, ticket_id: undefined };

      await expect(service.create(invalidData)).rejects.toThrow('ATM and Ticket IDs are required');
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateMaintenanceData: Partial<MaintenanceRecord> = {
      diagnosis: 'Updated diagnosis',
      work_performed: 'Additional work done'
    };

    it('should update a maintenance record successfully', async () => {
      const existingRecord = createMockMaintenanceRecord();
      const updatedRecord = createMockMaintenanceRecord(updateMaintenanceData);

      repository.findById.mockResolvedValue(existingRecord);
      repository.update.mockResolvedValue(updatedRecord);

      const result = await service.update('1', updateMaintenanceData);

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.update).toHaveBeenCalledWith('1', updateMaintenanceData);
      expect(result).toEqual(updatedRecord);
    });

    it('should throw error if maintenance record does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('999', updateMaintenanceData)).rejects.toThrow('Maintenance record not found');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should prevent updating core fields of completed maintenance', async () => {
      const completedRecord = createMockMaintenanceRecord({ end_time: new Date() });
      repository.findById.mockResolvedValue(completedRecord);

      const invalidUpdate = {
        start_time: new Date(),
        technician_id: 'tech2'
      };

      await expect(service.update('1', invalidUpdate)).rejects.toThrow('Cannot update core fields of completed maintenance');
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an incomplete maintenance record successfully', async () => {
      const record = createMockMaintenanceRecord();
      repository.findById.mockResolvedValue(record);

      await service.delete('1');

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error if maintenance record does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow('Maintenance record not found');
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw error if trying to delete completed maintenance', async () => {
      const completedRecord = createMockMaintenanceRecord({ end_time: new Date() });
      repository.findById.mockResolvedValue(completedRecord);

      await expect(service.delete('1')).rejects.toThrow('Cannot delete completed maintenance records');
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('startMaintenance', () => {
    it('should start maintenance successfully', async () => {
      repository.isTicketInMaintenance.mockResolvedValue(false);
      repository.isTechnicianAvailable.mockResolvedValue(true);
      repository.findByTicket.mockResolvedValue(createMockMaintenanceRecord());
      
      const mockStartedRecord = createMockMaintenanceRecord();
      repository.startMaintenance.mockResolvedValue(mockStartedRecord);

      const result = await service.startMaintenance('ticket1', 'tech1');

      expect(repository.isTicketInMaintenance).toHaveBeenCalledWith('ticket1');
      expect(repository.isTechnicianAvailable).toHaveBeenCalledWith('tech1');
      expect(repository.startMaintenance).toHaveBeenCalledWith(expect.objectContaining({
        ticket_id: 'ticket1',
        technician_id: 'tech1',
        type: MaintenanceType.FIRST_LINE,
        start_time: expect.any(Date)
      }));
      expect(result).toEqual(mockStartedRecord);
    });

    it('should throw error if ticket is already in maintenance', async () => {
      repository.isTicketInMaintenance.mockResolvedValue(true);

      await expect(service.startMaintenance('ticket1', 'tech1')).rejects.toThrow('Ticket is already in maintenance');
      expect(repository.startMaintenance).not.toHaveBeenCalled();
    });

    it('should throw error if technician is not available', async () => {
      repository.isTicketInMaintenance.mockResolvedValue(false);
      repository.isTechnicianAvailable.mockResolvedValue(false);

      await expect(service.startMaintenance('ticket1', 'tech1')).rejects.toThrow('Technician is not available');
      expect(repository.startMaintenance).not.toHaveBeenCalled();
    });
  });

  describe('completeMaintenance', () => {
    const completionData: MaintenanceCompletionData = {
      diagnosis: 'Final diagnosis',
      work_performed: 'Work completed',
      parts_used: [],
      end_time: new Date()
    };

    it('should complete maintenance successfully', async () => {
      const record = createMockMaintenanceRecord();
      const completedRecord = createMockMaintenanceRecord({ ...completionData });

      repository.findById.mockResolvedValue(record);
      repository.validateMaintenanceCompletion.mockResolvedValue({ isValid: true, errors: [] });
      repository.completeMaintenance.mockResolvedValue(completedRecord);

      const result = await service.completeMaintenance('1', completionData);

      expect(repository.validateMaintenanceCompletion).toHaveBeenCalledWith('1');
      expect(repository.completeMaintenance).toHaveBeenCalledWith('1', completionData);
      expect(result).toEqual(completedRecord);
    });

    it('should throw error if maintenance is already completed', async () => {
      const completedRecord = createMockMaintenanceRecord({ end_time: new Date() });
      repository.findById.mockResolvedValue(completedRecord);

      await expect(service.completeMaintenance('1', completionData)).rejects.toThrow('Maintenance is already completed');
      expect(repository.completeMaintenance).not.toHaveBeenCalled();
    });

    it('should throw error if completion validation fails', async () => {
      const record = createMockMaintenanceRecord();
      repository.findById.mockResolvedValue(record);
      repository.validateMaintenanceCompletion.mockResolvedValue({ 
        isValid: false, 
        errors: ['Missing required parts'] 
      });

      await expect(service.completeMaintenance('1', completionData)).rejects.toThrow('Invalid completion data: Missing required parts');
      expect(repository.completeMaintenance).not.toHaveBeenCalled();
    });
  });

  describe('addParts', () => {
    const parts: MaintenancePart[] = [
      { name: 'Part 1', quantity: 2 },
      { name: 'Part 2', quantity: 1, serialNumber: 'SN123' }
    ];

    it('should add parts successfully', async () => {
      const record = createMockMaintenanceRecord();
      const updatedRecord = createMockMaintenanceRecord({ parts_used: parts });

      repository.findById.mockResolvedValue(record);
      repository.addParts.mockResolvedValue(updatedRecord);

      const result = await service.addParts('1', parts);

      expect(repository.addParts).toHaveBeenCalledWith('1', parts);
      expect(result.parts_used).toEqual(parts);
    });

    it('should throw error if maintenance is completed', async () => {
      const completedRecord = createMockMaintenanceRecord({ end_time: new Date() });
      repository.findById.mockResolvedValue(completedRecord);

      await expect(service.addParts('1', parts)).rejects.toThrow('Cannot add parts to completed maintenance');
      expect(repository.addParts).not.toHaveBeenCalled();
    });

    it('should throw error if parts data is invalid', async () => {
      const record = createMockMaintenanceRecord();
      repository.findById.mockResolvedValue(record);

      const invalidParts = [{ name: 'Invalid Part', quantity: 0 }];

      await expect(service.addParts('1', invalidParts)).rejects.toThrow('Invalid parts data');
      expect(repository.addParts).not.toHaveBeenCalled();
    });
  });

  describe('queries and statistics', () => {
    it('should list maintenance records with filters', async () => {
      const filters: MaintenanceFilters = {
        type: [MaintenanceType.FIRST_LINE],
        isComplete: false
      };

      const mockResult = {
        records: [createMockMaintenanceRecord()],
        total: 1
      };

      repository.list.mockResolvedValue(mockResult);

      const result = await service.list(filters);

      expect(repository.list).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });

    it('should get maintenance statistics', async () => {
      const filters: MaintenanceFilters = { isComplete: true };
      const mockStats: MaintenanceStats = {
        totalCount: 10,
        completedCount: 8,
        averageDuration: 3600,
        byType: {
          [MaintenanceType.FIRST_LINE]: 5,
          [MaintenanceType.SECOND_LINE]: 3,
          [MaintenanceType.VISIT]: 2
        },
        mostCommonParts: [
          { name: 'Part 1', count: 5 }
        ],
        technicianPerformance: [
          {
            technician_id: 'tech1',
            completed_count: 8,
            average_duration: 3000
          }
        ]
      };

      repository.getMaintenanceStats.mockResolvedValue(mockStats);

      const result = await service.getMaintenanceStats(filters);

      expect(repository.getMaintenanceStats).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockStats);
    });

    it('should get maintenance history for ATM', async () => {
      const mockHistory = {
        total_count: 5,
        last_maintenance: new Date(),
        maintenance_types: {
          [MaintenanceType.FIRST_LINE]: 3,
          [MaintenanceType.SECOND_LINE]: 2,
          [MaintenanceType.VISIT]: 0
        },
        total_parts_used: 10,
        common_issues: ['Paper jam', 'Card reader error']
      };

      repository.getMaintenanceHistory.mockResolvedValue(mockHistory);

      const result = await repository.getMaintenanceHistory('atm1');

      expect(repository.getMaintenanceHistory).toHaveBeenCalledWith('atm1');
      expect(result).toEqual(mockHistory);
    });

    it('should get technician performance', async () => {
      const mockPerformance = {
        completed_count: 15,
        average_duration: 2400,
        most_common_type: MaintenanceType.FIRST_LINE
      };

      repository.getTechnicianPerformance.mockResolvedValue(mockPerformance);

      const result = await repository.getTechnicianPerformance('tech1');

      expect(repository.getTechnicianPerformance).toHaveBeenCalledWith('tech1');
      expect(result).toEqual(mockPerformance);
    });
  });
});