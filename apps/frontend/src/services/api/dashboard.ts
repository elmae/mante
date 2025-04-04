import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface DashboardStats {
  pendingJobs: number;
  averageResponseTime: string;
  pendingIssues: number;
  completedOrders: number;
}

export interface DashboardTrends {
  value: number;
  isPositive: boolean;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  status: "success" | "pending" | "error";
}

export interface TicketStatus {
  name: string;
  count: number;
  color: string;
}

export const dashboardService = {
  async getStats(): Promise<{
    stats: DashboardStats;
    trends: Record<keyof DashboardStats, DashboardTrends>;
  }> {
    const response = await axios.get(`${API_URL}/api/dashboard/stats`);
    return response.data;
  },

  async getRecentActivity(): Promise<Activity[]> {
    const response = await axios.get(`${API_URL}/api/dashboard/activity`);
    return response.data;
  },

  async getTicketDistribution(): Promise<{
    data: TicketStatus[];
    total: number;
  }> {
    const response = await axios.get(
      `${API_URL}/api/dashboard/tickets/distribution`
    );
    return response.data;
  },
};
