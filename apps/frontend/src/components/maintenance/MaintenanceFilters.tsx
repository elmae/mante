import React from "react";
import type { MaintenanceFilters as IMaintenanceFilters } from "@/types/maintenance";
import type { MaintenanceType, MaintenanceStatus } from "@/types/maintenance";
import { Select, type SelectOption } from "@/components/common/Select";
import { Input } from "@/components/common/Input";
import { DateInput } from "@/components/common/DateInput";

interface MaintenanceFiltersProps {
  currentFilters: IMaintenanceFilters;
  onFilterChange: (filters: Partial<IMaintenanceFilters>) => void;
}

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Todos los estados", value: "" },
  { label: "Pendiente", value: "pending" },
  { label: "En Progreso", value: "inProgress" },
  { label: "Completado", value: "completed" },
  { label: "Cancelado", value: "cancelled" },
];

const TYPE_OPTIONS: SelectOption[] = [
  { label: "Todos los tipos", value: "" },
  { label: "Preventivo", value: "preventive" },
  { label: "Correctivo", value: "corrective" },
  { label: "Instalación", value: "installation" },
];

export function MaintenanceFilters({
  currentFilters,
  onFilterChange,
}: MaintenanceFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Búsqueda */}
        <div>
          <Input
            label="Buscar"
            value={currentFilters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Buscar mantenimientos..."
            type="search"
          />
        </div>

        {/* Estado */}
        <div>
          <Select
            label="Estado"
            value={currentFilters.status || ""}
            onChange={(e) =>
              onFilterChange({ status: e.target.value as MaintenanceStatus })
            }
            options={STATUS_OPTIONS}
          />
        </div>

        {/* Tipo */}
        <div>
          <Select
            label="Tipo"
            value={currentFilters.type || ""}
            onChange={(e) =>
              onFilterChange({ type: e.target.value as MaintenanceType })
            }
            options={TYPE_OPTIONS}
          />
        </div>

        {/* Fecha Inicio */}
        <div>
          <DateInput
            label="Desde"
            value={currentFilters.startDate}
            onChange={(value) => onFilterChange({ startDate: value })}
            maxDate={currentFilters.endDate}
          />
        </div>

        {/* Fecha Fin */}
        <div>
          <DateInput
            label="Hasta"
            value={currentFilters.endDate}
            onChange={(value) => onFilterChange({ endDate: value })}
            minDate={currentFilters.startDate}
          />
        </div>
      </div>
    </div>
  );
}
