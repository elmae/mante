export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ATM {
  id: string;
  serial: string;
  model: string;
  location: string;
}

export enum TicketType {
  PREVENTIVE = "preventive",
  CORRECTIVE = "corrective",
  VISIT = "visit",
}

export enum TicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum TicketStatus {
  OPEN = "open",
  ASSIGNED = "assigned",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

export interface Comment {
  id: string;
  content: string;
  ticket_id: string;
  created_by: User;
  created_at: Date;
  updated_at: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  atm_id: string;
  atm?: ATM;
  assigned_to?: string;
  assignedTo?: User;
  due_date?: Date;
  created_at: Date;
  updated_at: Date;
  created_by?: User;
  updated_by?: User;
  met_sla: boolean;
  comments?: Comment[];
}
