import { DataSource, Repository } from 'typeorm';
import { MaintenanceRepository } from '../../../../src/services/maintenance/adapters/output/maintenance.repository';
import { MaintenanceRecord, MaintenanceType } from '../../../../src/domain/entities/maintenance-record.entity';
import { User } from '../../../../src/domain/entities/user.entity';
import { ATM } from '../../../../src/domain/entities/atm.entity';
import { Ticket } from '../../../../src/domain/entities/ticket.entity';
import { MaintenancePart } from '../../../../src/services/maintenance/ports/input/maintenance.port';

describe('MaintenanceRepository', () => {
  let repository: MaintenanceRepository;
  let dataSource: jest.Mocked<DataSource>;
  let typeormRepository: jest.Mocked<Repository<MaintenanceRecord>>;

  const mockUser = new User();
  Object.assign(mockUser, {
    id: 'user1',
    username: 'technician',
    email: 'tech@example.com'
  });

  const mockAtm = new ATM();
  Object.assign(mockAtm, {
    id: 'atm1',
    serial_number: 'ATM001'
  });

  const mockTicket = new Ticket();
  Object.assign(mockTicket, {
    id: 'ticket1',
    atm_id: mockAtm.id
  });

  const mockPart: MaintenancePart = {
    name: 'Test Part',
    quantity: 1,
    serialNumber: 'SN123',
    notes: 'Test Notes'
  };

  function createMockMaintenanceRecord(overrides: Partial<MaintenanceRecord> = {}): MaintenanceRecord {
    const record = new MaintenanceRecord();

    // Métodos base de la entidad
    record.getDuration = jest.fn().mockReturnValue(3600000);
    record.isComplete = jest.fn().mockReturnValue(!!record.end_time);
    record.getTotalPartsUsed = jest.fn().mockReturnValue(1);
    record.getPartsList = jest.fn().mockReturnValue(['Test Part (1) - S/N: SN123']);

    // Propiedades base
    Object.assign(record, {
      id: 'maintenance1',
      ticket_id: 'ticket1',
      atm_id: 'atm1',
      technician_id: 'user1',
      type: MaintenanceType.FIRST_LINE,
      diagnosis: 'Test Diagnosis',
      work_performed: 'Test Work',
      parts_used: [mockPart],
      start_time: new Date(),
      end_time: undefined,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: mockUser,
      updated_by: mockUser,
      ticket: mockTicket,
      atm: mockAtm,
      technician: mockUser
    }, overrides);

    return record;
  }

  beforeEach(() => {
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
      query: jest.fn()
    } as unknown as jest.Mocked<Repository<MaintenanceRecord>>;

    dataSource = {
      getRepository: jest.fn().mockReturnValue(typeormRepository)
    } as unknown as jest.Mocked<DataSource>;

    repository = new MaintenanceRepository(dataSource);
  });

  describe('CRUD Operations', () => {
    describe('findById', () => {
      it('should find maintenance record by id with relations', async () => {
        const mockRecord = createMockMaintenanceRecord();
        typeormRepository.findOne.mockResolvedValue(mockRecord);

        const result = await repository.findById('maintenance1');

        expect(typeormRepository.findOne).toHaveBeenCalledWith({
          where: { id: 'maintenance1' },
          relations: ['ticket', 'atm', 'technician', 'created_by', 'updated_by']
        });
        expect(result).toEqual(mockRecord);
      });
    });

    describe('create', () => {
      it('should create new maintenance record', async () => {
        const mockRecord = createMockMaintenanceRecord();
        typeormRepository.create.mockReturnValue(mockRecord);
        typeormRepository.save.mockResolvedValue(mockRecord);

        const result = await repository.create(mockRecord);

        expect(typeormRepository.create).toHaveBeenCalledWith(mockRecord);
        expect(typeormRepository.save).toHaveBeenCalledWith(mockRecord);
        expect(result).toEqual(mockRecord);
      });
    });

    describe('update', () => {
      it('should update existing maintenance record', async () => {
        const mockRecord = createMockMaintenanceRecord();
        const updateData = { diagnosis: 'Updated Diagnosis' };
        const updatedRecord = createMockMaintenanceRecord({ ...mockRecord, ...updateData });

        typeormRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
        typeormRepository.findOne.mockResolvedValue(updatedRecord);

        const result = await repository.update('maintenance1', updateData);

        expect(typeormRepository.update).toHaveBeenCalledWith('maintenance1', updateData);
        expect(result.diagnosis).toBe('Updated Diagnosis');
      });
    });
  });

  describe('Specific Queries', () => {
    describe('findByTicket', () => {
      it('should find maintenance record by ticket', async () => {
        const mockRecord = createMockMaintenanceRecord();
        typeormRepository.findOne.mockResolvedValue(mockRecord);

        const result = await repository.findByTicket('ticket1');

        expect(typeormRepository.findOne).toHaveBeenCalledWith({
          where: { ticket_id: 'ticket1' },
          relations: ['technician', 'atm']
        });
        expect(result).toEqual(mockRecord);
      });
    });

    describe('findInProgress', () => {
      it('should find in-progress maintenance records', async () => {
        const mockRecord = createMockMaintenanceRecord();
        typeormRepository.find.mockResolvedValue([mockRecord]);

        const result = await repository.findInProgress();

        expect(typeormRepository.find).toHaveBeenCalledWith({
          where: { end_time: undefined },
          relations: ['atm', 'technician', 'ticket']
        });
        expect(result).toHaveLength(1);
      });
    });
  });

  describe('Maintenance Operations', () => {
    describe('startMaintenance', () => {
      it('should start new maintenance', async () => {
        const startData = {
          ticket_id: 'ticket1',
          atm_id: 'atm1',
          technician_id: 'user1',
          type: MaintenanceType.FIRST_LINE,
          start_time: new Date()
        };

        const mockRecord = createMockMaintenanceRecord(startData);
        typeormRepository.create.mockReturnValue(mockRecord);
        typeormRepository.save.mockResolvedValue(mockRecord);

        const result = await repository.startMaintenance(startData);

        expect(typeormRepository.create).toHaveBeenCalledWith(startData);
        expect(result).toEqual(mockRecord);
      });
    });

    describe('completeMaintenance', () => {
      it('should complete maintenance record', async () => {
        const mockRecord = createMockMaintenanceRecord();
        const completionData = {
          diagnosis: 'Final Diagnosis',
          work_performed: 'Work Done',
          parts_used: [mockPart],
          end_time: new Date()
        };

        const completedRecord = createMockMaintenanceRecord({ ...mockRecord, ...completionData });
        typeormRepository.findOne.mockResolvedValue(mockRecord);
        typeormRepository.save.mockResolvedValue(completedRecord);

        const result = await repository.completeMaintenance('maintenance1', completionData);

        expect(typeormRepository.save).toHaveBeenCalled();
        expect(result.end_time).toBeDefined();
      });
    });
  });

  describe('Stats and Analysis', () => {
    describe('getMaintenanceStats', () => {
      it('should return maintenance statistics', async () => {
        const mockQueryBuilder = {
          clone: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([{
            total_count: '10',
            completed_count: '8',
            avg_duration: '3600'
          }]),
          getRawOne: jest.fn().mockResolvedValue({
            total_count: '10',
            completed_count: '8',
            avg_duration: '3600'
          })
        };

        typeormRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

        const result = await repository.getMaintenanceStats({});

        expect(typeormRepository.createQueryBuilder).toHaveBeenCalledWith('maintenance');
        expect(result).toBeDefined();
        expect(result.totalCount).toBe(10);
      });
    });
  });

  describe('Validations', () => {
    describe('validateMaintenanceCompletion', () => {
      it('should validate complete maintenance record', async () => {
        const mockRecord = createMockMaintenanceRecord({
          diagnosis: 'Complete Diagnosis',
          work_performed: 'Complete Work',
          parts_used: [mockPart],
          end_time: new Date()
        });

        typeormRepository.findOne.mockResolvedValue(mockRecord);

        const result = await repository.validateMaintenanceCompletion('maintenance1');

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should return validation errors for incomplete record', async () => {
        const mockRecord = createMockMaintenanceRecord({
          diagnosis: '',
          work_performed: '',
          parts_used: [],
          end_time: undefined
        });

        typeormRepository.findOne.mockResolvedValue(mockRecord);

        const result = await repository.validateMaintenanceCompletion('maintenance1');

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });
});