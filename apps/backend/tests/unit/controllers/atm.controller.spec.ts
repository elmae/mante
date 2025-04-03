import { Request, Response, NextFunction } from 'express';
import { AtmController } from '../../../src/controllers/atm.controller';
import { AtmService } from '../../../src/services/atm/adapters/input/atm.service';
import { CreateAtmDto, TechnicalSpecsDto, LocationDto } from '../../../src/services/atm/dtos/create-atm.dto';
import { UpdateAtmDto, LocationQueryDto } from '../../../src/services/atm/dtos/update-atm.dto';
import { ATM } from '../../../src/domain/entities/atm.entity';

describe('AtmController', () => {
  let controller: AtmController;
  let atmService: jest.Mocked<AtmService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    atmService = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      findByLocation: jest.fn(),
      findByClient: jest.fn(),
      findByZone: jest.fn(),
      getStatus: jest.fn(),
      getLastMaintenance: jest.fn(),
      getUptime: jest.fn(),
      checkMaintenance: jest.fn()
    } as jest.Mocked<AtmService>;

    controller = new AtmController(atmService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    next = jest.fn();
  });

  describe('createAtm', () => {
    const mockCreateAtmDto: CreateAtmDto = {
      serial_number: 'ATM001',
      model: 'NCR SelfServ 25',
      brand: 'NCR',
      location: {
        type: 'Point',
        coordinates: [-69.929611, 18.483402]
      } as LocationDto,
      address: 'Calle Principal #123',
      technical_specs: {
        cpu: 'Intel i5',
        memory: '8GB',
        os: 'Windows 10',
        cash_capacity: 10000,
        supported_transactions: ['withdrawal', 'deposit']
      } as TechnicalSpecsDto,
      client_id: 'client1',
      zone_id: 'zone1',
      is_active: true
    };

    it('should create ATM successfully', async () => {
      const mockAtm = { id: '1', ...mockCreateAtmDto };
      req = { body: mockCreateAtmDto };
      atmService.create.mockResolvedValue(mockAtm as ATM);

      await controller.createAtm(req as Request, res as Response, next);

      expect(atmService.create).toHaveBeenCalledWith(expect.objectContaining({
        serial_number: mockCreateAtmDto.serial_number,
        technical_specs: expect.objectContaining(mockCreateAtmDto.technical_specs)
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockAtm);
    });

    it('should handle validation errors', async () => {
      const invalidDto = { ...mockCreateAtmDto, serial_number: '' };
      req = { body: invalidDto };

      await controller.createAtm(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(atmService.create).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      req = { body: mockCreateAtmDto };
      const error = new Error('Service error');
      atmService.create.mockRejectedValue(error);

      await controller.createAtm(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateAtm', () => {
    const mockUpdateAtmDto: UpdateAtmDto = {
      model: 'NCR SelfServ 26',
      address: 'Nueva Dirección #456'
    };

    it('should update ATM successfully', async () => {
      const mockAtm = { id: '1', ...mockUpdateAtmDto };
      req = {
        params: { id: '1' },
        body: mockUpdateAtmDto
      };
      atmService.findById.mockResolvedValue(mockAtm as ATM);
      atmService.update.mockResolvedValue(mockAtm as ATM);

      await controller.updateAtm(req as Request, res as Response, next);

      expect(atmService.update).toHaveBeenCalledWith('1', expect.objectContaining(mockUpdateAtmDto));
      expect(res.json).toHaveBeenCalledWith(mockAtm);
    });

    it('should handle ATM not found', async () => {
      req = {
        params: { id: '999' },
        body: mockUpdateAtmDto
      };
      atmService.findById.mockResolvedValue(null);

      await controller.updateAtm(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'ATM not found' });
      expect(atmService.update).not.toHaveBeenCalled();
    });
  });

  describe('getAtms', () => {
    it('should return paginated ATMs', async () => {
      const mockAtms = [
        { id: '1', serial_number: 'ATM001' },
        { id: '2', serial_number: 'ATM002' }
      ];
      req = {
        query: { page: '1', limit: '10' }
      };
      atmService.list.mockResolvedValue({ atms: mockAtms as ATM[], total: 2 });

      await controller.getAtms(req as Request, res as Response, next);

      expect(atmService.list).toHaveBeenCalledWith(1, 10);
      expect(res.json).toHaveBeenCalledWith({
        data: mockAtms,
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          pages: 1
        }
      });
    });

    it('should use default pagination values', async () => {
      req = { query: {} };
      atmService.list.mockResolvedValue({ atms: [], total: 0 });

      await controller.getAtms(req as Request, res as Response, next);

      expect(atmService.list).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findByLocation', () => {
    const mockLocationQuery: LocationQueryDto = {
      latitude: 18.483402,
      longitude: -69.929611,
      radius: 1000
    };

    it('should find ATMs by location', async () => {
      const mockAtms = [{ id: '1', serial_number: 'ATM001' }];
      req = { query: mockLocationQuery };
      atmService.findByLocation.mockResolvedValue(mockAtms as ATM[]);

      await controller.findByLocation(req as Request, res as Response, next);

      expect(atmService.findByLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'Point',
          coordinates: [mockLocationQuery.longitude, mockLocationQuery.latitude]
        }),
        mockLocationQuery.radius
      );
      expect(res.json).toHaveBeenCalledWith(mockAtms);
    });

    it('should handle validation errors', async () => {
      const invalidQuery = { ...mockLocationQuery, radius: -1 };
      req = { query: invalidQuery };

      await controller.findByLocation(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(atmService.findByLocation).not.toHaveBeenCalled();
    });
  });

  describe('getAtmStatus', () => {
    it('should return ATM status information', async () => {
      req = { params: { id: '1' } };
      const mockStatus = {
        status: 'operational',
        last_maintenance: new Date(),
        uptime: 99.9,
        needs_maintenance: false
      };

      atmService.getStatus.mockResolvedValue(mockStatus.status as any);
      atmService.getLastMaintenance.mockResolvedValue(mockStatus.last_maintenance);
      atmService.getUptime.mockResolvedValue(mockStatus.uptime);
      atmService.checkMaintenance.mockResolvedValue(mockStatus.needs_maintenance);

      await controller.getAtmStatus(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith(mockStatus);
    });

    it('should handle errors', async () => {
      req = { params: { id: '1' } };
      const error = new Error('Service error');
      atmService.getStatus.mockRejectedValue(error);

      await controller.getAtmStatus(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('findByClient', () => {
    it('should find ATMs by client', async () => {
      const mockAtms = [{ id: '1', serial_number: 'ATM001' }];
      req = { params: { clientId: 'client1' } };
      atmService.findByClient.mockResolvedValue(mockAtms as ATM[]);

      await controller.findByClient(req as Request, res as Response, next);

      expect(atmService.findByClient).toHaveBeenCalledWith('client1');
      expect(res.json).toHaveBeenCalledWith(mockAtms);
    });
  });

  describe('findByZone', () => {
    it('should find ATMs by zone', async () => {
      const mockAtms = [{ id: '1', serial_number: 'ATM001' }];
      req = { params: { zoneId: 'zone1' } };
      atmService.findByZone.mockResolvedValue(mockAtms as ATM[]);

      await controller.findByZone(req as Request, res as Response, next);

      expect(atmService.findByZone).toHaveBeenCalledWith('zone1');
      expect(res.json).toHaveBeenCalledWith(mockAtms);
    });
  });
});