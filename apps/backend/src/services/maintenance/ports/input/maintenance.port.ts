import {
  MaintenanceRecord,
  MaintenanceType,
} from "../../../../domain/entities/maintenance-record.entity";
import { Attachment } from "../../../../domain/entities/attachment.entity";
import { MaintenanceComment } from "../../../../domain/entities/maintenance-comment.entity";

export interface IMaintenanceInputPort {
  findById(id: string): Promise<MaintenanceRecord | null>;
  create(
    maintenanceData: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord>;
  update(
    id: string,
    maintenanceData: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord>;
  delete(id: string): Promise<void>;
  list(
    filters: MaintenanceFilters
  ): Promise<{ records: MaintenanceRecord[]; total: number }>;

  // Métodos específicos para mantenimiento
  startMaintenance(
    ticketId: string,
    technicianId: string
  ): Promise<MaintenanceRecord>;
  completeMaintenance(
    id: string,
    completionData: MaintenanceCompletionData
  ): Promise<MaintenanceRecord>;
  addParts(id: string, parts: MaintenancePart[]): Promise<MaintenanceRecord>;
  findByTicket(ticketId: string): Promise<MaintenanceRecord | null>;
  findByATM(atmId: string): Promise<MaintenanceRecord[]>;
  findByTechnician(technicianId: string): Promise<MaintenanceRecord[]>;
  findInProgress(): Promise<MaintenanceRecord[]>;
  getMaintenanceStats(filters: MaintenanceFilters): Promise<MaintenanceStats>;

  // Nuevos métodos para comentarios
  addComment(id: string, commentData: MaintenanceCommentData): Promise<MaintenanceComment>;
  getComments(id: string): Promise<MaintenanceComment[]>;
  deleteComment(maintenanceId: string, commentId: string): Promise<void>;

  // Nuevos métodos para mediciones y seguimiento
  updateMeasurements(id: string, measurements: TechnicalMeasurement[]): Promise<MaintenanceRecord>;
  setFollowUpStatus(
    id: string,
    requiresFollowUp: boolean,
    notes?: string
  ): Promise<MaintenanceRecord>;
  findRequiringFollowUp(): Promise<MaintenanceRecord[]>;

  // Métodos para adjuntos
  addAttachment(id: string, attachmentData: AttachmentData): Promise<MaintenanceRecord>;
  getAttachments(id: string): Promise<Attachment[]>;
  deleteAttachment(maintenanceId: string, attachmentId: string): Promise<void>;
}

export type MaintenanceFilters = {
  page?: number;
  limit?: number;
  type?: MaintenanceType[];
  atmId?: string;
  technicianId?: string;
  fromDate?: Date;
  toDate?: Date;
  isComplete?: boolean;
  ticketId?: string;
  requiresFollowUp?: boolean;
  searchTerm?: string;
}

export type MaintenancePart = {
  name: string;
  quantity: number;
  serialNumber?: string;
  notes?: string;
}

export type MaintenanceCompletionData = {
  diagnosis: string;
  work_performed: string;
  parts_used: MaintenancePart[];
  end_time: Date;
}

export type MaintenanceCommentData = {
  content: string;
  is_technical?: boolean;
  technical_details?: {
    parts_used?: string[];
    measurements?: Record<string, number>;
    issues_found?: string[];
    recommendations?: string[];
  };
  created_by_id: string;
}

export type TechnicalMeasurement = {
  name: string;
  value: number;
  unit: string;
  threshold?: number;
}

export type AttachmentData = {
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_by_id: string;
}

export type MaintenanceCommentDTO = {
  id: string;
  content: string;
  is_technical: boolean;
  technical_details?: {
    parts_used?: string[];
    measurements?: Record<string, number>;
    issues_found?: string[];
    recommendations?: string[];
  };
  created_by_id: string;
  created_at: Date;
  updated_at: Date;
  maintenance_record_id: string;
}

export type MaintenanceStats = {
  totalCount: number;
  completedCount: number;
  averageDuration: number;
  byType: Record<MaintenanceType, number>;
  mostCommonParts: Array<{
    name: string;
    count: number;
  }>;
  technicianPerformance: Array<{
    technician_id: string;
    completed_count: number;
    average_duration: number;
  }>;
}
