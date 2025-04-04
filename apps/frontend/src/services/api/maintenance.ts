import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type MaintenanceType = "preventive" | "corrective";
export type MaintenanceStatus = "completed" | "pending" | "in_progress";

export interface MaintenanceRecord {
  id: string;
  atmId: string;
  type: MaintenanceType;
  description: string;
  findings: string;
  actions: string;
  recommendations: string;
  status: MaintenanceStatus;
  date: string;
  nextMaintenanceDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceRecord {
  type: MaintenanceType;
  description: string;
  findings: string;
  actions: string;
  recommendations: string;
  status: MaintenanceStatus;
  nextMaintenanceDate: string;
}

export const maintenanceService = {
  async createMaintenance(
    atmId: string,
    data: CreateMaintenanceRecord
  ): Promise<MaintenanceRecord> {
    const response = await axios.post(
      `${API_URL}/api/atms/${atmId}/maintenance`,
      data
    );
    return response.data;
  },

  async getMaintenanceHistory(atmId: string): Promise<MaintenanceRecord[]> {
    const response = await axios.get(
      `${API_URL}/api/atms/${atmId}/maintenance`
    );
    return response.data;
  },
};
