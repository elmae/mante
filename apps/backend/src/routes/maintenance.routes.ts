import { Router } from "express";
import multer from "multer";
import { MaintenanceController } from "../controllers/maintenance.controller";
import { MaintenanceService } from "../services/maintenance/adapters/input/maintenance.service";
import { MaintenanceRepository } from "../services/maintenance/adapters/output/maintenance.repository";
import { createAuthMiddleware } from "../middleware/auth.middleware";
import { JwtService } from "../services/auth/adapters/input/jwt.service";
import { UserService } from "../services/user/adapters/input/user.service";
import { UserRepository } from "../services/user/adapters/output/user.repository";
import { User } from "../domain/entities/user.entity";
import { DataSource } from "typeorm";

export function createMaintenanceRouter(dataSource: DataSource): Router {
  const router = Router();

  // Inicializar dependencias
  const userRepository = new UserRepository(dataSource.getRepository(User));
  const userService = new UserService(userRepository);
  const jwtService = new JwtService();
  const authMiddleware = createAuthMiddleware(jwtService, userService);

  const maintenanceRepository = new MaintenanceRepository(dataSource);
  const maintenanceService = new MaintenanceService(maintenanceRepository);
  const maintenanceController = new MaintenanceController(maintenanceService);

  // Configuración de multer para archivos adjuntos
  const storage = multer.diskStorage({
    destination: "./uploads/maintenance",
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });

  const upload = multer({ storage });

  // Middleware de autenticación para todas las rutas
  router.use(authMiddleware.authenticate);

  // Rutas para administradores y operadores
  router.get(
    "/",
    authMiddleware.hasRole(["admin", "operator"]),
    maintenanceController.listMaintenances
  );

  router.get(
    "/stats",
    authMiddleware.hasRole(["admin", "operator"]),
    maintenanceController.getMaintenanceStats
  );

  router.get(
    "/in-progress",
    authMiddleware.hasRole(["admin", "operator"]),
    maintenanceController.getInProgressMaintenances
  );

  // Rutas para gestión de mantenimientos
  router.post(
    "/",
    authMiddleware.hasRole(["admin", "operator"]),
    maintenanceController.createMaintenance
  );

  router.post(
    "/ticket/:ticketId/start",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    maintenanceController.startMaintenance
  );

  router.put(
    "/:id/complete",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    maintenanceController.completeMaintenance
  );

  router.post(
    "/:id/parts",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    maintenanceController.addParts
  );

  // Rutas de consulta
  router.get(
    "/:id",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    maintenanceController.getMaintenance
  );

  router.get(
    "/atm/:atmId",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    maintenanceController.getMaintenancesByATM
  );

  router.get(
    "/technician/:technicianId",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    maintenanceController.getMaintenancesByTechnician
  );

  // Rutas administrativas
  router.delete(
    "/:id",
    authMiddleware.hasRole(["admin"]),
    maintenanceController.deleteMaintenance
  );

  // Rutas para comentarios técnicos
  router.post(
    "/:id/comments",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    maintenanceController.addComment
  );

  router.get(
    "/:id/comments",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    maintenanceController.listComments
  );

  router.delete(
    "/:id/comments/:commentId",
    authMiddleware.hasRole(["admin", "operator"]),
    maintenanceController.deleteComment
  );

  // Rutas para métricas y costos
  router.put(
    "/:id/measurements",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    maintenanceController.updateMeasurements
  );

  router.put(
    "/:id/cost",
    authMiddleware.hasRole(["admin", "operator"]),
    maintenanceController.updateCost
  );

  // Rutas para seguimiento
  router.post(
    "/:id/follow-up",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    maintenanceController.setFollowUpStatus
  );

  router.get(
    "/requiring-follow-up",
    authMiddleware.hasRole(["admin", "operator"]),
    maintenanceController.getRequiringFollowUp
  );

  // Ruta para adjuntos
  router.post(
    "/:id/attachments",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    upload.single("file"),
    maintenanceController.addAttachment
  );

  return router;
}
