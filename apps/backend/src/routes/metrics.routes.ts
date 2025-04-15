import { Router } from 'express';
import { MetricsController } from '../controllers/metrics.controller';
import { DataSource } from 'typeorm';
import { authenticateToken } from '../middleware/auth.middleware';
import { validatePermission } from '../middleware/validation.middleware';
import { validateQueryParams } from '../middleware/validation.middleware';
import { TicketType, TicketPriority } from '../domain/entities/ticket.entity';

export const createMetricsRouter = (dataSource: DataSource): Router => {
  const router = Router();
  const metricsController = new MetricsController(dataSource);

  // Schema de validación para parámetros comunes
  const commonParamsSchema = {
    startDate: {
      in: ['query'],
      optional: true,
      isISO8601: true,
      errorMessage: 'Fecha de inicio inválida'
    },
    endDate: {
      in: ['query'],
      optional: true,
      isISO8601: true,
      errorMessage: 'Fecha de fin inválida'
    },
    technician_id: {
      in: ['query'],
      optional: true,
      isUUID: true,
      errorMessage: 'ID de técnico inválido'
    },
    client_id: {
      in: ['query'],
      optional: true,
      isUUID: true,
      errorMessage: 'ID de cliente inválido'
    },
    atm_id: {
      in: ['query'],
      optional: true,
      isUUID: true,
      errorMessage: 'ID de ATM inválido'
    },
    ticket_type: {
      in: ['query'],
      optional: true,
      isIn: {
        options: [Object.values(TicketType)],
        errorMessage: 'Tipo de ticket inválido'
      }
    },
    priority: {
      in: ['query'],
      optional: true,
      isIn: {
        options: [Object.values(TicketPriority)],
        errorMessage: 'Prioridad inválida'
      }
    },
    timeUnit: {
      in: ['query'],
      optional: true,
      isIn: {
        options: [['day', 'week', 'month', 'year']],
        errorMessage: 'Unidad de tiempo inválida'
      }
    }
  };

  // Base metrics endpoints
  router.get(
    '/time',
    authenticateToken,
    validatePermission('view_metrics'),
    validateQueryParams(commonParamsSchema),
    (req, res) => metricsController.getTimeMetrics(req, res)
  );

  router.get(
    '/tickets',
    authenticateToken,
    validatePermission('view_metrics'),
    validateQueryParams(commonParamsSchema),
    (req, res) => metricsController.getTicketMetrics(req, res)
  );

  router.get(
    '/full',
    authenticateToken,
    validatePermission('view_metrics'),
    validateQueryParams({
      ...commonParamsSchema,
      includeTechnicianMetrics: {
        in: ['query'],
        optional: true,
        isBoolean: true,
        errorMessage: 'Valor inválido para includeTechnicianMetrics'
      },
      includeATMMetrics: {
        in: ['query'],
        optional: true,
        isBoolean: true,
        errorMessage: 'Valor inválido para includeATMMetrics'
      }
    }),
    (req, res) => metricsController.getFullMetrics(req, res)
  );

  router.get(
    '/historical',
    authenticateToken,
    validatePermission('view_metrics'),
    validateQueryParams({
      ...commonParamsSchema,
      days: {
        in: ['query'],
        optional: true,
        isInt: {
          options: { min: 1, max: 365 },
          errorMessage: 'Número de días debe estar entre 1 y 365'
        }
      },
      raw: {
        in: ['query'],
        optional: true,
        isBoolean: true,
        errorMessage: 'Valor inválido para raw'
      }
    }),
    (req, res) => metricsController.getHistoricalMetrics(req, res)
  );

  // Advanced metrics endpoints
  router.get(
    '/technicians',
    authenticateToken,
    validatePermission('view_metrics'),
    validateQueryParams(commonParamsSchema),
    (req, res) => metricsController.getTechnicianMetrics(req, res)
  );

  router.get(
    '/atms',
    authenticateToken,
    validatePermission('view_metrics'),
    validateQueryParams({
      ...commonParamsSchema,
      atm_model: {
        in: ['query'],
        optional: true,
        isString: true,
        errorMessage: 'Modelo de ATM inválido'
      },
      atm_brand: {
        in: ['query'],
        optional: true,
        isString: true,
        errorMessage: 'Marca de ATM inválida'
      },
      atm_location: {
        in: ['query'],
        optional: true,
        isString: true,
        errorMessage: 'Ubicación de ATM inválida'
      }
    }),
    (req, res) => metricsController.getATMMetrics(req, res)
  );

  router.get(
    '/categories',
    authenticateToken,
    validatePermission('view_metrics'),
    validateQueryParams({
      ...commonParamsSchema,
      category: {
        in: ['query'],
        optional: true,
        isString: true,
        errorMessage: 'Categoría inválida'
      },
      subcategory: {
        in: ['query'],
        optional: true,
        isString: true,
        errorMessage: 'Subcategoría inválida'
      }
    }),
    (req, res) => metricsController.getCategoryMetrics(req, res)
  );

  return router;
};

export default createMetricsRouter;
