import React from "react";
import { useMaintenance } from "@/hooks/useMaintenance";
import type {
  MaintenanceRecord,
  MaintenanceStatus,
  MaintenanceType,
} from "@/types/maintenance";
import { Table, type Column } from "@/components/common/Table";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Pagination } from "@/components/common/Pagination";
import { MaintenanceFilters } from "./MaintenanceFilters";
import { DashboardError } from "@/components/dashboard/DashboardError";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

const STATUS_VARIANTS: Record<
  MaintenanceStatus,
  "info" | "warning" | "success" | "error"
> = {
  pending: "warning",
  inProgress: "info",
  completed: "success",
  cancelled: "error",
};

const TYPE_VARIANTS: Record<MaintenanceType, "info" | "warning" | "success"> = {
  preventive: "info",
  corrective: "warning",
  installation: "success",
};

export function MaintenanceList() {
  const {
    records,
    totalRecords,
    currentPage,
    totalPages,
    filters,
    isLoading,
    error,
    updateFilters,
    stats,
    isLoadingStats,
  } = useMaintenance({ limit: 10 });

  if (isLoading || isLoadingStats) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <DashboardError
        message={
          error instanceof Error
            ? error.message
            : "Error al cargar los registros"
        }
        code="MAINTENANCE_ERROR"
        retry={() => updateFilters(filters)}
      />
    );
  }

  const columns: Column<MaintenanceRecord>[] = [
    {
      header: "ID",
      accessor: "id",
      cell: (value) => (
        <span className="font-mono text-sm">{value as string}</span>
      ),
    },
    {
      header: "ATM",
      accessor: "atmId",
      cell: (_, row) => row.atm?.code || row.atmId,
    },
    {
      header: "Tipo",
      accessor: "type",
      cell: (value) => {
        const type = value as MaintenanceType;
        return <Badge variant={TYPE_VARIANTS[type]}>{type}</Badge>;
      },
    },
    {
      header: "Estado",
      accessor: "status",
      cell: (value) => {
        const status = value as MaintenanceStatus;
        return <Badge variant={STATUS_VARIANTS[status]}>{status}</Badge>;
      },
    },
    {
      header: "Descripción",
      accessor: "description",
      cell: (value) => (
        <div className="max-w-md truncate" title={value as string}>
          {value as string}
        </div>
      ),
    },
    {
      header: "Fecha Inicio",
      accessor: "startDate",
      cell: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      header: "Fecha Fin",
      accessor: "endDate",
      cell: (value) =>
        value ? new Date(value as string).toLocaleDateString() : "-",
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
              console.log("Ver mantenimiento:", value);
            }}
          >
            Ver
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // TODO: Implementar edición
              console.log("Editar mantenimiento:", value);
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
            <dt className="text-sm font-medium text-gray-500">Pendientes</dt>
            <dd className="mt-1 text-3xl font-semibold text-yellow-600">
              {stats.totalPending}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 shadow rounded-lg">
            <dt className="text-sm font-medium text-gray-500">En Progreso</dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600">
              {stats.totalInProgress}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 shadow rounded-lg">
            <dt className="text-sm font-medium text-gray-500">Completados</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              {stats.totalCompleted}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 shadow rounded-lg">
            <dt className="text-sm font-medium text-gray-500">
              Duración Promedio
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stats.averageDuration} min
            </dd>
          </div>
        </div>
      )}

      {/* Filtros */}
      <MaintenanceFilters
        currentFilters={filters}
        onFilterChange={updateFilters}
      />

      {/* Tabla */}
      <Table<MaintenanceRecord>
        columns={columns}
        data={records}
        emptyMessage="No hay registros de mantenimiento para mostrar"
      />

      {/* Paginación y resumen */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{records.length}</span> de{" "}
              <span className="font-medium">{totalRecords}</span> registros
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
