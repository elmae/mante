import { Ticket, TicketStatus, TicketType, TicketPriority } from '../../../../src/domain/entities/ticket.entity';
import { TicketService } from '../../../../src/services/ticket/adapters/input/ticket.service';
import { ITicketRepositoryPort } from '../../../../src/services/ticket/ports/output/ticket-repository.port';
import { TicketFilters } from '../../../../src/services/ticket/ports/input/ticket.port';
import { User } from '../../../../src/domain/entities/user.entity';
import { ATM } from '../../../../src/domain/entities/atm.entity';

describe('TicketService', () => {
  let service: TicketService;
  let repository: jest.Mocked<ITicketRepositoryPort>;

  const mockUser: Partial<User> = {
    id: 'user1',
    email: 'technician@example.com'
  };

  const mockAtm: Partial<ATM> = {
    id: 'atm1',
    serial_number: 'ATM001'
  };

  function createMockTicket(data: Partial<Ticket> = {}): Ticket {
    const ticket = new Ticket();
    Object.assign(ticket, {
      id: '1',
      atm_id: 'atm1',
      title: 'Test Ticket',
      description: 'Test Description',
      type: TicketType.CORRECTIVE,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: mockUser as User,
      updated_by: mockUser as User,
      atm: mockAtm as ATM,
      attachments: [],
      ...data
    });
    return ticket;
  }

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      findByAtm: jest.fn(),
      findByTechnician: jest.fn(),
      findByStatus: jest.fn(),
      findByType: jest.fn(),
      findByPriority: jest.fn(),
      findOverdue: jest.fn(),
      findRequiringAttention: jest.fn(),
      getTicketStats: jest.fn(),
      addAttachment: jest.fn(),
      getAttachments: jest.fn(),
      getMaintenanceRecord: jest.fn(),
      search: jest.fn(),
      findByDateRange: jest.fn(),
      findByMultipleStatuses: jest.fn(),
      validateStatusTransition: jest.fn(),
      checkAssignmentEligibility: jest.fn()
    };

    service = new TicketService(repository);
  });

  describe('create', () => {
    const createTicketData: Partial<Ticket> = {
      atm_id: 'atm1',
      title: 'New Issue',
      description: 'ATM not dispensing cash',
      type: TicketType.CORRECTIVE,
      priority: TicketPriority.HIGH
    };

    it('should create a ticket successfully', async () => {
      const mockCreatedTicket = createMockTicket(createTicketData);
      repository.create.mockResolvedValue(mockCreatedTicket);

      const result = await service.create(createTicketData);

      expect(repository.create).toHaveBeenCalledWith({
        ...createTicketData,
        status: TicketStatus.OPEN
      });
      expect(result).toEqual(mockCreatedTicket);
    });

    it('should throw error if ATM ID is missing', async () => {
      const invalidData = { ...createTicketData, atm_id: undefined };

      await expect(service.create(invalidData)).rejects.toThrow('ATM ID is required');
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw error if title or description is missing', async () => {
      const invalidData = { ...createTicketData, title: undefined };

      await expect(service.create(invalidData)).rejects.toThrow('Title and description are required');
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateTicketData: Partial<Ticket> = {
      description: 'Updated description',
      priority: TicketPriority.HIGH
    };

    it('should update a ticket successfully', async () => {
      const existingTicket = createMockTicket();
      const updatedTicket = createMockTicket({ ...updateTicketData });

      repository.findById.mockResolvedValue(existingTicket);
      repository.update.mockResolvedValue(updatedTicket);

      const result = await service.update('1', updateTicketData);

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.update).toHaveBeenCalledWith('1', updateTicketData);
      expect(result).toEqual(updatedTicket);
    });

    it('should throw error if ticket does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('999', updateTicketData)).rejects.toThrow('Ticket not found');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should validate status transition when updating status', async () => {
      const existingTicket = createMockTicket();
      const statusUpdate = { status: TicketStatus.ASSIGNED };

      repository.findById.mockResolvedValue(existingTicket);
      repository.validateStatusTransition.mockResolvedValue(false);

      await expect(service.update('1', statusUpdate)).rejects.toThrow('Invalid status transition');
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an open ticket successfully', async () => {
      const openTicket = createMockTicket({ status: TicketStatus.OPEN });
      repository.findById.mockResolvedValue(openTicket);

      await service.delete('1');

      expect(repository.findById).toHaveBeenCalledWith('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error if ticket does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow('Ticket not found');
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw error if ticket is not in OPEN status', async () => {
      const assignedTicket = createMockTicket({ status: TicketStatus.ASSIGNED });
      repository.findById.mockResolvedValue(assignedTicket);

      await expect(service.delete('1')).rejects.toThrow('Can only delete tickets in OPEN status');
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('assignTechnician', () => {
    it('should assign technician successfully', async () => {
      const ticket = createMockTicket();
      const updatedTicket = createMockTicket({
        assigned_to: 'tech1',
        status: TicketStatus.ASSIGNED
      });

      repository.findById.mockResolvedValue(ticket);
      repository.checkAssignmentEligibility.mockResolvedValue(true);
      repository.update.mockResolvedValue(updatedTicket);

      const result = await service.assignTechnician('1', 'tech1');

      expect(repository.checkAssignmentEligibility).toHaveBeenCalledWith('1');
      expect(repository.update).toHaveBeenCalledWith('1', {
        assigned_to: 'tech1',
        status: TicketStatus.ASSIGNED
      });
      expect(result).toEqual(updatedTicket);
    });

    it('should throw error if ticket cannot be assigned', async () => {
      const ticket = createMockTicket();
      repository.findById.mockResolvedValue(ticket);
      repository.checkAssignmentEligibility.mockResolvedValue(false);

      await expect(service.assignTechnician('1', 'tech1')).rejects.toThrow(
        'Ticket cannot be assigned in its current state'
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update status successfully', async () => {
      const ticket = createMockTicket();
      const updatedTicket = createMockTicket({ status: TicketStatus.IN_PROGRESS });

      repository.findById.mockResolvedValue(ticket);
      repository.validateStatusTransition.mockResolvedValue(true);
      repository.update.mockResolvedValue(updatedTicket);

      const result = await service.updateStatus('1', TicketStatus.IN_PROGRESS);

      expect(repository.validateStatusTransition).toHaveBeenCalledWith('1', TicketStatus.IN_PROGRESS);
      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('should throw error on invalid status transition', async () => {
      const ticket = createMockTicket();
      repository.findById.mockResolvedValue(ticket);
      repository.validateStatusTransition.mockResolvedValue(false);

      await expect(service.updateStatus('1', TicketStatus.CLOSED)).rejects.toThrow(
        'Invalid status transition'
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should list tickets with filters', async () => {
      const mockResult = {
        tickets: [createMockTicket()],
        total: 1
      };
      const filters: TicketFilters = {
        status: [TicketStatus.OPEN],
        page: 1,
        limit: 10
      };

      repository.list.mockResolvedValue(mockResult);

      const result = await service.list(filters);

      expect(repository.list).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockResult);
    });
  });

  describe('Other queries', () => {
    it('should find tickets by ATM', async () => {
      const tickets = [createMockTicket()];
      repository.findByAtm.mockResolvedValue(tickets);

      const result = await service.findByAtm('atm1');

      expect(repository.findByAtm).toHaveBeenCalledWith('atm1');
      expect(result).toEqual(tickets);
    });

    it('should find tickets by technician', async () => {
      const tickets = [createMockTicket()];
      repository.findByTechnician.mockResolvedValue(tickets);

      const result = await service.findByTechnician('tech1');

      expect(repository.findByTechnician).toHaveBeenCalledWith('tech1');
      expect(result).toEqual(tickets);
    });

    it('should get overdue tickets', async () => {
      const tickets = [createMockTicket({ due_date: new Date(Date.now() - 86400000) })];
      repository.findOverdue.mockResolvedValue(tickets);

      const result = await service.getOverdueTickets();

      expect(repository.findOverdue).toHaveBeenCalled();
      expect(result).toEqual(tickets);
    });

    it('should get tickets requiring attention', async () => {
      const tickets = [createMockTicket({ priority: TicketPriority.HIGH })];
      repository.findRequiringAttention.mockResolvedValue(tickets);

      const result = await service.getTicketsRequiringAttention();

      expect(repository.findRequiringAttention).toHaveBeenCalled();
      expect(result).toEqual(tickets);
    });
  });
});