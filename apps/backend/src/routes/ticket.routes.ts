import { Router } from 'express';
import multer from 'multer';
import { TicketController } from '../controllers/ticket.controller';
import { TicketService } from '../services/ticket/adapters/input/ticket.service';
import { TicketRepository } from '../services/ticket/adapters/output/ticket.repository';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import { DataSource } from 'typeorm';

export function createTicketRouter(
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService
): Router {
  const router = Router();

  // Configuración de multer para la carga de archivos
  const storage = multer.diskStorage({
    destination: './uploads/tickets',
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  });

  const upload = multer({ storage });

  // Inicializar dependencias
  const ticketRepository = new TicketRepository(dataSource);
  const ticketService = new TicketService(ticketRepository);
  const ticketController = new TicketController(ticketService);
  const authMiddleware = createAuthMiddleware(jwtService, userService);

  // Rutas protegidas - requieren autenticación
  router.use(authMiddleware.authenticate);

  // Rutas para administradores y operadores
  router.get(
    '/',
    authMiddleware.hasRole(['admin', 'operator']),
    ticketController.listTickets.bind(ticketController)
  );

  router.get(
    '/overdue',
    authMiddleware.hasRole(['admin', 'operator']),
    ticketController.getOverdueTickets.bind(ticketController)
  );

  router.get(
    '/requiring-attention',
    authMiddleware.hasRole(['admin', 'operator']),
    ticketController.getTicketsRequiringAttention.bind(ticketController)
  );

  // Rutas para gestión de tickets
  router.post(
    '/',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    ticketController.createTicket.bind(ticketController)
  );

  router.get(
    '/:id',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    ticketController.getTicketById.bind(ticketController)
  );

  router.put(
    '/:id',
    authMiddleware.hasRole(['admin', 'operator']),
    ticketController.updateTicket.bind(ticketController)
  );

  router.delete(
    '/:id',
    authMiddleware.hasRole(['admin']),
    ticketController.deleteTicket.bind(ticketController)
  );

  // Rutas para asignación y estado
  router.post(
    '/:id/assign',
    authMiddleware.hasRole(['admin', 'operator']),
    ticketController.assignTicket.bind(ticketController)
  );

  router.put(
    '/:id/status',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    ticketController.updateStatus.bind(ticketController)
  );

  // Rutas para comentarios
  router.post(
    '/:id/comments',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    ticketController.addComment.bind(ticketController)
  );

  router.get(
    '/:id/comments',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    ticketController.listComments.bind(ticketController)
  );

  router.delete(
    '/:id/comments/:commentId',
    authMiddleware.hasRole(['admin', 'operator']),
    ticketController.deleteComment.bind(ticketController)
  );

  // Rutas para adjuntos
  router.get(
    '/:id/attachments',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    ticketController.listAttachments.bind(ticketController)
  );

  router.delete(
    '/:id/attachments/:attachmentId',
    authMiddleware.hasRole(['admin', 'operator']),
    ticketController.deleteAttachment.bind(ticketController)
  );

  // Rutas para métricas y búsqueda avanzada
  router.get(
    '/metrics',
    authMiddleware.hasRole(['admin', 'operator']),
    ticketController.getTicketMetrics.bind(ticketController)
  );

  router.get(
    '/search',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    ticketController.searchTickets.bind(ticketController)
  );

  // Rutas para búsquedas específicas
  router.get(
    '/atm/:atmId',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    ticketController.getTicketsByAtm.bind(ticketController)
  );

  router.get(
    '/technician/:technicianId',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    ticketController.getTicketsByTechnician.bind(ticketController)
  );

  // Rutas para adjuntos
  router.post(
    '/:id/attachments',
    authMiddleware.hasRole(['admin', 'operator', 'technician']),
    upload.single('file'),
    ticketController.addAttachment.bind(ticketController)
  );

  return router;
}
