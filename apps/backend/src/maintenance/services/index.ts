export { MaintenanceService } from './maintenance.service';
export { MaintenanceTasksService } from './maintenance-tasks.service';

// También exportamos tipos comunes que podrían ser necesarios
export interface MaintenanceServiceOptions {
  includeRelations?: boolean;
  includeSoftDeleted?: boolean;
}

export interface TaskServiceOptions {
  includeComments?: boolean;
  includeAttachments?: boolean;
}

// Constantes compartidas
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Enums de ordenamiento
export enum MaintenanceSortFields {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  STATUS = 'status',
  PRIORITY = 'priority',
  DUE_DATE = 'dueDate'
}

export enum TaskSortFields {
  ORDER = 'order',
  CREATED_AT = 'createdAt',
  STATUS = 'status',
  PRIORITY = 'priority',
  DUE_DATE = 'scheduledDate'
}
