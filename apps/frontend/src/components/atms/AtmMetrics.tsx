"use client";

import { useQuery } from "@tanstack/react-query";
import { atmService } from "@/services/api/atm";
import type { ATM } from "@/types/entities";

interface AtmMetric {
  title: string;
  value: number;
  description: string;
  color: string;
}

export function AtmMetrics() {
  const { data: atms, isLoading } = useQuery({
    queryKey: ["atms"],
    queryFn: () => atmService.getATMs({ limit: 1000 }),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-3 mt-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!atms) return null;

  const metrics: AtmMetric[] = [
    {
      title: "Total ATMs",
      value: atms.total,
      description: "Número total de ATMs registrados",
      color: "bg-blue-500",
    },
    {
      title: "ATMs Operativos",
      value: atms.data.filter((atm: ATM) => atm.status === "operational")
        .length,
      description: "ATMs en funcionamiento normal",
      color: "bg-green-500",
    },
    {
      title: "En Mantenimiento",
      value: atms.data.filter((atm: ATM) => atm.status === "maintenance")
        .length,
      description: "ATMs en mantenimiento programado",
      color: "bg-yellow-500",
    },
    {
      title: "Fuera de Servicio",
      value: atms.data.filter((atm: ATM) => atm.status === "offline").length,
      description: "ATMs desconectados o inactivos",
      color: "bg-gray-500",
    },
    {
      title: "Con Errores",
      value: atms.data.filter((atm: ATM) => atm.status === "error").length,
      description: "ATMs reportando fallos",
      color: "bg-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.title}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className={`h-2 ${metric.color}`}></div>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">
              {metric.title}
            </h3>
            <p className="text-3xl font-bold mt-2">{metric.value}</p>
            <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
