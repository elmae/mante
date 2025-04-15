import { DataSource, Repository } from 'typeorm';
import { createTestDatabase, cleanupDatabase } from '../utils/database';
import request from 'supertest';
import { Express } from 'express-serve-static-core';
import { createApp } from '../../src/app';
import { Role } from '../../src/domain/entities/role.entity';
import { User } from '../../src/domain/entities/user.entity';
import { Permission } from '../../src/domain/entities/permission.entity';
import {
  Ticket,
  TicketStatus,
  TicketType,
  TicketPriority
} from '../../src/domain/entities/ticket.entity';
import { ATM } from '../../src/domain/entities/atm.entity';
import { Point } from 'geojson';
import { hash } from 'bcrypt';
import { DeepPartial } from 'typeorm';

describe('Metrics Integration Tests', () => {
  let app: Express;
  let dataSource: DataSource;
  let authToken: string;
  let testUser: User;
  let testRole: Role;
  let testPermission: Permission;
  let testATM: ATM;

  let userRepo: Repository<User>;
  let roleRepo: Repository<Role>;
  let permissionRepo: Repository<Permission>;
  let atmRepo: Repository<ATM>;
  let ticketRepo: Repository<Ticket>;

  const createTestLocation = (): Point => ({
    type: 'Point',
    coordinates: [-69.9312, 18.4861]
  });

  beforeAll(async () => {
    dataSource = await createTestDatabase();
    app = (await createApp(dataSource)) as Express;

    userRepo = dataSource.getRepository(User);
    roleRepo = dataSource.getRepository(Role);
    permissionRepo = dataSource.getRepository(Permission);
    atmRepo = dataSource.getRepository(ATM);
    ticketRepo = dataSource.getRepository(Ticket);

    const permissionData: DeepPartial<Permission> = {
      name: 'view_metrics',
      description: 'Can view metrics'
    };
    testPermission = await permissionRepo.save(permissionRepo.create(permissionData));

    const roleData: DeepPartial<Role> = {
      name: 'test_role',
      description: 'Test Role',
      permissions: [testPermission]
    };
    testRole = await roleRepo.save(roleRepo.create(roleData));

    const hashedPassword = await hash('password123', 10);
    const userData: DeepPartial<User> = {
      email: 'test@example.com',
      password_hash: hashedPassword,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      role: testRole,
      is_active: true
    };
    testUser = await userRepo.save(userRepo.create(userData));

    const atmData: DeepPartial<ATM> = {
      serial_number: 'TEST-123',
      model: 'Test Model',
      brand: 'Test Brand',
      address: 'Test Address',
      location: createTestLocation(),
      technical_specs: {
        cpu: 'Test CPU',
        memory: '8GB',
        os: 'Test OS',
        cash_capacity: 10000,
        supported_transactions: ['withdrawal', 'deposit']
      },
      zone_id: '1',
      client_id: '1',
      is_active: true,
      created_by: testUser
    };
    testATM = await atmRepo.save(atmRepo.create(atmData));

    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'test@example.com',
      password: 'password123'
    });

    authToken = loginResponse.body.access_token;
  });

  beforeEach(async () => {
    await ticketRepo.delete({});
  });

  afterAll(async () => {
    await cleanupDatabase(dataSource);
  });

  describe('GET /api/v1/metrics/time', () => {
    beforeEach(async () => {
      const baseTicket: DeepPartial<Ticket> = {
        atm: testATM,
        atm_id: testATM.id,
        assigned_to: testUser,
        created_at: new Date(),
        updated_at: new Date(),
        met_sla: false,
        tags: []
      };

      const tickets: DeepPartial<Ticket>[] = [
        {
          ...baseTicket,
          title: 'Test Ticket 1',
          description: 'Description 1',
          type: TicketType.CORRECTIVE,
          priority: TicketPriority.HIGH,
          status: TicketStatus.CLOSED,
          category: 'Hardware',
          subcategory: 'Display',
          completion_date: new Date('2025-04-02'),
          first_response_at: new Date('2025-04-01T01:00:00Z'),
          met_sla: true
        },
        {
          ...baseTicket,
          title: 'Test Ticket 2',
          description: 'Description 2',
          type: TicketType.PREVENTIVE,
          priority: TicketPriority.MEDIUM,
          status: TicketStatus.CLOSED,
          category: 'Software',
          subcategory: 'OS',
          completion_date: new Date('2025-04-03'),
          first_response_at: new Date('2025-04-01T02:00:00Z'),
          met_sla: false
        }
      ];

      const createdTickets = tickets.map(ticket => ticketRepo.create(ticket));
      await ticketRepo.save(createdTickets);
    });

    it('should return time metrics with proper authentication', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/time')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          averageResponseTime: expect.any(Number),
          averageResolutionTime: expect.any(Number),
          slaComplianceRate: 50
        })
      );
    });

    it('should filter metrics by date range', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/time')
        .query({
          startDate: '2025-04-01',
          endDate: '2025-04-30'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.slaComplianceRate).toBe(50);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/metrics/time');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/metrics/tickets', () => {
    beforeEach(async () => {
      const baseTicket: DeepPartial<Ticket> = {
        atm: testATM,
        atm_id: testATM.id,
        assigned_to: testUser,
        created_at: new Date(),
        updated_at: new Date(),
        met_sla: false,
        tags: []
      };

      const tickets: DeepPartial<Ticket>[] = [
        {
          ...baseTicket,
          title: 'Open Ticket',
          description: 'Description',
          type: TicketType.CORRECTIVE,
          priority: TicketPriority.HIGH,
          status: TicketStatus.OPEN,
          category: 'Hardware',
          subcategory: 'Card Reader'
        },
        {
          ...baseTicket,
          title: 'In Progress Ticket',
          description: 'Description',
          type: TicketType.PREVENTIVE,
          priority: TicketPriority.MEDIUM,
          status: TicketStatus.IN_PROGRESS,
          category: 'Software',
          subcategory: 'Firmware'
        },
        {
          ...baseTicket,
          title: 'Closed Ticket',
          description: 'Description',
          type: TicketType.CORRECTIVE,
          priority: TicketPriority.LOW,
          status: TicketStatus.CLOSED,
          category: 'Hardware',
          subcategory: 'Dispenser',
          completion_date: new Date(),
          first_response_at: new Date(),
          met_sla: true
        }
      ];

      const createdTickets = tickets.map(ticket => ticketRepo.create(ticket));
      await ticketRepo.save(createdTickets);
    });

    it('should return ticket metrics with counts', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/tickets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        total: 3,
        openTickets: 1,
        closedTickets: 1,
        inProgressTickets: 1
      });
    });

    it('should filter by ticket type', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/tickets')
        .query({ ticket_type: TicketType.CORRECTIVE })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(2);
    });
  });

  describe('Input Validation', () => {
    it('should validate date formats', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/time')
        .query({
          startDate: 'invalid-date',
          endDate: '2025-04-30'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should validate enum values', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/tickets')
        .query({
          ticket_type: 'INVALID_TYPE'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should validate numeric ranges', async () => {
      const response = await request(app)
        .get('/api/v1/metrics/historical')
        .query({
          days: '366'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
