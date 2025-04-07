import React from "react";
import { useTickets } from "@/hooks/useTickets";
import type {
  Ticket,
  TicketStatus,
  TicketType,
  TicketPriority,
} from "@/types/entities";
import { Table, type Column } from "@/components/common/Table";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Pagination } from "@/components/common/Pagination";
import { TicketFilters } from "@/components/tickets/TicketFilters";
import { DashboardError } from "@/components/dashboard/DashboardError";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

const STATUS_VARIANTS: Record<
  TicketStatus,
  "info" | "warning" | "success" | "primary" | "error"
> = {
  open: "info",
  assigned: "warning",
  inProgress: "primary",
  resolved: "success",
  closed: "success",
};

const PRIORITY_VARIANTS: Record<
  TicketPriority,
  "success" | "info" | "warning" | "error"
> = {
  low: "success",
  medium: "info",
  high: "warning",
  critical: "error",
};

const TYPE_VARIANTS: Record<TicketType, "info" | "warning" | "success"> = {
  preventive: "info",
  corrective: "warning",
  installation: "success",
};

export function TicketList() {
  const {
    tickets,
    totalTickets,
    currentPage,
    totalPages,
    filters,
    isLoading,
    error,
    updateFilters,
    stats,
    isLoadingStats,
  } = useTickets({ limit: 10 });

  if (isLoading || isLoadingStats) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <DashboardError
        message={
          error instanceof Error ? error.message : "Error al cargar tickets"
        }
        code="TICKETS_ERROR"
        retry={() => updateFilters(filters)}
      />
    );
  }

  // Definición tipada de columnas
  const columns: Column<Ticket>[] = [
    {
      header: "ID",
      accessor: "id",
      cell: (value) => (
        <span className="font-mono text-sm">{value as string}</span>
      ),
    },
    {
      header: "Título",
      accessor: "title",
      cell: (value) => (
        <div className="max-w-md truncate" title={value as string}>
          {value as string}
        </div>
      ),
    },
    {
      header: "Tipo",
      accessor: "type",
      cell: (value) => {
        const type = value as TicketType;
        return <Badge variant={TYPE_VARIANTS[type]}>{type}</Badge>;
      },
    },
    {
      header: "Prioridad",
      accessor: "priority",
      cell: (value) => {
        const priority = value as TicketPriority;
        return <Badge variant={PRIORITY_VARIANTS[priority]}>{priority}</Badge>;
      },
    },
    {
      header: "Estado",
      accessor: "status",
      cell: (value) => {
        const status = value as TicketStatus;
        return <Badge variant={STATUS_VARIANTS[status]}>{status}</Badge>;
      },
    },
    {
      header: "ATM",
      accessor: "atmId",
      cell: (value, row) => row.atm?.code || (value as string) || "-",
    },
    {
      header: "Asignado a",
      accessor: "assignedToId",
      cell: (value, row) => row.assignedTo?.name || "-",
    },
    {
      header: "Fecha Creación",
      accessor: "created_at",
      cell: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      header: "Acciones",
      accessor: "id",
      cell: (value) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // TODO: Implementar vista de detalles
              console.log("Ver ticket:", value);
            }}
          >
            Ver
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // TODO: Implementar edición
              console.log("Editar ticket:", value);
            }}
          >
            Editar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="bg-white px-4 py-5 shadow rounded-lg">
            <dt className="text-sm font-medium text-gray-500">
              Tickets Abiertos
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600">
              {stats.totalOpen}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 shadow rounded-lg">
            <dt className="text-sm font-medium text-gray-500">En Progreso</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">
              {stats.totalInProgress}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 shadow rounded-lg">
            <dt className="text-sm font-medium text-gray-500">Cerrados</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              {stats.totalClosed}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 shadow rounded-lg">
            <dt className="text-sm font-medium text-gray-500">
              Tiempo Promedio
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.averageResolutionTime}
            </dd>
          </div>
        </div>
      )}

      {/* Filtros */}
      <TicketFilters currentFilters={filters} onFilterChange={updateFilters} />

      {/* Tabla */}
      <Table<Ticket>
        columns={columns}
        data={tickets}
        emptyMessage="No hay tickets para mostrar"
      />

      {/* Paginación y resumen */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{tickets.length}</span> de{" "}
              <span className="font-medium">{totalTickets}</span> tickets
            </p>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => updateFilters({ page })}
          />
        </div>
      </div>
    </div>
  );
}
