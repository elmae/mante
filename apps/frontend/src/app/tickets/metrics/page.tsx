"use client";

import { useState } from "react";
import { TicketMetrics } from "@/components/tickets/TicketMetrics";
import { useATMs } from "@/hooks/useATMs";
import { useUsers } from "@/hooks/useUsers";
import { User, ATM } from "@/types/entities";

export default function TicketMetricsPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedAtm, setSelectedAtm] = useState<string>("");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");

  const { atms = [] } = useATMs();
  const { data: users = [] } = useUsers();

  const technicians = users.filter((user: User) => user.role === "technician");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Métricas de Tickets</h1>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha Inicial
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha Final
            </label>
            <input
              type="date"
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ATM</label>
            <select
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              value={selectedAtm}
              onChange={(e) => setSelectedAtm(e.target.value)}
            >
              <option value="">Todos</option>
              {atms.map((atm: ATM) => (
                <option key={atm.id} value={atm.id}>
                  {atm.code} - {atm.location.address}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Técnico</label>
            <select
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
            >
              <option value="">Todos</option>
              {technicians.map((tech: User) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <TicketMetrics
        startDate={startDate}
        endDate={endDate}
        atmId={selectedAtm}
        technicianId={selectedTechnician}
      />
    </div>
  );
}
