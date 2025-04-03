import { Router } from "express";
import multer from "multer";
import { MaintenanceController } from "../controllers/maintenance.controller";
import { MaintenanceService } from "../services/maintenance/adapters/input/maintenance.service";
import { MaintenanceRepository } from "../services/maintenance/adapters/output/maintenance.repository";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { DataSource } from "typeorm";

export function createMaintenanceRouter(dataSource: DataSource): Router {
  const router = Router();

  // Inicializar dependencias
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
  router.use(AuthMiddleware.authenticate());

  // Rutas para administradores y operadores
  router.get(
    "/",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    maintenanceController.listMaintenances
  );

  router.get(
    "/stats",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    maintenanceController.getMaintenanceStats
  );

  router.get(
    "/in-progress",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    maintenanceController.getInProgressMaintenances
  );

  // Rutas para gestión de mantenimientos
  router.post(
    "/",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    maintenanceController.createMaintenance
  );

  router.post(
    "/ticket/:ticketId/start",
    AuthMiddleware.requireAnyRole(["admin", "operator", "technician"]),
    maintenanceController.startMaintenance
  );

  router.put(
    "/:id/complete",
    AuthMiddleware.requireAnyRole(["admin", "operator", "technician"]),
    maintenanceController.completeMaintenance
  );

  router.post(
    "/:id/parts",
    AuthMiddleware.requireAnyRole(["admin", "operator", "technician"]),
    maintenanceController.addParts
  );

  // Rutas de consulta
  router.get(
    "/:id",
    AuthMiddleware.requireAnyRole(["admin", "operator", "technician"]),
    maintenanceController.getMaintenance
  );

  router.get(
    "/atm/:atmId",
    AuthMiddleware.requireAnyRole(["admin", "operator", "technician"]),
    maintenanceController.getMaintenancesByATM
  );

  router.get(
    "/technician/:technicianId",
    AuthMiddleware.requireAnyRole(["admin", "operator", "technician"]),
    maintenanceController.getMaintenancesByTechnician
  );

  // Rutas administrativas
  router.delete(
    "/:id",
    AuthMiddleware.requireRole("admin"),
    maintenanceController.deleteMaintenance
  );

  return router;
}
