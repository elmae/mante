import { Router } from "express";
import multer from "multer";
import { TicketController } from "../controllers/ticket.controller";
import { TicketService } from "../services/ticket/adapters/input/ticket.service";
import { TicketRepository } from "../services/ticket/adapters/output/ticket.repository";
import { createAuthMiddleware } from "../middleware/auth.middleware";
import { JwtService } from "../services/auth/adapters/input/jwt.service";
import { UserService } from "../services/user/adapters/input/user.service";
import { UserRepository } from "../services/user/adapters/output/user.repository";
import { DataSource } from "typeorm";
import { User } from "../domain/entities/user.entity";

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
  const userRepository = new UserRepository(dataSource.getRepository(User));
  const userService = new UserService(userRepository);
  const jwtService = new JwtService();
  const authMiddleware = createAuthMiddleware(jwtService, userService);

  const ticketRepository = new TicketRepository(dataSource);
  const ticketService = new TicketService(ticketRepository);
  const ticketController = new TicketController(ticketService);

  // Rutas públicas - ninguna por ahora

  // Rutas protegidas - requieren autenticación
  router.use(authMiddleware.authenticate);

  // Rutas para administradores y operadores
  router.get(
    "/",
    authMiddleware.hasRole(["admin", "operator"]),
    ticketController.listTickets
  );

  router.get(
    "/overdue",
    authMiddleware.hasRole(["admin", "operator"]),
    ticketController.getOverdueTickets
  );

  router.get(
    "/requiring-attention",
    authMiddleware.hasRole(["admin", "operator"]),
    ticketController.getTicketsRequiringAttention
  );

  // Rutas para gestión de tickets
  router.post(
    "/",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    ticketController.createTicket
  );

  router.get(
    "/:id",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    ticketController.getTicketById
  );

  router.put(
    "/:id",
    authMiddleware.hasRole(["admin", "operator"]),
    ticketController.updateTicket
  );

  router.delete(
    "/:id",
    authMiddleware.hasRole(["admin"]),
    ticketController.deleteTicket
  );

  // Rutas para asignación y estado
  router.post(
    "/:id/assign",
    authMiddleware.hasRole(["admin", "operator"]),
    ticketController.assignTicket
  );

  router.put(
    "/:id/status",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    ticketController.updateStatus
  );

  // Rutas para comentarios
  router.post(
    "/:id/comments",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    ticketController.addComment
  );

  router.get(
    "/:id/comments",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    ticketController.listComments
  );

  router.delete(
    "/:id/comments/:commentId",
    authMiddleware.hasRole(["admin", "operator"]),
    ticketController.deleteComment
  );

  // Rutas para adjuntos
  router.get(
    "/:id/attachments",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    ticketController.listAttachments
  );

  router.delete(
    "/:id/attachments/:attachmentId",
    authMiddleware.hasRole(["admin", "operator"]),
    ticketController.deleteAttachment
  );

  // Rutas para métricas y búsqueda avanzada
  router.get(
    "/metrics",
    authMiddleware.hasRole(["admin", "operator"]),
    ticketController.getTicketMetrics
  );

  router.get(
    "/search",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    ticketController.searchTickets
  );

  // Rutas para búsquedas específicas
  router.get(
    "/atm/:atmId",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    ticketController.getTicketsByAtm
  );

  router.get(
    "/technician/:technicianId",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    ticketController.getTicketsByTechnician
  );

  // Rutas para adjuntos
  router.post(
    "/:id/attachments",
    authMiddleware.hasRole(["admin", "operator", "technician"]),
    upload.single("file"),
    ticketController.addAttachment
  );

  return router;
}
