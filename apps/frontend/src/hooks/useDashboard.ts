import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/api/dashboard";

export function useDashboard() {
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardService.getStats,
  });

  const {
    data: activityData,
    isLoading: isLoadingActivity,
    error: activityError,
  } = useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: dashboardService.getRecentActivity,
  });

  const {
    data: distributionData,
    isLoading: isLoadingDistribution,
    error: distributionError,
  } = useQuery({
    queryKey: ["dashboard", "distribution"],
    queryFn: dashboardService.getTicketDistribution,
  });

  return {
    stats: statsData?.stats,
    trends: statsData?.trends,
    recentActivity: activityData,
    ticketDistribution: distributionData,
    isLoading: isLoadingStats || isLoadingActivity || isLoadingDistribution,
    errors: {
      stats: statsError,
      activity: activityError,
      distribution: distributionError,
    },
  };
}
