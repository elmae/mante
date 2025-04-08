import React from "react";
import { TicketStatus, TicketPriority, TicketType } from "@/types/entities";
import type { TicketFilters as ITicketFilters } from "@/services/api/ticket";
import { Select, type SelectOption } from "@/components/common/Select";
import { Input } from "@/components/common/Input";

interface TicketFiltersProps {
  currentFilters: ITicketFilters;
  onFilterChange: (filters: Partial<ITicketFilters>) => void;
}

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Todos los estados", value: "" },
  { label: "Abierto", value: "open" },
  { label: "Asignado", value: "assigned" },
  { label: "En Progreso", value: "inProgress" },
  { label: "Resuelto", value: "resolved" },
  { label: "Cerrado", value: "closed" },
];

const PRIORITY_OPTIONS: SelectOption[] = [
  { label: "Todas las prioridades", value: "" },
  { label: "Baja", value: "low" },
  { label: "Media", value: "medium" },
  { label: "Alta", value: "high" },
  { label: "Crítica", value: "critical" },
];

const TYPE_OPTIONS: SelectOption[] = [
  { label: "Todos los tipos", value: "" },
  { label: "Preventivo", value: "preventive" },
  { label: "Correctivo", value: "corrective" },
  { label: "Instalación", value: "installation" },
];

export function TicketFilters({
  currentFilters,
  onFilterChange,
}: TicketFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Búsqueda */}
        <div>
          <Input
            label="Buscar"
            value={currentFilters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Buscar tickets..."
            type="search"
          />
        </div>

        {/* Estado */}
        <div>
          <Select
            label="Estado"
            value={currentFilters.status || ""}
            onChange={(e) =>
              onFilterChange({ status: e.target.value as TicketStatus })
            }
            options={STATUS_OPTIONS}
          />
        </div>

        {/* Prioridad */}
        <div>
          <Select
            label="Prioridad"
            value={currentFilters.priority || ""}
            onChange={(e) =>
              onFilterChange({ priority: e.target.value as TicketPriority })
            }
            options={PRIORITY_OPTIONS}
          />
        </div>

        {/* Tipo */}
        <div>
          <Select
            label="Tipo"
            value={currentFilters.type || ""}
            onChange={(e) =>
              onFilterChange({ type: e.target.value as TicketType })
            }
            options={TYPE_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}
