import { Request, Response, NextFunction } from 'express';
import { MaintenanceController } from '../../../src/controllers/maintenance.controller';
import { MaintenanceService } from '../../../src/services/maintenance/adapters/input/maintenance.service';
import { 
  StartMaintenanceDto, 
  CompleteMaintenanceDto, 
  AddPartsDto, 
  MaintenanceFilterDto,
  MaintenancePartDto
} from '../../../src/services/maintenance/dtos/maintenance.dto';
import { MaintenanceRecord, MaintenanceType } from '../../../src/domain/entities/maintenance-record.entity';
import { User } from '../../../src/domain/entities/user.entity';
import { Role, RoleType } from '../../../src/domain/entities/role.entity';
import { ATM } from '../../../src/domain/entities/atm.entity';

describe('MaintenanceController', () => {
  let controller: MaintenanceController;
  let maintenanceService: jest.Mocked<MaintenanceService>;
  let req: Request;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  const mockRole: Role = {
    id: 'role1',
    name: RoleType.TECHNICIAN,
    description: 'Technician Role',
    permissions: [],
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockUser: User = {
    id: 'user1',
    username: 'tech1',
    email: 'tech@example.com',
    password: 'hashed_password',
    full_name: 'Tech User',
    is_active: true,
    role_id: 'role1',
    role: mockRole,
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockAtm: ATM = {
    id: 'atm1',
    serial_number: 'ATM001',
    model: 'Test Model',
    brand: 'Test Brand',
    location: { type: 'Point', coordinates: [0, 0] },
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
    updated_at: new Date()
  } as ATM;

  function createMockRequest(data: Partial<Request> = {}): Request {
    const req = {
      ...data,
      get: jest.fn(),
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
      acceptsEncodings: jest.fn(),
      acceptsLanguages: jest.fn(),
      param: jest.fn(),
      is: jest.fn(),
      protocol: 'http',
      secure: false,
      ip: '::1',
      ips: [],
      subdomains: [],
      path: '/',
      hostname: 'localhost',
      host: 'localhost',
      fresh: false,
      stale: true,
      xhr: false,
      body: {},
      cookies: {},
      method: 'GET',
      params: {},
      query: {},
      route: {},
      signedCookies: {},
      originalUrl: '/',
      url: '/',
      baseUrl: '',
      app: {},
      res: {},
      next: jest.fn()
    } as unknown as Request;

    Object.defineProperty(req, 'user', {
      value: {
        id: mockUser.id,
        role: mockUser.role.name,
        permissions: []
      },
      writable: true
    });

    return req;
  }

  beforeEach(() => {
    maintenanceService = {
      create: jest.fn(),
      startMaintenance: jest.fn(),
      completeMaintenance: jest.fn(),
      addParts: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      findByATM: jest.fn(),
      findByTechnician: jest.fn(),
      getMaintenanceStats: jest.fn(),
      findInProgress: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<MaintenanceService>;

    controller = new MaintenanceController(maintenanceService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    next = jest.fn();
    req = createMockRequest();
  });

  describe('createMaintenance', () => {
    const mockStartMaintenanceDto: StartMaintenanceDto = {
      ticket_id: 'ticket1',
      atm_id: 'atm1',
      technician_id: 'tech1',
      type: MaintenanceType.FIRST_LINE,
      start_time: new Date()
    };

    it('should create maintenance record successfully', async () => {
      const mockMaintenanceRecord: Partial<MaintenanceRecord> = {
        id: '1',
        ...mockStartMaintenanceDto,
        created_by: mockUser,
        updated_by: mockUser,
        created_at: new Date(),
        updated_at: new Date()
      };

      req = createMockRequest({
        body: mockStartMaintenanceDto
      });

      maintenanceService.create.mockResolvedValue(mockMaintenanceRecord as MaintenanceRecord);

      await controller.createMaintenance(req as any, res as Response, next);

      expect(maintenanceService.create).toHaveBeenCalledWith({
        ...mockStartMaintenanceDto,
        created_by: { id: req.user?.id } as User
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockMaintenanceRecord);
    });

    it('should handle validation errors', async () => {
      const invalidDto = { ...mockStartMaintenanceDto, ticket_id: undefined };
      req = createMockRequest({
        body: invalidDto
      });

      await controller.createMaintenance(req as any, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(maintenanceService.create).not.toHaveBeenCalled();
    });
  });

  describe('startMaintenance', () => {
    it('should start maintenance successfully', async () => {
      const mockMaintenanceRecord: Partial<MaintenanceRecord> = {
        id: '1',
        ticket_id: 'ticket1',
        technician_id: mockUser.id,
        start_time: new Date()
      };

      req = createMockRequest({
        params: { ticketId: 'ticket1' }
      });

      maintenanceService.startMaintenance.mockResolvedValue(mockMaintenanceRecord as MaintenanceRecord);

      await controller.startMaintenance(req as any, res as Response, next);

      expect(maintenanceService.startMaintenance).toHaveBeenCalledWith('ticket1', mockUser.id);
      expect(res.json).toHaveBeenCalledWith(mockMaintenanceRecord);
    });
  });

  describe('completeMaintenance', () => {
    const mockCompletionDto: CompleteMaintenanceDto = {
      diagnosis: 'Test diagnosis',
      work_performed: 'Work completed',
      parts_used: [
        { name: 'Part 1', quantity: 1 }
      ] as MaintenancePartDto[],
      end_time: new Date()
    };

    it('should complete maintenance successfully', async () => {
      const mockMaintenanceRecord: Partial<MaintenanceRecord> = {
        id: '1',
        diagnosis: mockCompletionDto.diagnosis,
        work_performed: mockCompletionDto.work_performed,
        end_time: mockCompletionDto.end_time
      };

      req = createMockRequest({
        params: { id: '1' },
        body: mockCompletionDto
      });

      maintenanceService.completeMaintenance.mockResolvedValue(mockMaintenanceRecord as MaintenanceRecord);

      await controller.completeMaintenance(req as any, res as Response, next);

      expect(maintenanceService.completeMaintenance).toHaveBeenCalledWith('1', mockCompletionDto);
      expect(res.json).toHaveBeenCalledWith(mockMaintenanceRecord);
    });
  });

  describe('addParts', () => {
    const mockPartsDto: AddPartsDto = {
      parts: [
        { name: 'Part 1', quantity: 1 },
        { name: 'Part 2', quantity: 2, serialNumber: 'SN123' }
      ]
    };

    it('should add parts successfully', async () => {
      const mockMaintenanceRecord: Partial<MaintenanceRecord> = {
        id: '1',
        parts_used: mockPartsDto.parts
      };

      req = createMockRequest({
        params: { id: '1' },
        body: mockPartsDto
      });

      maintenanceService.addParts.mockResolvedValue(mockMaintenanceRecord as MaintenanceRecord);

      await controller.addParts(req as any, res as Response, next);

      expect(maintenanceService.addParts).toHaveBeenCalledWith('1', mockPartsDto.parts);
      expect(res.json).toHaveBeenCalledWith(mockMaintenanceRecord);
    });
  });

  describe('queries', () => {
    it('should list maintenances with filters', async () => {
      const filters: MaintenanceFilterDto = {
        page: 1,
        limit: 10,
        type: [MaintenanceType.FIRST_LINE]
      };

      const mockResult = {
        records: [createMockMaintenanceRecord()],
        total: 1
      };

      req = createMockRequest({
        query: filters as any
      });

      maintenanceService.list.mockResolvedValue(mockResult);

      await controller.listMaintenances(req, res as Response, next);

      expect(maintenanceService.list).toHaveBeenCalledWith(filters);
      expect(res.json).toHaveBeenCalledWith({
        data: mockResult.records,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1
        }
      });
    });

    it('should get maintenance by ID', async () => {
      const mockRecord = createMockMaintenanceRecord();

      req = createMockRequest({
        params: { id: '1' }
      });

      maintenanceService.findById.mockResolvedValue(mockRecord);

      await controller.getMaintenance(req, res as Response, next);

      expect(maintenanceService.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockRecord);
    });

    it('should handle maintenance not found', async () => {
      req = createMockRequest({
        params: { id: '999' }
      });

      maintenanceService.findById.mockResolvedValue(null);

      await controller.getMaintenance(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Maintenance record not found' });
    });
  });
});

function createMockMaintenanceRecord(data: Partial<MaintenanceRecord> = {}): MaintenanceRecord {
  return {
    id: '1',
    ticket_id: 'ticket1',
    atm_id: 'atm1',
    technician_id: 'tech1',
    type: MaintenanceType.FIRST_LINE,
    diagnosis: 'Test diagnosis',
    work_performed: 'Test work',
    parts_used: [],
    start_time: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    created_by: {} as User,
    updated_by: {} as User,
    ...data
  } as MaintenanceRecord;
}