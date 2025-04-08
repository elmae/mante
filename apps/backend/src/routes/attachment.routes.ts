import { Router } from 'express';
import multer from 'multer';
import { DataSource } from 'typeorm';
import { AttachmentController } from '../controllers/attachment.controller';
import { createAuthMiddleware } from '../middleware/auth.middleware';
import { JwtService } from '../services/auth/adapters/input/jwt.service';
import { UserService } from '../services/user/adapters/input/user.service';
import {
  FilesService,
  LocalStorageAdapter,
  AttachmentRepository,
  AuditLogRepository,
  DEFAULT_FILE_STORAGE_OPTIONS,
  DEFAULT_RETENTION_RULES
} from '../services/files';

// Configuración de multer para manejar la subida de archivos
const upload = multer({
  dest: 'uploads/temp/', // Directorio temporal para archivos subidos
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB máximo
  }
});

export function createAttachmentRouter(
  dataSource: DataSource,
  jwtService: JwtService,
  userService: UserService
): Router {
  const router = Router();
  const auth = createAuthMiddleware(jwtService, userService);

  // Inicializar servicios y repositorios
  const storageAdapter = new LocalStorageAdapter(DEFAULT_FILE_STORAGE_OPTIONS.uploadPath);
  const attachmentRepository = new AttachmentRepository(dataSource);
  const auditLogRepository = new AuditLogRepository(dataSource);

  const filesService = new FilesService(
    storageAdapter,
    attachmentRepository,
    auditLogRepository,
    DEFAULT_FILE_STORAGE_OPTIONS,
    DEFAULT_RETENTION_RULES
  );

  const controller = new AttachmentController(filesService);

  // Rutas que requieren autenticación
  router.use(auth.authenticate);

  // También requerimos el permiso para manejar archivos
  router.use(auth.hasPermission(['manage_attachments']));

  // Subida y gestión de archivos
  router.post('/upload', upload.single('file'), controller.uploadFile.bind(controller));
  router.get('/:id/download', controller.downloadFile.bind(controller));
  router.delete('/:id', controller.deleteFile.bind(controller));
  router.post('/:id/restore', controller.restoreFile.bind(controller));

  // Información y listados
  router.get('/:id', controller.getFileInfo.bind(controller));
  router.get('/parent/:parentType/:parentId', controller.getFilesByParent.bind(controller));
  router.get('/user/deleted', controller.getDeletedFiles.bind(controller));

  // Papelera de reciclaje (solo administradores)
  router.post(
    '/recycle-bin/empty',
    auth.hasRole(['admin']),
    controller.emptyRecycleBin.bind(controller)
  );

  return router;
}
