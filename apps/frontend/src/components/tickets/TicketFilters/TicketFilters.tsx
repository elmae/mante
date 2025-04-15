"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ITicketFiltersProps, ITicketFilters } from "./TicketFilters.types";
import { TicketPriority, TicketStatus, TicketType } from "@/types/entities";
import { useATMs } from "@/hooks/useATMs";
import { useUsers } from "@/hooks/useUsers";

export const TicketFilters: React.FC<ITicketFiltersProps> = ({
  filters,
  onFilterChange,
  isLoading,
}) => {
  const { atms } = useATMs() as {
    atms: Array<{ id: string; code: string; location: { address: string } }>;
  };
  const { data: users } = useUsers();
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (
    key: keyof ITicketFilters,
    value: string | string[] | Date | null | boolean | undefined
  ) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <div className="space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-600 hover:text-gray-800"
          >
            {expanded ? "Ocultar" : "Mostrar"}
          </button>
          <button
            onClick={clearFilters}
            className="text-red-600 hover:text-red-800"
            disabled={isLoading}
          >
            Limpiar
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Búsqueda por texto */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Búsqueda
            </label>
            <input
              type="text"
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Buscar en título/descripción"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              disabled={isLoading}
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              multiple
              value={filters.status || []}
              onChange={(e) =>
                handleFilterChange(
                  "status",
                  Array.from(
                    e.target.selectedOptions,
                    (option) => option.value as TicketStatus
                  )
                )
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              disabled={isLoading}
            >
              {Object.values(TicketStatus).map((status) => (
                <option key={status} value={status}>
                  {status === "open"
                    ? "Abierto"
                    : status === "assigned"
                    ? "Asignado"
                    : status === "in_progress"
                    ? "En Progreso"
                    : status === "resolved"
                    ? "Resuelto"
                    : "Cerrado"}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridad */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Prioridad
            </label>
            <select
              multiple
              value={filters.priority || []}
              onChange={(e) =>
                handleFilterChange(
                  "priority",
                  Array.from(
                    e.target.selectedOptions,
                    (option) => option.value as TicketPriority
                  )
                )
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              disabled={isLoading}
            >
              {Object.values(TicketPriority).map((priority) => (
                <option key={priority} value={priority}>
                  {priority === "low"
                    ? "Baja"
                    : priority === "medium"
                    ? "Media"
                    : priority === "high"
                    ? "Alta"
                    : "Crítica"}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tipo
            </label>
            <select
              multiple
              value={filters.type || []}
              onChange={(e) =>
                handleFilterChange(
                  "type",
                  Array.from(
                    e.target.selectedOptions,
                    (option) => option.value as TicketType
                  )
                )
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              disabled={isLoading}
            >
              {["preventive", "corrective", "installation"].map((type) => (
                <option key={type} value={type}>
                  {type === "preventive"
                    ? "Preventivo"
                    : type === "corrective"
                    ? "Correctivo"
                    : "Visita"}
                </option>
              ))}
            </select>
          </div>

          {/* ATM */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ATM
            </label>
            <select
              value={filters.atmId || ""}
              onChange={(e) => handleFilterChange("atmId", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              disabled={isLoading}
            >
              <option value="">Todos los ATMs</option>
              {atms?.map(
                (atm: {
                  id: string;
                  code: string;
                  location: { address: string };
                }) => (
                  <option key={atm.id} value={atm.id}>
                    {atm.code} - {atm.location.address}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Técnico Asignado */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Técnico Asignado
            </label>
            <select
              value={filters.assignedTo || ""}
              onChange={(e) => handleFilterChange("assignedTo", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              disabled={isLoading}
            >
              <option value="">Todos los técnicos</option>
              {users?.map((user: { id: string; name: string }) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rango de Fechas */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Rango de Fechas
            </label>
            <div className="flex space-x-2">
              <DatePicker
                selected={filters.dateFrom ?? null}
                onChange={(date: Date | null) =>
                  handleFilterChange("dateFrom", date)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholderText="Fecha inicio"
                disabled={isLoading}
              />
              <DatePicker
                selected={filters.dateTo ?? null}
                onChange={(date: Date | null) =>
                  handleFilterChange("dateTo", date)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholderText="Fecha fin"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* SLA */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              SLA
            </label>
            <select
              value={filters.metSla === undefined ? "" : String(filters.metSla)}
              onChange={(e) =>
                handleFilterChange(
                  "metSla",
                  e.target.value === "" ? undefined : e.target.value === "true"
                )
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              disabled={isLoading}
            >
              <option value="">Todos</option>
              <option value="true">Cumple SLA</option>
              <option value="false">No cumple SLA</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};
