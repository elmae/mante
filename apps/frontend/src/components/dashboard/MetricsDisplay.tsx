import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMetrics } from "@/hooks/useMetrics";
import { Period } from "@/types/metrics";

export const MetricsDisplay: React.FC = () => {
  const {
    timeMetrics,
    ticketMetrics,
    historicalData,
    loading,
    error,
    fetchTimeMetrics,
    fetchTicketMetrics,
    fetchHistoricalMetrics,
  } = useMetrics();

  const [selectedPeriod, setSelectedPeriod] = useState<Period>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30); // Default to last 30 days
    return { startDate: start, endDate: end };
  });

  useEffect(() => {
    fetchTimeMetrics(selectedPeriod);
    fetchTicketMetrics();
    fetchHistoricalMetrics(30);
  }, [
    fetchTimeMetrics,
    fetchTicketMetrics,
    fetchHistoricalMetrics,
    selectedPeriod,
  ]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2">Cargando métricas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  const handlePeriodChange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setSelectedPeriod({ startDate: start, endDate: end });
  };

  return (
    <div className="space-y-6">
      {/* Selector de Período */}
      <div className="flex gap-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => handlePeriodChange(days)}
            className={`px-4 py-2 rounded transition-colors ${
              selectedPeriod.startDate.getDate() === new Date().getDate() - days
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            {days} días
          </button>
        ))}
      </div>

      {/* Métricas de Tiempo */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Métricas de Tiempo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="text-sm font-medium text-blue-800">
              Tiempo Promedio de Respuesta
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {timeMetrics
                ? formatMinutes(timeMetrics.averageResponseTime)
                : "N/A"}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <h3 className="text-sm font-medium text-green-800">
              Tiempo Promedio de Resolución
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {timeMetrics
                ? formatMinutes(timeMetrics.averageResolutionTime)
                : "N/A"}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded">
            <h3 className="text-sm font-medium text-purple-800">
              Tasa de Cumplimiento SLA
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {timeMetrics ? `${timeMetrics.slaComplianceRate}%` : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Métricas de Tickets */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Estado de Tickets</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="text-sm font-medium text-gray-800">Total</h3>
            <p className="text-2xl font-bold text-gray-600">
              {ticketMetrics?.total ?? "N/A"}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded">
            <h3 className="text-sm font-medium text-yellow-800">Abiertos</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {ticketMetrics?.openTickets ?? "N/A"}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="text-sm font-medium text-blue-800">En Progreso</h3>
            <p className="text-2xl font-bold text-blue-600">
              {ticketMetrics?.inProgressTickets ?? "N/A"}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <h3 className="text-sm font-medium text-green-800">Cerrados</h3>
            <p className="text-2xl font-bold text-green-600">
              {ticketMetrics?.closedTickets ?? "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico Histórico */}
      {historicalData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Tendencias Históricas</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value: number, name: string) => {
                    if (name.includes("SLA")) return `${value}%`;
                    return formatMinutes(value);
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="metrics.timeMetrics.averageResponseTime"
                  name="Tiempo de Respuesta"
                  stroke="#2563eb"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="metrics.timeMetrics.averageResolutionTime"
                  name="Tiempo de Resolución"
                  stroke="#16a34a"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="metrics.timeMetrics.slaComplianceRate"
                  name="Cumplimiento SLA"
                  stroke="#7c3aed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsDisplay;
