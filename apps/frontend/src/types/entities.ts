export enum TicketStatus {
  OPEN = "open",
  ASSIGNED = "assigned",
  IN_PROGRESS = "inProgress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}
export enum TicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}
export type TicketType = "preventive" | "corrective" | "installation";

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

export interface Comment {
  id: string;
  content: string;
  ticket: Ticket;
  ticketId: string;
  createdBy: User;
  createdById: string;
  created_at: string;
  updated_at: string;
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
  createdById: string;
  created_at: string;
  updated_at: string;
  comments: Comment[];
}
