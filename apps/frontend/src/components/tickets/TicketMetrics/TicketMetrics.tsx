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
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTicketMetrics } from "@/hooks/useTicketMetrics";
import { TicketStatus, TicketPriority } from "@/types/entities";

const STATUS_COLORS = {
  [TicketStatus.OPEN]: "#FCD34D", // yellow
  [TicketStatus.ASSIGNED]: "#60A5FA", // blue
  [TicketStatus.IN_PROGRESS]: "#A78BFA", // purple
  [TicketStatus.RESOLVED]: "#34D399", // green
  [TicketStatus.CLOSED]: "#9CA3AF", // gray
};

const PRIORITY_COLORS = {
  [TicketPriority.LOW]: "#60A5FA", // blue
  [TicketPriority.MEDIUM]: "#FCD34D", // yellow
  [TicketPriority.HIGH]: "#F97316", // orange
  [TicketPriority.CRITICAL]: "#EF4444", // red
};

interface TicketMetricsProps {
  startDate?: string;
  endDate?: string;
  atmId?: string;
  technicianId?: string;
}

export const TicketMetrics = ({
  startDate,
  endDate,
  atmId,
  technicianId,
}: TicketMetricsProps) => {
  const { data, isLoading } = useTicketMetrics({
    start_date: startDate,
    end_date: endDate,
    atm_id: atmId,
    technician_id: technicianId,
  });

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
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Indicadores principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Total de Tickets</h3>
          <p className="text-3xl font-bold">{data.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            Tiempo Promedio de Resolución
          </h3>
          <p className="text-3xl font-bold">
            {Math.round(data.average_resolution_time)} horas
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Cumplimiento SLA</h3>
          <p className="text-3xl font-bold">
            {Math.round(data.sla_compliance * 100)}%
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gráfico de estado */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tickets por Estado</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
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

        {/* Gráfico de prioridad */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Tickets por Prioridad</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {priorityData.map((entry) => (
                    <Cell
                      key={entry.priority}
                      fill={PRIORITY_COLORS[entry.priority as TicketPriority]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
