// Mantenimiento
export { CreateMaintenanceDto } from './create-maintenance.dto';
export { UpdateMaintenanceDto } from './update-maintenance.dto';
export { FilterMaintenanceDto } from './filter-maintenance.dto';

// Tareas
export { CreateMaintenanceTaskDto, UpdateMaintenanceTaskDto } from './maintenance-task.dto';

// Partes y Materiales
export {
  CreateMaintenancePartDto,
  UpdateMaintenancePartDto,
  MaintenancePartResponseDto
} from './maintenance-part.dto';

// Response types
export interface MaintenancePaginatedResponse {
  records: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query params types
export interface MaintenanceQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: string;
  type?: string;
  assignedToId?: string;
  startDate?: string;
  endDate?: string;
  atmId?: string;
  requiresFollowUp?: boolean;
}
