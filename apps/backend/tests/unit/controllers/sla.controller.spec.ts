import { Request, Response, NextFunction } from 'express';
import { SLAController } from '../../../src/controllers/sla.controller';
import { SLAService } from '../../../src/services/sla/adapters/input/sla.service';
import {
  CreateSLAConfigDto,
  UpdateSLAConfigDto,
  SLAFilterDto,
  ComplianceQueryDto,
  SLAValidationRequestDto
} from '../../../src/services/sla/dtos/sla.dto';
import { SLAConfig, MaintenanceType } from '../../../src/domain/entities/sla-config.entity';
import { User } from '../../../src/domain/entities/user.entity';
import { Role, RoleType } from '../../../src/domain/entities/role.entity';

describe('SLAController', () => {
  let controller: SLAController;
  let slaService: jest.Mocked<SLAService>;
  let req: Request;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  const mockRole: Role = {
    id: 'role1',
    name: RoleType.ADMIN,
    description: 'Admin Role',
    permissions: [],
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockUser: User = {
    id: 'user1',
    username: 'admin1',
    email: 'admin@example.com',
    password: 'hashed_password',
    full_name: 'Admin User',
    is_active: true,
    role_id: 'role1',
    role: mockRole,
    created_at: new Date(),
    updated_at: new Date()
  };

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

  function createMockSLAConfig(data: Partial<SLAConfig> = {}): SLAConfig {
    return {
      id: '1',
      zone_id: 'zone1',
      maintenance_type: MaintenanceType.FIRST_LINE,
      response_time: '2 hours',
      resolution_time: '8 hours',
      created_at: new Date(),
      updated_at: new Date(),
      created_by: mockUser,
      updated_by: mockUser,
      ...data
    } as SLAConfig;
  }

  beforeEach(() => {
    slaService = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      findByZone: jest.fn(),
      findByClient: jest.fn(),
      getActiveSLAs: jest.fn(),
      calculateCompliance: jest.fn(),
      validateSLA: jest.fn()
    } as unknown as jest.Mocked<SLAService>;

    controller = new SLAController(slaService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    next = jest.fn();
    req = createMockRequest();
  });

  describe('createSLA', () => {
    const mockCreateSLADto: CreateSLAConfigDto = {
      zone_id: 'zone1',
      maintenance_type: MaintenanceType.FIRST_LINE,
      response_time: '2 hours',
      resolution_time: '8 hours'
    };

    it('should create SLA configuration successfully', async () => {
      const mockSLAConfig = createMockSLAConfig(mockCreateSLADto);

      req = createMockRequest({
        body: mockCreateSLADto
      });

      slaService.create.mockResolvedValue(mockSLAConfig);

      await controller.createSLA(req as any, res as Response, next);

      expect(slaService.create).toHaveBeenCalledWith({
        ...mockCreateSLADto,
        created_by: { id: req.user?.id } as User
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSLAConfig);
    });

    it('should handle validation errors for invalid interval format', async () => {
      const invalidDto = {
        ...mockCreateSLADto,
        response_time: 'invalid format'
      };

      req = createMockRequest({
        body: invalidDto
      });

      await controller.createSLA(req as any, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(slaService.create).not.toHaveBeenCalled();
    });
  });

  describe('updateSLA', () => {
    const mockUpdateSLADto: UpdateSLAConfigDto = {
      response_time: '3 hours',
      resolution_time: '12 hours'
    };

    it('should update SLA configuration successfully', async () => {
      const mockSLAConfig = createMockSLAConfig({
        ...mockUpdateSLADto,
        id: '1'
      });

      req = createMockRequest({
        params: { id: '1' },
        body: mockUpdateSLADto
      });

      slaService.update.mockResolvedValue(mockSLAConfig);

      await controller.updateSLA(req as any, res as Response, next);

      expect(slaService.update).toHaveBeenCalledWith('1', {
        ...mockUpdateSLADto,
        updated_by: { id: req.user?.id } as User
      });
      expect(res.json).toHaveBeenCalledWith(mockSLAConfig);
    });
  });

  describe('queries', () => {
    it('should list SLA configurations with filters', async () => {
      const filters: SLAFilterDto = {
        page: 1,
        limit: 10,
        maintenanceType: MaintenanceType.FIRST_LINE
      };

      const mockConfigs = [createMockSLAConfig()];

      req = createMockRequest({
        query: filters as any
      });

      slaService.list.mockResolvedValue({
        configs: mockConfigs,
        total: 1
      });

      await controller.getSLAs(req, res as Response, next);

      expect(slaService.list).toHaveBeenCalledWith(filters);
      expect(res.json).toHaveBeenCalledWith({
        data: mockConfigs,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1
        }
      });
    });

    it('should get SLA by ID', async () => {
      const mockConfig = createMockSLAConfig();

      req = createMockRequest({
        params: { id: '1' }
      });

      slaService.findById.mockResolvedValue(mockConfig);

      await controller.getSLAById(req, res as Response, next);

      expect(slaService.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockConfig);
    });

    it('should handle SLA not found', async () => {
      req = createMockRequest({
        params: { id: '999' }
      });

      slaService.findById.mockResolvedValue(null);

      await controller.getSLAById(req, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'SLA configuration not found' });
    });

    it('should get SLAs by zone', async () => {
      const mockConfigs = [createMockSLAConfig()];

      req = createMockRequest({
        params: { zoneId: 'zone1' }
      });

      slaService.findByZone.mockResolvedValue(mockConfigs);

      await controller.getSLAsByZone(req, res as Response, next);

      expect(slaService.findByZone).toHaveBeenCalledWith('zone1');
      expect(res.json).toHaveBeenCalledWith(mockConfigs);
    });

    it('should get active SLAs', async () => {
      const mockConfigs = [createMockSLAConfig()];

      slaService.getActiveSLAs.mockResolvedValue(mockConfigs);

      await controller.getActiveSLAs(req, res as Response, next);

      expect(slaService.getActiveSLAs).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockConfigs);
    });
  });

  describe('compliance operations', () => {
    it('should calculate compliance', async () => {
      const complianceQuery: ComplianceQueryDto = {
        slaId: '1',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31')
      };

      const mockCompliance = {
        sla_id: '1',
        period: {
          start: complianceQuery.startDate,
          end: complianceQuery.endDate
        },
        metrics: {
          total_tickets: 10,
          response_time_compliance: 90,
          resolution_time_compliance: 85,
          average_response_time: 45,
          average_resolution_time: 240
        }
      };

      req = createMockRequest({
        body: complianceQuery
      });

      slaService.calculateCompliance.mockResolvedValue(mockCompliance as any);

      await controller.calculateCompliance(req, res as Response, next);

      expect(slaService.calculateCompliance).toHaveBeenCalledWith(
        complianceQuery.slaId,
        complianceQuery.startDate,
        complianceQuery.endDate
      );
      expect(res.json).toHaveBeenCalledWith(mockCompliance);
    });

    it('should validate SLA for ticket', async () => {
      const validationRequest: SLAValidationRequestDto = {
        slaId: '1',
        ticketId: 'ticket1'
      };

      const mockValidation = {
        isValid: true,
        violations: [],
        recommendations: []
      };

      req = createMockRequest({
        body: validationRequest
      });

      slaService.validateSLA.mockResolvedValue(mockValidation);

      await controller.validateSLA(req, res as Response, next);

      expect(slaService.validateSLA).toHaveBeenCalledWith(
        validationRequest.slaId,
        validationRequest.ticketId
      );
      expect(res.json).toHaveBeenCalledWith(mockValidation);
    });
  });
});