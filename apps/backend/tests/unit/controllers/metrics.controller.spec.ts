import { MetricsController } from '../../../src/controllers/metrics.controller';
import { MetricsService } from '../../../src/services/metrics.service';
import { DataSource, Repository } from 'typeorm';
import { Request, Response } from 'express';
import { Ticket, TicketType, TicketPriority } from '../../../src/domain/entities/ticket.entity';
import {
  TechnicianMetrics,
  ATMMetrics,
  CategoryMetrics,
  MetricsSummary
} from '../../../src/domain/dtos/metrics-filter.dto';

jest.mock('../../../src/services/metrics.service');

describe('MetricsController', () => {
  let controller: MetricsController;
  let mockDataSource: DataSource;
  let mockResponse: Partial<Response>;
  let mockMetricsService: jest.Mocked<MetricsService>;
  let mockTicketRepository: Repository<Ticket>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTicketRepository = {
      find: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn()
    } as unknown as Repository<Ticket>;

    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockTicketRepository)
    } as unknown as DataSource;

    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    mockMetricsService = {
      calculateTimeMetrics: jest.fn(),
      getTicketMetrics: jest.fn(),
      getHistoricalMetrics: jest.fn(),
      getMetricsSummary: jest.fn(),
      getTechnicianMetrics: jest.fn(),
      getATMMetrics: jest.fn(),
      getCategoryMetrics: jest.fn()
    } as unknown as jest.Mocked<MetricsService>;

    (MetricsService as jest.MockedClass<typeof MetricsService>).mockImplementation(
      () => mockMetricsService
    );

    controller = new MetricsController(mockDataSource);
  });

  describe('getTimeMetrics', () => {
    it('should handle basic time metrics request', async () => {
      const mockRequest = {
        query: {}
      } as Request;

      const mockTimeMetrics = {
        averageResponseTime: 120,
        averageResolutionTime: 480,
        slaComplianceRate: 95
      };

      mockMetricsService.calculateTimeMetrics.mockResolvedValue(mockTimeMetrics);

      await controller.getTimeMetrics(mockRequest, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockTimeMetrics);
    });

    it('should handle time metrics with filters', async () => {
      const mockRequest = {
        query: {
          startDate: '2025-04-01',
          endDate: '2025-04-30',
          technician_id: 'tech-123',
          ticket_type: TicketType.PREVENTIVE
        }
      } as unknown as Request;

      await controller.getTimeMetrics(mockRequest, mockResponse as Response);

      expect(mockMetricsService.calculateTimeMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            startDate: expect.any(Date),
            endDate: expect.any(Date),
            technician_id: 'tech-123',
            ticket_type: TicketType.PREVENTIVE
          })
        })
      );
    });

    it('should handle errors gracefully', async () => {
      const mockRequest = { query: {} } as Request;
      const error = new Error('Test error');
      mockMetricsService.calculateTimeMetrics.mockRejectedValue(error);

      await controller.getTimeMetrics(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error al obtener métricas de tiempo',
        details: 'Test error'
      });
    });
  });

  describe('getTicketMetrics', () => {
    it('should handle basic ticket metrics request', async () => {
      const mockRequest = { query: {} } as Request;

      const mockTicketMetrics = {
        total: 100,
        openTickets: 30,
        closedTickets: 60,
        inProgressTickets: 10
      };

      mockMetricsService.getTicketMetrics.mockResolvedValue(mockTicketMetrics);

      await controller.getTicketMetrics(mockRequest, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockTicketMetrics);
    });

    it('should handle ticket metrics with advanced filters', async () => {
      const mockRequest = {
        query: {
          priority: TicketPriority.HIGH,
          sla_compliant: 'true',
          groupBy: 'week'
        }
      } as unknown as Request;

      await controller.getTicketMetrics(mockRequest, mockResponse as Response);

      expect(mockMetricsService.getTicketMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: expect.objectContaining({
            priority: TicketPriority.HIGH,
            sla_compliant: true
          }),
          aggregation: expect.objectContaining({
            timeUnit: 'week'
          })
        })
      );
    });
  });

  describe('getHistoricalMetrics', () => {
    it('should handle historical metrics request with default parameters', async () => {
      const mockRequest = { query: {} } as Request;

      const mockHistoricalData = [
        {
          date: new Date(),
          metrics: {
            timeMetrics: {
              averageResponseTime: 120,
              averageResolutionTime: 480,
              slaComplianceRate: 95
            },
            ticketMetrics: {
              total: 100,
              openTickets: 30,
              closedTickets: 60,
              inProgressTickets: 10
            }
          }
        }
      ];

      mockMetricsService.getHistoricalMetrics.mockResolvedValue(mockHistoricalData);

      await controller.getHistoricalMetrics(mockRequest, mockResponse as Response);

      expect(mockMetricsService.getHistoricalMetrics).toHaveBeenCalledWith(expect.any(Object));
      expect(mockResponse.json).toHaveBeenCalledWith(mockHistoricalData);
    });

    it('should handle historical metrics with custom parameters', async () => {
      const mockRequest = {
        query: {
          days: '90',
          timeUnit: 'month',
          raw: 'true'
        }
      } as unknown as Request;

      await controller.getHistoricalMetrics(mockRequest, mockResponse as Response);

      expect(mockMetricsService.getHistoricalMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregation: expect.objectContaining({
            timeUnit: 'month',
            rawData: true
          })
        })
      );
    });
  });

  describe('getTechnicianMetrics', () => {
    it('should handle technician metrics request', async () => {
      const mockRequest = { query: {} } as Request;

      const mockTechnicianMetrics: TechnicianMetrics[] = [
        {
          technician_id: 'tech-123',
          technician_name: 'John Doe',
          assigned_tickets: 50,
          completed_tickets: 45,
          average_resolution_time: 240,
          sla_compliance_rate: 95
        }
      ];

      mockMetricsService.getTechnicianMetrics.mockResolvedValue(mockTechnicianMetrics);

      await controller.getTechnicianMetrics(mockRequest, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockTechnicianMetrics);
    });
  });

  describe('getATMMetrics', () => {
    it('should handle ATM metrics request', async () => {
      const mockRequest = { query: {} } as Request;

      const mockATMMetrics: ATMMetrics[] = [
        {
          atm_id: 'atm-123',
          model: 'ATM-2000',
          brand: 'TestBrand',
          location: 'Test Location',
          incidents_count: 25,
          uptime_percentage: 99.5,
          average_resolution_time: 180,
          most_common_issues: [
            { category: 'Hardware', count: 15 },
            { category: 'Software', count: 10 }
          ]
        }
      ];

      mockMetricsService.getATMMetrics.mockResolvedValue(mockATMMetrics);

      await controller.getATMMetrics(mockRequest, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockATMMetrics);
    });
  });

  describe('getCategoryMetrics', () => {
    it('should handle category metrics request', async () => {
      const mockRequest = { query: {} } as Request;

      const mockCategoryMetrics: CategoryMetrics[] = [
        {
          category: 'Hardware',
          subcategory: 'Display',
          ticket_count: 30,
          average_resolution_time: 240,
          sla_compliance_rate: 92,
          trending: true
        }
      ];

      mockMetricsService.getCategoryMetrics.mockResolvedValue(mockCategoryMetrics);

      await controller.getCategoryMetrics(mockRequest, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockCategoryMetrics);
    });
  });

  describe('getFullMetrics', () => {
    it('should return complete metrics summary', async () => {
      const mockRequest = { query: {} } as Request;

      const mockMetricsSummary: MetricsSummary = {
        timeMetrics: {
          averageResponseTime: 120,
          averageResolutionTime: 480,
          slaComplianceRate: 95
        },
        ticketMetrics: {
          total: 100,
          openTickets: 30,
          closedTickets: 60,
          inProgressTickets: 10
        },
        categoryMetrics: [
          {
            category: 'Hardware',
            subcategory: 'Display',
            ticket_count: 50,
            average_resolution_time: 240,
            sla_compliance_rate: 90,
            trending: true
          }
        ]
      };

      mockMetricsService.getMetricsSummary.mockResolvedValue(mockMetricsSummary);

      await controller.getFullMetrics(mockRequest, mockResponse as Response);

      expect(mockResponse.json).toHaveBeenCalledWith(mockMetricsSummary);
    });

    it('should handle errors in full metrics', async () => {
      const mockRequest = { query: {} } as Request;
      const error = new Error('Test error');
      mockMetricsService.getMetricsSummary.mockRejectedValue(error);

      await controller.getFullMetrics(mockRequest, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error al obtener métricas completas',
        details: 'Test error'
      });
    });
  });
});
