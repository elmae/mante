import { Router } from 'express';
import multer from 'multer';
import { MaintenanceController } from '../controllers/maintenance.controller';
import { MaintenanceService } from '../services/maintenance/adapters/input/maintenance.service';
import { MaintenanceRepository } from '../services/maintenance/adapters/output/maintenance.repository';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { DataSource } from 'typeorm';

export function createMaintenanceRouter(
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService
): Router {
  const router = Router();

  // Inicializar dependencias
  const maintenanceRepository = new MaintenanceRepository(dataSource);
  const maintenanceService = new MaintenanceService(maintenanceRepository);
  const maintenanceController = new MaintenanceController(maintenanceService);
  const authMiddleware = createAuthMiddleware(jwtService, userService);

  // Configuración de multer para archivos adjuntos
  const storage = multer.diskStorage({
    destination: './uploads/maintenance',
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  });

  const upload = multer({ storage });

  // Middleware de autenticación para todas las rutas
  router.use(authMiddleware.authenticate);

  // Rutas para administradores y operadores
  router.get(
    '/',
    authMiddleware.hasRole(['admin', 'operator']),
    maintenanceController.listMaintenances.bind(maintenanceController)
  );

  router.get(
    '/stats',
    authMiddleware.hasRole(['admin', 'operator']),
    maintenanceController.getMaintenanceStats.bind(maintenanceController)
  );

  router.get(
    '/in-progress',
    authMiddleware.hasRole(['admin', 'operator']),
    maintenanceController.getInProgressMaintenances.bind(maintenanceController)
  );

  // Rutas para gestión de mantenimientos
  router.post(
    '/',
    authMiddleware.hasRole(['admin', 'operator']),
    maintenanceController.createMaintenance.bind(maintenanceController)
  );

  router.post(
    '/ticket/:ticketId/start',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    maintenanceController.startMaintenance.bind(maintenanceController)
  );

  router.put(
    '/:id/complete',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    maintenanceController.completeMaintenance.bind(maintenanceController)
  );

  router.post(
    '/:id/parts',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    maintenanceController.addParts.bind(maintenanceController)
  );

  // Rutas de consulta
  router.get(
    '/:id',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    maintenanceController.getMaintenance.bind(maintenanceController)
  );

  router.get(
    '/atm/:atmId',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    maintenanceController.getMaintenancesByATM.bind(maintenanceController)
  );

  router.get(
    '/technician/:technicianId',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    maintenanceController.getMaintenancesByTechnician.bind(maintenanceController)
  );

  // Rutas administrativas
  router.delete(
    '/:id',
    authMiddleware.hasRole(['admin']),
    maintenanceController.deleteMaintenance.bind(maintenanceController)
  );

  // Rutas para comentarios técnicos
  router.post(
    '/:id/comments',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    maintenanceController.addComment.bind(maintenanceController)
  );

  router.get(
    '/:id/comments',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    maintenanceController.listComments.bind(maintenanceController)
  );

  router.delete(
    '/:id/comments/:commentId',
    authMiddleware.hasRole(['admin', 'operator']),
    maintenanceController.deleteComment.bind(maintenanceController)
  );

  // Rutas para métricas
  router.put(
    '/:id/measurements',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    maintenanceController.updateMeasurements.bind(maintenanceController)
  );

  // Rutas para seguimiento
  router.post(
    '/:id/follow-up',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    maintenanceController.setFollowUpStatus.bind(maintenanceController)
  );

  router.get(
    '/requiring-follow-up',
    authMiddleware.hasRole(['admin', 'operator']),
    maintenanceController.getRequiringFollowUp.bind(maintenanceController)
  );

  // Ruta para adjuntos
  router.post(
    '/:id/attachments',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    upload.single('file'),
    maintenanceController.addAttachment.bind(maintenanceController)
  );

  return router;
}
