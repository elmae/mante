import { Request, Response, NextFunction } from 'express';
import { TicketController } from '../../../src/controllers/ticket.controller';
import { TicketService } from '../../../src/services/ticket/adapters/input/ticket.service';
import { CreateTicketDto, AttachmentDto } from '../../../src/services/ticket/dtos/create-ticket.dto';
import { UpdateTicketDto, AssignTicketDto, UpdateTicketStatusDto, TicketFilterDto } from '../../../src/services/ticket/dtos/update-ticket.dto';
import { Ticket, TicketStatus, TicketType, TicketPriority } from '../../../src/domain/entities/ticket.entity';
import { User } from '../../../src/domain/entities/user.entity';
import { ATM } from '../../../src/domain/entities/atm.entity';
import { Role, RoleType } from '../../../src/domain/entities/role.entity';

// Extender Request para las pruebas
interface MockRequestUser {
  id: string;
  role: string;
  permissions: string[];
}

describe('TicketController', () => {
  let controller: TicketController;
  let ticketService: jest.Mocked<TicketService>;
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
    const mockRequestUser: MockRequestUser = {
      id: mockUser.id,
      role: mockRole.name.toString(),
      permissions: []
    };

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

    // Añadir el usuario autenticado
    Object.defineProperty(req, 'user', {
      value: mockRequestUser,
      writable: true
    });

    return req;
  }

  beforeEach(() => {
    ticketService = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      assignTechnician: jest.fn(),
      updateStatus: jest.fn(),
      addAttachment: jest.fn(),
      findByAtm: jest.fn(),
      findByTechnician: jest.fn(),
      getOverdueTickets: jest.fn(),
      getTicketsRequiringAttention: jest.fn()
    } as unknown as jest.Mocked<TicketService>;

    controller = new TicketController(ticketService);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };

    next = jest.fn();
    req = createMockRequest();
  });

  describe('createTicket', () => {
    const mockCreateTicketDto: CreateTicketDto = {
      atm_id: 'atm1',
      title: 'Test Ticket',
      description: 'Test Description',
      type: TicketType.CORRECTIVE,
      priority: TicketPriority.HIGH,
      attachments: [{
        filename: 'test.jpg',
        mimetype: 'image/jpeg',
        path: '/uploads/test.jpg',
        size: 1024
      }] as AttachmentDto[]
    };

    it('should create ticket successfully', async () => {
      const mockTicket: Partial<Ticket> = {
        id: '1',
        atm_id: mockCreateTicketDto.atm_id,
        title: mockCreateTicketDto.title,
        description: mockCreateTicketDto.description,
        type: mockCreateTicketDto.type,
        priority: mockCreateTicketDto.priority,
        status: TicketStatus.OPEN,
        created_at: new Date(),
        updated_at: new Date(),
        completion_date: undefined,
        created_by: mockUser,
        updated_by: mockUser,
        atm: mockAtm,
        assignedTo: undefined,
        maintenanceRecord: undefined,
        attachments: []
      };

      req = createMockRequest({
        body: mockCreateTicketDto
      });

      ticketService.create.mockResolvedValue(mockTicket as Ticket);
      ticketService.findById.mockResolvedValue(mockTicket as Ticket);

      await controller.createTicket(req as any, res as Response, next);

      expect(ticketService.create).toHaveBeenCalledWith({
        ...mockCreateTicketDto,
        created_by: { id: req.user?.id } as User
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTicket);
    });

    it('should handle validation errors', async () => {
      const invalidDto = { ...mockCreateTicketDto, atm_id: undefined };
      req = createMockRequest({
        body: invalidDto
      });

      await controller.createTicket(req as any, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(ticketService.create).not.toHaveBeenCalled();
    });
  });

  describe('updateTicket', () => {
    const mockUpdateTicketDto: UpdateTicketDto = {
      title: 'Updated Title',
      description: 'Updated Description',
      priority: TicketPriority.HIGH
    };

    it('should update ticket successfully', async () => {
      const mockTicket: Partial<Ticket> = {
        id: '1',
        title: mockUpdateTicketDto.title,
        description: mockUpdateTicketDto.description,
        priority: mockUpdateTicketDto.priority,
        status: TicketStatus.OPEN,
        atm_id: 'atm1',
        type: TicketType.CORRECTIVE,
        created_at: new Date(),
        updated_at: new Date(),
        completion_date: undefined,
        created_by: mockUser,
        updated_by: mockUser,
        atm: mockAtm,
        assignedTo: undefined,
        maintenanceRecord: undefined,
        attachments: []
      };

      req = createMockRequest({
        params: { id: '1' },
        body: mockUpdateTicketDto
      });

      ticketService.update.mockResolvedValue(mockTicket as Ticket);

      await controller.updateTicket(req as any, res as Response, next);

      expect(ticketService.update).toHaveBeenCalledWith('1', {
        ...mockUpdateTicketDto,
        updated_by: { id: req.user?.id } as User
      });
      expect(res.json).toHaveBeenCalledWith(mockTicket);
    });
  });

  describe('addAttachment', () => {
    const mockFile: Express.Multer.File = {
      originalname: 'test.jpg',
      path: '/uploads/test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      filename: 'test.jpg',
      destination: '/uploads',
      buffer: Buffer.from([]),
      stream: null as any,
      encoding: '7bit',
      fieldname: 'file'
    };

    it('should add attachment successfully', async () => {
      const mockTicket = {
        id: '1',
        attachments: [{
          id: 'att1',
          file_name: 'test.jpg',
          created_by: mockUser
        }]
      };

      req = createMockRequest({
        params: { id: '1' },
        file: mockFile
      });

      ticketService.addAttachment.mockResolvedValue(mockTicket as any);

      await controller.addAttachment(req as any, res as Response, next);

      expect(ticketService.addAttachment).toHaveBeenCalledWith('1', expect.objectContaining({
        file_name: 'test.jpg',
        file_path: '/uploads/test.jpg',
        mime_type: 'image/jpeg',
        file_size: 1024,
        created_by_id: req.user?.id
      }));
      expect(res.json).toHaveBeenCalledWith(mockTicket);
    });

    it('should handle missing file', async () => {
      req = createMockRequest({
        params: { id: '1' }
      });

      await controller.addAttachment(req as any, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'No file uploaded' });
      expect(ticketService.addAttachment).not.toHaveBeenCalled();
    });
  });
});