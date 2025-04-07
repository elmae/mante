import { apiClient, handleApiError } from "./client";
import type {
  MaintenanceRecord,
  MaintenanceSchedule,
  MaintenanceFilters,
  MaintenanceStats,
} from "@/types/maintenance";

export interface PaginatedMaintenanceRecords {
  data: MaintenanceRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  // Registros de mantenimiento
  async getMaintenanceRecords(
    filters: MaintenanceFilters = {}
  ): Promise<PaginatedMaintenanceRecords> {
    try {
      const response = await apiClient.get("/maintenance/records", {
        params: filters,
      });
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

  async getMaintenanceRecord(id: string): Promise<MaintenanceRecord> {
    try {
      const response = await apiClient.get(`/maintenance/records/${id}`);
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

  async createMaintenanceRecord(
    data: Omit<MaintenanceRecord, "id" | "created_at" | "updated_at">
  ): Promise<MaintenanceRecord> {
    try {
      const response = await apiClient.post("/maintenance/records", data);
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

  async updateMaintenanceRecord(
    id: string,
    data: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord> {
    try {
      const response = await apiClient.patch(
        `/maintenance/records/${id}`,
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

  async deleteMaintenanceRecord(id: string): Promise<void> {
    try {
      await apiClient.delete(`/maintenance/records/${id}`);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new MaintenanceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  // Programación de mantenimiento
  async getMaintenanceSchedules(): Promise<MaintenanceSchedule[]> {
    try {
      const response = await apiClient.get("/maintenance/schedules");
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

  async createMaintenanceSchedule(
    data: Omit<MaintenanceSchedule, "id" | "created_at" | "updated_at">
  ): Promise<MaintenanceSchedule> {
    try {
      const response = await apiClient.post("/maintenance/schedules", data);
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

  async updateMaintenanceSchedule(
    id: string,
    data: Partial<MaintenanceSchedule>
  ): Promise<MaintenanceSchedule> {
    try {
      const response = await apiClient.patch(
        `/maintenance/schedules/${id}`,
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

  async deleteMaintenanceSchedule(id: string): Promise<void> {
    try {
      await apiClient.delete(`/maintenance/schedules/${id}`);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new MaintenanceError(
        apiError.message,
        apiError.code,
        apiError.details
      );
    }
  },

  // Estadísticas
  async getMaintenanceStats(): Promise<MaintenanceStats> {
    try {
      const response = await apiClient.get("/maintenance/stats");
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
};
