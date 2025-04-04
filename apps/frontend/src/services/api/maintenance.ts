import { apiClient, handleApiError } from "./client";

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

export class MaintenanceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "MaintenanceError";
  }
}

export const maintenanceService = {
  async createMaintenance(
    atmId: string,
    data: CreateMaintenanceRecord
  ): Promise<MaintenanceRecord> {
    try {
      const response = await apiClient.post(`/atms/${atmId}/maintenance`, data);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new MaintenanceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  async getMaintenanceHistory(atmId: string): Promise<MaintenanceRecord[]> {
    try {
      const response = await apiClient.get(`/atms/${atmId}/maintenance`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new MaintenanceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  async updateMaintenance(
    atmId: string,
    maintenanceId: string,
    data: Partial<CreateMaintenanceRecord>
  ): Promise<MaintenanceRecord> {
    try {
      const response = await apiClient.patch(
        `/atms/${atmId}/maintenance/${maintenanceId}`,
        data
      );
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new MaintenanceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  async deleteMaintenance(atmId: string, maintenanceId: string): Promise<void> {
    try {
      await apiClient.delete(`/atms/${atmId}/maintenance/${maintenanceId}`);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new MaintenanceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },
};
