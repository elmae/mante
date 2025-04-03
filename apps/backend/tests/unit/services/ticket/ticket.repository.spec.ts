import { DataSource, Repository } from 'typeorm';
import { TicketRepository } from '../../../../src/services/ticket/adapters/output/ticket.repository';
import { Ticket, TicketStatus, TicketType, TicketPriority } from '../../../../src/domain/entities/ticket.entity';
import { User } from '../../../../src/domain/entities/user.entity';
import { ATM } from '../../../../src/domain/entities/atm.entity';
import { Attachment } from '../../../../src/domain/entities/attachment.entity';
import { MaintenanceRecord } from '../../../../src/domain/entities/maintenance-record.entity';

describe('TicketRepository', () => {
  let repository: TicketRepository;
  let dataSource: jest.Mocked<DataSource>;
  let typeormRepository: jest.Mocked<Repository<Ticket>>;

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

  const createMockTicket = (overrides: Partial<Ticket> = {}): Ticket => {
    const ticket = new Ticket();
    Object.assign(ticket, {
      id: 'ticket1',
      atm_id: 'atm1',
      title: 'Test Ticket',
      description: 'Test Description',
      type: TicketType.CORRECTIVE,
      priority: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: mockUser,
      updated_by: mockUser,
      atm: mockAtm,
      attachments: [],
      // Métodos requeridos
      isOverdue: jest.fn().mockReturnValue(false),
      canBeAssigned: jest.fn().mockReturnValue(true),
      canBeStarted: jest.fn().mockReturnValue(true),
      canBeClosed: jest.fn().mockReturnValue(false),
      getTimeToResolution: jest.fn().mockReturnValue(null),
      updateStatus: jest.fn().mockImplementation((newStatus: TicketStatus) => {
        ticket.status = newStatus;
        return true;
      }),
      ...overrides
    });
    return ticket;
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
    } as unknown as jest.Mocked<Repository<Ticket>>;

    dataSource = {
      getRepository: jest.fn().mockReturnValue(typeormRepository)
    } as unknown as jest.Mocked<DataSource>;

    repository = new TicketRepository(dataSource);
  });

  describe('CRUD Operations', () => {
    describe('findById', () => {
      it('should find ticket by id with relations', async () => {
        const mockTicket = createMockTicket();
        typeormRepository.findOne.mockResolvedValue(mockTicket);

        const result = await repository.findById('ticket1');

        expect(typeormRepository.findOne).toHaveBeenCalledWith({
          where: { id: 'ticket1' },
          relations: [
            'atm',
            'assignedTo',
            'created_by',
            'updated_by',
            'attachments',
            'maintenanceRecord'
          ]
        });
        expect(result).toEqual(mockTicket);
      });
    });

    describe('create', () => {
      it('should create new ticket', async () => {
        const mockTicket = createMockTicket();
        typeormRepository.create.mockReturnValue(mockTicket);
        typeormRepository.save.mockResolvedValue(mockTicket);

        const result = await repository.create(mockTicket);

        expect(typeormRepository.create).toHaveBeenCalledWith(mockTicket);
        expect(typeormRepository.save).toHaveBeenCalledWith(mockTicket);
        expect(result).toEqual(mockTicket);
      });
    });

    describe('update', () => {
      it('should update existing ticket', async () => {
        const mockTicket = createMockTicket();
        const updateData = { title: 'Updated Title' };
        const updatedTicket = createMockTicket({ ...mockTicket, ...updateData });

        typeormRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
        typeormRepository.findOne.mockResolvedValue(updatedTicket);

        const result = await repository.update('ticket1', updateData);

        expect(typeormRepository.update).toHaveBeenCalledWith('ticket1', updateData);
        expect(result.title).toBe('Updated Title');
      });
    });

    describe('delete', () => {
      it('should delete ticket', async () => {
        await repository.delete('ticket1');
        expect(typeormRepository.delete).toHaveBeenCalledWith('ticket1');
      });
    });

    describe('list', () => {
      it('should list tickets with filters', async () => {
        const mockQueryBuilder = {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          take: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getManyAndCount: jest.fn().mockResolvedValue([[createMockTicket()], 1])
        };

        typeormRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

        const filters = {
          status: [TicketStatus.OPEN],
          type: [TicketType.CORRECTIVE],
          priority: [TicketPriority.HIGH],
          page: 1,
          limit: 10
        };

        const result = await repository.list(filters);

        expect(typeormRepository.createQueryBuilder).toHaveBeenCalledWith('ticket');
        expect(result.tickets).toHaveLength(1);
        expect(result.total).toBe(1);
      });
    });
  });

  describe('Specific Queries', () => {
    describe('findByAtm', () => {
      it('should find tickets by ATM', async () => {
        const mockTickets = [createMockTicket()];
        typeormRepository.find.mockResolvedValue(mockTickets);

        const result = await repository.findByAtm('atm1');

        expect(typeormRepository.find).toHaveBeenCalledWith({
          where: { atm_id: 'atm1' },
          relations: ['assignedTo', 'attachments']
        });
        expect(result).toEqual(mockTickets);
      });
    });

    describe('findByTechnician', () => {
      it('should find tickets by technician', async () => {
        const mockTickets = [createMockTicket({ assigned_to: 'tech1' })];
        typeormRepository.find.mockResolvedValue(mockTickets);

        const result = await repository.findByTechnician('tech1');

        expect(typeormRepository.find).toHaveBeenCalledWith({
          where: { assigned_to: 'tech1' },
          relations: ['atm', 'attachments']
        });
        expect(result).toEqual(mockTickets);
      });
    });

    describe('findOverdue', () => {
      it('should find overdue tickets', async () => {
        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([createMockTicket()])
        };

        typeormRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

        const result = await repository.findOverdue();

        expect(typeormRepository.createQueryBuilder).toHaveBeenCalledWith('ticket');
        expect(result).toHaveLength(1);
      });
    });
  });

  describe('Stats and Reports', () => {
    describe('getTicketStats', () => {
      it('should return ticket statistics', async () => {
        const mockStats = [{
          total: '10',
          status: TicketStatus.OPEN,
          type: TicketType.CORRECTIVE,
          priority: TicketPriority.HIGH,
          avg_resolution_time: '3600'
        }];

        typeormRepository.createQueryBuilder.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue(mockStats)
        } as any);

        const result = await repository.getTicketStats({});

        expect(typeormRepository.createQueryBuilder).toHaveBeenCalledWith('ticket');
        expect(result).toBeDefined();
      });
    });
  });

  describe('Attachment Management', () => {
    describe('addAttachment', () => {
      it('should add attachment to ticket', async () => {
        const mockTicket = createMockTicket();
        const mockAttachment = new Attachment();
        Object.assign(mockAttachment, {
          id: 'att1',
          file_name: 'test.jpg'
        });

        typeormRepository.findOne.mockResolvedValue(mockTicket);

        const result = await repository.addAttachment('ticket1', mockAttachment);

        expect(result).toBeDefined();
        expect(typeormRepository.findOne).toHaveBeenCalled();
      });
    });

    describe('getAttachments', () => {
      it('should get ticket attachments', async () => {
        const mockTicket = createMockTicket();
        mockTicket.attachments = [new Attachment()];
        
        typeormRepository.findOne.mockResolvedValue(mockTicket);

        const result = await repository.getAttachments('ticket1');

        expect(result).toHaveLength(1);
        expect(typeormRepository.findOne).toHaveBeenCalledWith({
          where: { id: 'ticket1' },
          relations: ['attachments']
        });
      });
    });
  });

  describe('Status Management', () => {
    describe('validateStatusTransition', () => {
      it('should validate status transition', async () => {
        const mockTicket = createMockTicket();
        typeormRepository.findOne.mockResolvedValue(mockTicket);

        const result = await repository.validateStatusTransition('ticket1', TicketStatus.ASSIGNED);

        expect(result).toBe(true);
        expect(typeormRepository.findOne).toHaveBeenCalled();
      });
    });

    describe('checkAssignmentEligibility', () => {
      it('should check if ticket can be assigned', async () => {
        const mockTicket = createMockTicket();
        typeormRepository.findOne.mockResolvedValue(mockTicket);

        const result = await repository.checkAssignmentEligibility('ticket1');

        expect(result).toBe(true);
        expect(typeormRepository.findOne).toHaveBeenCalled();
      });
    });
  });
});