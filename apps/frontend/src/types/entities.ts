export enum TicketStatus {
  OPEN = "open",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

export enum TicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}
export enum TicketType {
  PREVENTIVE = "preventive",
  CORRECTIVE = "corrective",
  INSTALLATION = "installation",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "technician" | "user";
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ATM {
  id: string;
  code: string;
  serial: string;
  model: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  status: "operational" | "maintenance" | "offline" | "error";
  lastMaintenance: string;
  nextMaintenance: string;
  manufacturer: string;
  installationDate: string;
  zone: string;
}

export interface TicketComment {
  id: string;
  content: string;
  ticket: Ticket;
  ticketId: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface TicketAttachment {
  id: string;
  filename: string;
  path: string;
  ticket: Ticket;
  ticketId: string;
  uploadedBy: User;
  uploadedAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  atm?: ATM;
  atmId: string;
  assignedTo?: User;
  assignedToId?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  metSla: boolean;
  comments: TicketComment[];
  attachments: TicketAttachment[];
}

export interface MaintenanceRecord {
  id: string;
  type: "preventive" | "corrective";
  status: "pending" | "in_progress" | "completed";
  description: string;
  atm: ATM;
  atmId: string;
  assignedTo?: User;
  assignedToId?: string;
  scheduledDate: string;
  completionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceFilters = {
  type?: "preventive" | "corrective";
  status?: "pending" | "in_progress" | "completed";
  atmId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export interface PaginatedMaintenanceRecords {
  records: MaintenanceRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CreateMaintenanceRecord = Omit<
  MaintenanceRecord,
  "id" | "atm" | "created_at" | "updated_at" | "completion_date"
>;
