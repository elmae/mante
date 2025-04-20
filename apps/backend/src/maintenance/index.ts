// Módulo principal
export { MaintenanceModule } from './maintenance.module';

// DTOs
export {
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  FilterMaintenanceDto,
  CreateMaintenanceTaskDto,
  UpdateMaintenanceTaskDto,
  MaintenancePartResponseDto
} from './dto';

// Servicios
export {
  MaintenanceService,
  MaintenanceTasksService,
  MaintenanceServiceOptions,
  TaskServiceOptions,
  MaintenanceSortFields,
  TaskSortFields
} from './services';

// Controladores
export {
  MaintenanceController,
  MaintenanceTasksController,
  MaintenanceResponse,
  TaskResponse,
  MAINTENANCE_ROUTES,
  PaginatedResponse
} from './controllers';

// Interfaces compartidas
export interface MaintenanceStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  requiresFollowUp: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  skipped: number;
  overdue: number;
}

// Constantes
export const MAINTENANCE_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT_FIELD: 'createdAt',
  DEFAULT_SORT_ORDER: 'DESC',
  MAX_TASKS_PER_MAINTENANCE: 50,
  MAX_ATTACHMENTS_PER_MAINTENANCE: 20,
  MAX_COMMENTS_PER_MAINTENANCE: 100
} as const;
