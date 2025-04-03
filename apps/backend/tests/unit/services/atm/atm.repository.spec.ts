import { DataSource, Repository, UpdateResult } from 'typeorm';
import { AtmRepository } from '../../../../src/services/atm/adapters/output/atm.repository';
import { ATM } from '../../../../src/domain/entities/atm.entity';
import { User } from '../../../../src/domain/entities/user.entity';
import { Point } from 'geojson';

describe('AtmRepository', () => {
  let repository: AtmRepository;
  let dataSource: jest.Mocked<DataSource>;
  let typeormRepository: jest.Mocked<Repository<ATM>>;

  const mockUser: Partial<User> = {
    id: 'user1',
    username: 'testuser',
    email: 'test@example.com'
  };

  const mockPoint: Point = {
    type: 'Point',
    coordinates: [-69.9388777, 18.4860575]
  };

  const createMockAtm = (): ATM => {
    const atm = new ATM();
    Object.assign(atm, {
      id: 'atm1',
      serial_number: 'ATM001',
      model: 'Test Model',
      brand: 'Test Brand',
      location: mockPoint,
      address: 'Test Address',
      technical_specs: {
        cpu: 'Test CPU',
        memory: '4GB',
        os: 'Test OS',
        cash_capacity: 1000,
        supported_transactions: ['withdrawal']
      },
      client_id: 'client1',
      zone_id: 'zone1',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: mockUser as User,
      updated_by: mockUser as User,
      client: mockUser as User,
      tickets: []
    });
    return atm;
  };

  const mockUpdateResult: UpdateResult = {
    affected: 1,
    raw: [],
    generatedMaps: []
  };

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
      query: jest.fn()
    } as unknown as jest.Mocked<Repository<ATM>>;

    dataSource = {
      getRepository: jest.fn().mockReturnValue(typeormRepository)
    } as unknown as jest.Mocked<DataSource>;

    repository = new AtmRepository(dataSource);
  });

  describe('findById', () => {
    it('should find ATM by id with relations', async () => {
      const mockAtm = createMockAtm();
      typeormRepository.findOne.mockResolvedValue(mockAtm);

      const result = await repository.findById('atm1');

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'atm1' },
        relations: ['client', 'created_by', 'updated_by']
      });
      expect(result).toEqual(mockAtm);
    });

    it('should return null when ATM not found', async () => {
      typeormRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findBySerialNumber', () => {
    it('should find ATM by serial number', async () => {
      const mockAtm = createMockAtm();
      typeormRepository.findOne.mockResolvedValue(mockAtm);

      const result = await repository.findBySerialNumber('ATM001');

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { serial_number: 'ATM001' }
      });
      expect(result).toEqual(mockAtm);
    });
  });

  describe('create', () => {
    it('should create new ATM', async () => {
      const mockAtm = createMockAtm();
      typeormRepository.create.mockReturnValue(mockAtm);
      typeormRepository.save.mockResolvedValue(mockAtm);

      const result = await repository.create(mockAtm);

      expect(typeormRepository.create).toHaveBeenCalledWith(mockAtm);
      expect(typeormRepository.save).toHaveBeenCalledWith(mockAtm);
      expect(result).toEqual(mockAtm);
    });
  });

  describe('update', () => {
    it('should update existing ATM', async () => {
      const updateData = { model: 'Updated Model' };
      const mockAtm = createMockAtm();
      Object.assign(mockAtm, updateData);

      typeormRepository.update.mockResolvedValue(mockUpdateResult);
      typeormRepository.findOne.mockResolvedValue(mockAtm);

      const result = await repository.update('atm1', updateData);

      expect(typeormRepository.update).toHaveBeenCalledWith('atm1', updateData);
      expect(result.model).toBe('Updated Model');
    });

    it('should throw error if ATM not found after update', async () => {
      typeormRepository.update.mockResolvedValue(mockUpdateResult);
      typeormRepository.findOne.mockResolvedValue(null);

      await expect(repository.update('nonexistent', {}))
        .rejects
        .toThrow('ATM not found after update');
    });
  });

  describe('delete', () => {
    it('should delete ATM', async () => {
      await repository.delete('atm1');

      expect(typeormRepository.delete).toHaveBeenCalledWith('atm1');
    });
  });

  describe('list', () => {
    it('should list ATMs with pagination', async () => {
      const mockAtm = createMockAtm();
      typeormRepository.findAndCount.mockResolvedValue([[mockAtm], 1]);

      const result = await repository.list(1, 10);

      expect(typeormRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        relations: ['client'],
        order: {
          created_at: 'DESC'
        }
      });
      expect(result).toEqual({ atms: [mockAtm], total: 1 });
    });
  });

  describe('findByLocation', () => {
    it('should find ATMs within radius', async () => {
      const mockAtm = createMockAtm();
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockAtm])
      };

      typeormRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const point: Point = {
        type: 'Point',
        coordinates: [-69.9388777, 18.4860575]
      };
      const result = await repository.findByLocation(point, 1000);

      expect(typeormRepository.createQueryBuilder).toHaveBeenCalledWith('atm');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        expect.stringContaining('ST_DWithin'),
        expect.objectContaining({
          latitude: point.coordinates[1],
          longitude: point.coordinates[0],
          radius: 1000
        })
      );
      expect(result).toEqual([mockAtm]);
    });
  });

  describe('findByClient', () => {
    it('should find ATMs by client', async () => {
      const mockAtm = createMockAtm();
      typeormRepository.find.mockResolvedValue([mockAtm]);

      const result = await repository.findByClient('client1');

      expect(typeormRepository.find).toHaveBeenCalledWith({
        where: { client_id: 'client1' },
        relations: ['client']
      });
      expect(result).toEqual([mockAtm]);
    });
  });

  describe('findByZone', () => {
    it('should find ATMs by zone', async () => {
      const mockAtm = createMockAtm();
      typeormRepository.find.mockResolvedValue([mockAtm]);

      const result = await repository.findByZone('zone1');

      expect(typeormRepository.find).toHaveBeenCalledWith({
        where: { zone_id: 'zone1' }
      });
      expect(result).toEqual([mockAtm]);
    });
  });

  describe('maintenance information', () => {
    describe('getLastMaintenanceDate', () => {
      it('should get last maintenance date', async () => {
        const mockDate = new Date();
        typeormRepository.query.mockResolvedValue([{ completed_at: mockDate }]);

        const result = await repository.getLastMaintenanceDate('atm1');

        expect(typeormRepository.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT completed_at'),
          ['atm1']
        );
        expect(result).toEqual(mockDate);
      });

      it('should return null when no maintenance records found', async () => {
        typeormRepository.query.mockResolvedValue([]);

        const result = await repository.getLastMaintenanceDate('atm1');

        expect(result).toBeNull();
      });
    });

    describe('getUptimeData', () => {
      it('should get uptime data', async () => {
        const mockUptimeData = {
          last_downtime: new Date(),
          uptime_percentage: 99.9
        };
        typeormRepository.query.mockResolvedValue([mockUptimeData]);

        const result = await repository.getUptimeData('atm1');

        expect(typeormRepository.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT'),
          ['atm1']
        );
        expect(result).toEqual({
          lastDowntime: mockUptimeData.last_downtime,
          totalUptime: mockUptimeData.uptime_percentage
        });
      });
    });

    describe('getActiveTickets', () => {
      it('should get active tickets count', async () => {
        typeormRepository.query.mockResolvedValue([{ active_tickets: '5' }]);

        const result = await repository.getActiveTickets('atm1');

        expect(typeormRepository.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT COUNT(*)'),
          ['atm1']
        );
        expect(result).toBe(5);
      });
    });
  });
});