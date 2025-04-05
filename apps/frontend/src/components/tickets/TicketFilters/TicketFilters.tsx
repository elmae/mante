"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ITicketFiltersProps } from "./TicketFilters.types";
import { TicketPriority, TicketStatus, TicketType } from "@/types/entities";
import { useATMs } from "@/hooks/useATMs";
import { useUsers } from "@/hooks/useUsers";

export const TicketFilters: React.FC<ITicketFiltersProps> = ({
  filters,
  onFilterChange,
  isLoading,
}) => {
  const { data: atms } = useATMs();
  const { data: users } = useUsers();
  const [expanded, setExpanded] = useState(false);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
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
                  Array.from(e.target.selectedOptions, (option) => option.value)
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
                  Array.from(e.target.selectedOptions, (option) => option.value)
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
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              disabled={isLoading}
            >
              {Object.values(TicketType).map((type) => (
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
              value={filters.atm_id || ""}
              onChange={(e) => handleFilterChange("atm_id", e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              disabled={isLoading}
            >
              <option value="">Todos los ATMs</option>
              {atms?.map((atm) => (
                <option key={atm.id} value={atm.id}>
                  {atm.serial} - {atm.location}
                </option>
              ))}
            </select>
          </div>

          {/* Técnico Asignado */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Técnico Asignado
            </label>
            <select
              value={filters.assigned_to || ""}
              onChange={(e) =>
                handleFilterChange("assigned_to", e.target.value)
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              disabled={isLoading}
            >
              <option value="">Todos los técnicos</option>
              {users?.map((user) => (
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
                selected={filters.date_from}
                onChange={(date) => handleFilterChange("date_from", date)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholderText="Fecha inicio"
                disabled={isLoading}
              />
              <DatePicker
                selected={filters.date_to}
                onChange={(date) => handleFilterChange("date_to", date)}
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
              value={
                filters.met_sla === undefined ? "" : String(filters.met_sla)
              }
              onChange={(e) =>
                handleFilterChange(
                  "met_sla",
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
