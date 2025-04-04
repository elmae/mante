"use client";

import {
  WrenchScrewdriverIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import StatCard from "@/components/dashboard/StatCard";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DashboardError from "@/components/dashboard/DashboardError";
import ActivityTable from "@/components/dashboard/ActivityTable";
import TicketDistribution from "@/components/dashboard/TicketDistribution";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const {
    stats,
    trends,
    recentActivity,
    ticketDistribution,
    isLoading,
    errors,
  } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (errors.stats || errors.activity || errors.distribution) {
    return <DashboardError />;
  }

  const dashboardStats = [
    {
      title: "Trabajos Pendientes",
      value: stats?.pendingJobs || 0,
      icon: WrenchScrewdriverIcon,
      trend: trends?.pendingJobs || { value: 0, isPositive: false },
    },
    {
      title: "Tiempo Promedio de Respuesta",
      value: stats?.averageResponseTime || "0min",
      icon: ClockIcon,
      trend: trends?.averageResponseTime || { value: 0, isPositive: true },
    },
    {
      title: "Fallas Pendientes",
      value: stats?.pendingIssues || 0,
      icon: ExclamationTriangleIcon,
      trend: trends?.pendingIssues || { value: 0, isPositive: false },
    },
    {
      title: "Órdenes Completadas",
      value: stats?.completedOrders || 0,
      icon: CheckCircleIcon,
      trend: trends?.completedOrders || { value: 0, isPositive: true },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-gray-900">
          Panel de Control
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          Vista general del sistema de mantenimiento de ATMs
        </p>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Sección de gráficos y tablas */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h4 className="text-lg font-medium text-gray-900">
            Actividad Reciente
          </h4>
          <div className="mt-4">
            {recentActivity ? (
              <ActivityTable activities={recentActivity} />
            ) : (
              <div className="text-center text-gray-500 py-8">
                No hay actividad reciente
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h4 className="text-lg font-medium text-gray-900">
            Distribución de Tickets
          </h4>
          <div className="mt-4">
            {ticketDistribution ? (
              <TicketDistribution
                data={ticketDistribution.data}
                total={ticketDistribution.total}
              />
            ) : (
              <div className="text-center text-gray-500 py-8">
                No hay datos de distribución
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
