"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTicketMetrics } from "@/hooks/useTicketMetrics";
import { TicketStatus, TicketPriority } from "@/types";

const STATUS_COLORS = {
  [TicketStatus.OPEN]: "#FCD34D",
  [TicketStatus.ASSIGNED]: "#60A5FA",
  [TicketStatus.IN_PROGRESS]: "#A78BFA",
  [TicketStatus.RESOLVED]: "#34D399",
  [TicketStatus.CLOSED]: "#9CA3AF",
};

const PRIORITY_COLORS = {
  [TicketPriority.LOW]: "#60A5FA",
  [TicketPriority.MEDIUM]: "#FCD34D",
  [TicketPriority.HIGH]: "#F97316",
  [TicketPriority.CRITICAL]: "#EF4444",
};

export const DashboardMetrics = () => {
  const { data, isLoading } = useTicketMetrics();

  const statusData = useMemo(() => {
    if (!data?.by_status) return [];
    return Object.entries(data.by_status).map(([status, count]) => ({
      name: status.toUpperCase().replace("_", " "),
      value: count,
      status,
    }));
  }, [data?.by_status]);

  const priorityData = useMemo(() => {
    if (!data?.by_priority) return [];
    return Object.entries(data.by_priority).map(([priority, count]) => ({
      name: priority.toUpperCase(),
      value: count,
      priority,
    }));
  }, [data?.by_priority]);

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Indicadores en una sola fila */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Tickets</p>
          <p className="text-2xl font-bold">{data.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Tiempo Resolución</p>
          <p className="text-2xl font-bold">
            {Math.round(data.average_resolution_time)}h
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 mb-1">SLA</p>
          <p className="text-2xl font-bold">
            {Math.round(data.sla_compliance * 100)}%
          </p>
        </div>
      </div>

      {/* Gráficos en dos columnas */}
      <div className="grid grid-cols-2 gap-6">
        {/* Estado */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium mb-4">Por Estado</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="value" name="Tickets">
                  {statusData.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status as TicketStatus]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prioridad */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium mb-4">Por Prioridad</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label={true}
                >
                  {priorityData.map((entry) => (
                    <Cell
                      key={entry.priority}
                      fill={PRIORITY_COLORS[entry.priority as TicketPriority]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
