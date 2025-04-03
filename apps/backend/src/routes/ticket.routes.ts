import { Router } from "express";
import multer from "multer";
import { TicketController } from "../controllers/ticket.controller";
import { TicketService } from "../services/ticket/adapters/input/ticket.service";
import { TicketRepository } from "../services/ticket/adapters/output/ticket.repository";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { DataSource } from "typeorm";

export function createTicketRouter(dataSource: DataSource): Router {
  const router = Router();

  // Configuración de multer para la carga de archivos
  const storage = multer.diskStorage({
    destination: "./uploads/tickets",
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });

  const upload = multer({ storage });

  // Inicializar dependencias
  const ticketRepository = new TicketRepository(dataSource);
  const ticketService = new TicketService(ticketRepository);
  const ticketController = new TicketController(ticketService);

  // Rutas públicas - ninguna por ahora

  // Rutas protegidas - requieren autenticación
  router.use(AuthMiddleware.authenticate());

  // Rutas para administradores y operadores
  router.get(
    "/",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    ticketController.listTickets
  );

  router.get(
    "/overdue",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    ticketController.getOverdueTickets
  );

  router.get(
    "/requiring-attention",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    ticketController.getTicketsRequiringAttention
  );

  // Rutas para gestión de tickets
  router.post(
    "/",
    AuthMiddleware.requireAnyRole(["admin", "operator", "technician"]),
    ticketController.createTicket
  );

  router.get(
    "/:id",
    AuthMiddleware.requireAnyRole(["admin", "operator", "technician"]),
    ticketController.getTicketById
  );

  router.put(
    "/:id",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    ticketController.updateTicket
  );

  router.delete(
    "/:id",
    AuthMiddleware.requireRole("admin"),
    ticketController.deleteTicket
  );

  // Rutas para asignación y estado
  router.post(
    "/:id/assign",
    AuthMiddleware.requireAnyRole(["admin", "operator"]),
    ticketController.assignTicket
  );

  router.put(
    "/:id/status",
    AuthMiddleware.requireAnyRole(["admin", "operator", "technician"]),
    ticketController.updateStatus
  );

  // Rutas para búsquedas específicas
  router.get(
    "/atm/:atmId",
    AuthMiddleware.requireAnyRole(["admin", "operator", "technician"]),
    ticketController.getTicketsByAtm
  );

  router.get(
    "/technician/:technicianId",
    AuthMiddleware.requireAnyRole(["admin", "operator", "technician"]),
    ticketController.getTicketsByTechnician
  );

  // Rutas para adjuntos
  router.post(
    "/:id/attachments",
    AuthMiddleware.requireAnyRole(["admin", "operator", "technician"]),
    upload.single("file"),
    ticketController.addAttachment
  );

  return router;
}
