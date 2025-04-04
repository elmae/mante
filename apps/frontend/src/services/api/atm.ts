import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

export const atmService = {
  async getATMs(filters: ATMFilters = {}): Promise<PaginatedATMs> {
    const response = await axios.get(`${API_URL}/api/atms`, {
      params: filters,
    });
    return response.data;
  },

  async getATM(id: string): Promise<ATM> {
    const response = await axios.get(`${API_URL}/api/atms/${id}`);
    return response.data;
  },

  async updateATM(id: string, data: Partial<ATM>): Promise<ATM> {
    const response = await axios.patch(`${API_URL}/api/atms/${id}`, data);
    return response.data;
  },

  async deleteATM(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/atms/${id}`);
  },

  async createATM(data: Omit<ATM, "id">): Promise<ATM> {
    const response = await axios.post(`${API_URL}/api/atms`, data);
    return response.data;
  },
};
