export { MaintenanceController } from './maintenance.controller';
export { MaintenanceTasksController } from './maintenance-tasks.controller';

// También exportamos interfaces útiles para los controladores
export interface MaintenanceResponse {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

export interface TaskResponse {
  id: string;
  title: string;
  status: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}

// Constantes compartidas
export const MAINTENANCE_ROUTES = {
  BASE: 'maintenance',
  BY_ID: 'maintenance/:id',
  TASKS: 'maintenance/:maintenanceId/tasks',
  TASK_BY_ID: 'maintenance/:maintenanceId/tasks/:id',
  COMMENTS: 'maintenance/:maintenanceId/comments',
  ATTACHMENTS: 'maintenance/:maintenanceId/attachments',
  ASSIGN: 'maintenance/:id/assign/:technicianId',
  TASK_ASSIGN: 'maintenance/:maintenanceId/tasks/:id/assign/:technicianId'
} as const;

// Tipos de respuestas paginadas
export interface PaginatedResponse<T> {
  records: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
