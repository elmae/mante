import { Router } from "express";
import { DataSource } from "typeorm";
import { SLAController } from "../controllers/sla.controller";
import { SLAService } from "../services/sla/adapters/input/sla.service";
import { SLARepository } from "../services/sla/adapters/output/sla.repository";
import { AuthMiddleware } from "../middleware/auth.middleware";

export function createSlaRouter(dataSource: DataSource): Router {
  const router = Router();

  // Inicializar dependencias
  const slaRepository = new SLARepository(dataSource);
  const slaService = new SLAService(slaRepository);
  const slaController = new SLAController(slaService);

  // Middleware de autenticación para todas las rutas
  router.use(AuthMiddleware.authenticate());

  // Rutas para administradores
  router.post(
    "/",
    AuthMiddleware.requireRole("admin"),
    slaController.createSLA.bind(slaController)
  );

  router.put(
    "/:id",
    AuthMiddleware.requireRole("admin"),
    slaController.updateSLA.bind(slaController)
  );

  router.delete(
    "/:id",
    AuthMiddleware.requireRole("admin"),
    slaController.deleteSLA.bind(slaController)
  );

  // Rutas para administradores y operadores
  router.get(
    "/",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    slaController.getSLAs.bind(slaController)
  );

  router.get(
    "/active",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    slaController.getActiveSLAs.bind(slaController)
  );

  router.get(
    "/:id",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    slaController.getSLAById.bind(slaController)
  );

  router.get(
    "/zone/:zoneId",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    slaController.getSLAsByZone.bind(slaController)
  );

  router.get(
    "/client/:clientId",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    slaController.getSLAsByClient.bind(slaController)
  );

  // Rutas para análisis de cumplimiento
  router.post(
    "/compliance",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    slaController.calculateCompliance.bind(slaController)
  );

  router.post(
    "/validate",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    slaController.validateSLA.bind(slaController)
  );

  return router;
}
