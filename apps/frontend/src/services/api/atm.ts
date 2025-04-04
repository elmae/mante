import { apiClient, handleApiError } from "./client";

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

export interface ATMFilters {
  status?: ATM["status"];
  zone?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedATMs {
  data: ATM[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ATMError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ATMError";
  }
}

export const atmService = {
  async getATMs(filters: ATMFilters = {}): Promise<PaginatedATMs> {
    try {
      const response = await apiClient.get("/atms", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new ATMError(apiError.message, apiError.code, apiError.details);
    }
  },

  async getATM(id: string): Promise<ATM> {
    try {
      const response = await apiClient.get(`/atms/${id}`);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new ATMError(apiError.message, apiError.code, apiError.details);
    }
  },

  async updateATM(id: string, data: Partial<ATM>): Promise<ATM> {
    try {
      const response = await apiClient.patch(`/atms/${id}`, data);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new ATMError(apiError.message, apiError.code, apiError.details);
    }
  },

  async deleteATM(id: string): Promise<void> {
    try {
      await apiClient.delete(`/atms/${id}`);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new ATMError(apiError.message, apiError.code, apiError.details);
    }
  },

  async createATM(data: Omit<ATM, "id">): Promise<ATM> {
    try {
      const response = await apiClient.post("/atms", data);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new ATMError(apiError.message, apiError.code, apiError.details);
    }
  },
};
