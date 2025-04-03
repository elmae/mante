import { Router } from "express";
import { AtmController } from "../controllers/atm.controller";
import { AtmService } from "../services/atm/adapters/input/atm.service";
import { AtmRepository } from "../services/atm/adapters/output/atm.repository";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { DataSource } from "typeorm";

export function createAtmRouter(dataSource: DataSource): Router {
  const router = Router();

  // Inicializar dependencias
  const atmRepository = new AtmRepository(dataSource);
  const atmService = new AtmService(atmRepository);
  const atmController = new AtmController(atmService);

  // Rutas protegidas - Solo administradores y operadores pueden gestionar ATMs
  router.post(
    "/",
    AuthMiddleware.requireRole("admin"),
    atmController.createAtm
  );

  router.put(
    "/:id",
    AuthMiddleware.requireRole("admin"),
    atmController.updateAtm
  );

  router.delete(
    "/:id",
    AuthMiddleware.requireRole("admin"),
    atmController.deleteAtm
  );

  // Rutas de consulta - Accesibles para administradores y operadores
  router.get(
    "/",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    atmController.getAtms
  );

  router.get(
    "/:id",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    atmController.getAtmById
  );

  router.get(
    "/location/search",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    atmController.findByLocation
  );

  router.get(
    "/:id/status",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    atmController.getAtmStatus
  );

  // Rutas para búsquedas específicas
  router.get(
    "/client/:clientId",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    atmController.findByClient
  );

  router.get(
    "/zone/:zoneId",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    atmController.findByZone
  );

  return router;
}
