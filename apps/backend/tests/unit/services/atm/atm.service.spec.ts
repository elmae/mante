import { ATM } from '../../../../src/domain/entities/atm.entity';
import { AtmService } from '../../../../src/services/atm/adapters/input/atm.service';
import { IAtmRepositoryPort } from '../../../../src/services/atm/ports/output/atm-repository.port';
import { Point } from 'geojson';
import { User } from '../../../../src/domain/entities/user.entity';

describe('AtmService', () => {
  let service: AtmService;
  let repository: jest.Mocked<IAtmRepositoryPort>;

  const mockUser: Partial<User> = {
    id: 'user1',
    email: 'test@example.com'
  };

  function createMockAtm(data: Partial<ATM> = {}): ATM {
    const atm = new ATM();
    Object.assign(atm, {
      id: '1',
      serial_number: 'ATM001',
      model: 'NCR SelfServ 25',
      brand: 'NCR',
      location: {
        type: 'Point',
        coordinates: [-69.929611, 18.483402]
      },
      address: 'Calle Principal #123',
      technical_specs: {
        cpu: 'Intel i5',
        memory: '8GB',
        os: 'Windows 10',
        cash_capacity: 10000,
        supported_transactions: ['withdrawal', 'deposit']
      },
      zone_id: 'zone1',
      client_id: 'client1',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: mockUser as User,
      updated_by: mockUser as User,
      client: mockUser as User,
      tickets: [],
      ...data
    });
    return atm;
  }

  const mockAtm = createMockAtm();

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findBySerialNumber: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      findByLocation: jest.fn(),
      findByClient: jest.fn(),
      findByZone: jest.fn(),
      getActiveTickets: jest.fn(),
      getUptimeData: jest.fn(),
      getLastMaintenanceDate: jest.fn()
    };

    service = new AtmService(repository);
  });

  describe('create', () => {
    const createAtmData: Partial<ATM> = {
      serial_number: 'ATM001',
      model: 'NCR SelfServ 25',
      brand: 'NCR',
      location: {
        type: 'Point',
        coordinates: [-69.929611, 18.483402]
      },
      address: 'Calle Principal #123',
      technical_specs: {
        cpu: 'Intel i5',
        memory: '8GB',
        os: 'Windows 10',
        cash_capacity: 10000,
        supported_transactions: ['withdrawal', 'deposit']
      },
      zone_id: 'zone1',
      client_id: 'client1',
      is_active: true
    };

    it('should create an ATM successfully', async () => {
      repository.findBySerialNumber.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockAtm);

      const result = await service.create(createAtmData);

      expect(repository.findBySerialNumber).toHaveBeenCalledWith('ATM001');
      expect(repository.create).toHaveBeenCalledWith(createAtmData);
      expect(result).toEqual(mockAtm);
    });

    it('should throw error if serial number already exists', async () => {
      repository.findBySerialNumber.mockResolvedValue(mockAtm);

      await expect(service.create(createAtmData)).rejects.toThrow('ATM with this serial number already exists');
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateAtmData: Partial<ATM> = {
      model: 'NCR SelfServ 26',
      address: 'Nueva Dirección #456'
    };

    it('should update an ATM successfully', async () => {
      const updatedAtm = createMockAtm(updateAtmData);
      repository.findById.mockResolvedValue(mockAtm);
      repository.update.mockResolvedValue(updatedAtm);

      const result = await service.update('1', updateAtmData);

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.update).toHaveBeenCalledWith('1', updateAtmData);
      expect(result).toEqual(updatedAtm);
    });

    it('should throw error if ATM does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('999', updateAtmData)).rejects.toThrow('ATM not found');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should validate serial number uniqueness when updating', async () => {
      const updateWithSerial = { serial_number: 'ATM002' };
      repository.findById.mockResolvedValue(mockAtm);
      repository.findBySerialNumber.mockResolvedValue(createMockAtm({ id: '2' }));

      await expect(service.update('1', updateWithSerial)).rejects.toThrow('Serial number already in use');
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an ATM successfully', async () => {
      repository.findById.mockResolvedValue(mockAtm);
      repository.delete.mockResolvedValue();

      await service.delete('1');

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error if ATM does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow('ATM not found');
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should list ATMs with pagination', async () => {
      const mockResult = {
        atms: [mockAtm],
        total: 1
      };
      repository.list.mockResolvedValue(mockResult);

      const result = await service.list(1, 10);

      expect(repository.list).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getStatus', () => {
    it('should return maintenance status when there are active tickets', async () => {
      repository.getActiveTickets.mockResolvedValue(1);
      repository.getUptimeData.mockResolvedValue({ totalUptime: 100, lastDowntime: null });

      const status = await service.getStatus('1');

      expect(status).toBe('maintenance');
    });

    it('should return out_of_service status when recent downtime', async () => {
      repository.getActiveTickets.mockResolvedValue(0);
      repository.getUptimeData.mockResolvedValue({
        totalUptime: 100,
        lastDowntime: new Date()
      });

      const status = await service.getStatus('1');

      expect(status).toBe('out_of_service');
    });

    it('should return operational status when no issues', async () => {
      repository.getActiveTickets.mockResolvedValue(0);
      repository.getUptimeData.mockResolvedValue({
        totalUptime: 100,
        lastDowntime: new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours ago
      });

      const status = await service.getStatus('1');

      expect(status).toBe('operational');
    });
  });

  describe('checkMaintenance', () => {
    it('should return true if no maintenance history', async () => {
      repository.getLastMaintenanceDate.mockResolvedValue(null);
      repository.getActiveTickets.mockResolvedValue(0);

      const needsMaintenance = await service.checkMaintenance('1');

      expect(needsMaintenance).toBe(true);
    });

    it('should return true if last maintenance was over 30 days ago', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      repository.getLastMaintenanceDate.mockResolvedValue(oldDate);
      repository.getActiveTickets.mockResolvedValue(0);

      const needsMaintenance = await service.checkMaintenance('1');

      expect(needsMaintenance).toBe(true);
    });

    it('should return true if there are active tickets', async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15);
      repository.getLastMaintenanceDate.mockResolvedValue(recentDate);
      repository.getActiveTickets.mockResolvedValue(1);

      const needsMaintenance = await service.checkMaintenance('1');

      expect(needsMaintenance).toBe(true);
    });

    it('should return false if recent maintenance and no issues', async () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 15);
      repository.getLastMaintenanceDate.mockResolvedValue(recentDate);
      repository.getActiveTickets.mockResolvedValue(0);

      const needsMaintenance = await service.checkMaintenance('1');

      expect(needsMaintenance).toBe(false);
    });
  });
});