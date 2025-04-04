export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "operator" | "technician" | "client";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ATM {
  id: string;
  serialNumber: string;
  model: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  clientId: string;
  status: "active" | "inactive" | "maintenance";
  lastMaintenance?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  atmId: string;
  type: "preventive" | "corrective" | "onDemand";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "assigned" | "inProgress" | "resolved" | "closed";
  description: string;
  technicianId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  ticketId: string;
  technicianId: string;
  type: "firstLine" | "secondLine" | "onDemand";
  description: string;
  startTime: Date;
  endTime?: Date;
  status: "pending" | "inProgress" | "completed";
  parts?: {
    id: string;
    name: string;
    quantity: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GeographicZone {
  id: string;
  name: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
    radius: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SLAConfig {
  id: string;
  zoneId: string;
  clientId?: string;
  responseTime: number; // en minutos
  resolutionTime: number; // en minutos
  priority: "low" | "medium" | "high" | "critical";
  createdAt: Date;
  updatedAt: Date;
}
