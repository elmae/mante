"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import type { ATM } from "@/types/entities";
import type { ATMFilters } from "@/services/api/atm";

interface ATMFiltersProps {
  onFilterChange: (filters: Partial<ATMFilters>) => void;
  currentFilters: ATMFilters;
}

export function ATMFilters({
  onFilterChange,
  currentFilters,
}: ATMFiltersProps) {
  const [search, setSearch] = useState(currentFilters.search || "");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search, page: 1 });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ATM["status"] | "";
    onFilterChange({ status: value || undefined, page: 1 });
  };

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
      {/* Búsqueda */}
      <form onSubmit={handleSearchSubmit} className="flex-1">
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            placeholder="Buscar por código o ubicación..."
          />
        </div>
      </form>

      {/* Filtro de Estado */}
      <div className="sm:w-48">
        <select
          value={currentFilters.status || ""}
          onChange={handleStatusChange}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
        >
          <option value="">Todos los estados</option>
          <option value="operational">Operativo</option>
          <option value="maintenance">En mantenimiento</option>
          <option value="offline">Fuera de línea</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Filtro de Zona */}
      <div className="sm:w-48">
        <select
          value={currentFilters.zone || ""}
          onChange={(e) =>
            onFilterChange({ zone: e.target.value || undefined, page: 1 })
          }
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
        >
          <option value="">Todas las zonas</option>
          <option value="norte">Zona Norte</option>
          <option value="sur">Zona Sur</option>
          <option value="este">Zona Este</option>
          <option value="oeste">Zona Oeste</option>
        </select>
      </div>
    </div>
  );
}

export default ATMFilters;
