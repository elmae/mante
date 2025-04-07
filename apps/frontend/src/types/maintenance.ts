import { ATM } from "./entities";

export type MaintenanceType = "preventive" | "corrective" | "installation";
export type MaintenanceStatus =
  | "pending"
  | "inProgress"
  | "completed"
  | "cancelled";
export type MaintenanceFrequency =
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export interface MaintenanceSchedule {
  id: string;
  atmId: string;
  atm?: ATM;
  type: MaintenanceType;
  frequency: MaintenanceFrequency;
  nextDate: string;
  lastCompleted?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: string;
  atmId: string;
  atm?: ATM;
  scheduleId?: string;
  schedule?: MaintenanceSchedule;
  type: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  startDate: string;
  endDate?: string;
  duration?: number; // en minutos
  findings?: string;
  recommendations?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface MaintenanceFilters {
  atmId?: string;
  type?: MaintenanceType;
  status?: MaintenanceStatus;
  frequency?: MaintenanceFrequency;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: keyof MaintenanceRecord;
  sortOrder?: "asc" | "desc";
}

export interface MaintenanceStats {
  totalPending: number;
  totalInProgress: number;
  totalCompleted: number;
  totalCancelled: number;
  averageDuration: number;
  upcomingMaintenance: number;
  overdueCount: number;
  byType: {
    preventive: number;
    corrective: number;
    installation: number;
  };
  byATM: Array<{
    atmId: string;
    atmCode: string;
    count: number;
    avgDuration: number;
  }>;
}
