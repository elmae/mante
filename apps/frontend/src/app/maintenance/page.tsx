"use client";

import { useState } from "react";
import { useMaintenanceRecords } from "@/hooks/useMaintenanceRecords";
import { useATM, type UseATMError } from "@/hooks/useATM";
import { MaintenanceFilters } from "@/components/maintenance/MaintenanceFilters";
import { MaintenanceTable } from "@/components/maintenance/MaintenanceTable";
import { MaintenanceDetails } from "@/components/maintenance/MaintenanceDetails";
import { MaintenanceForm } from "@/components/atms/MaintenanceForm";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardError } from "@/components/dashboard/DashboardError";
import type {
  MaintenanceRecord,
  MaintenanceError,
} from "@/services/api/maintenance";

interface MaintenancePageProps {
  params: {
    atmId?: string;
  };
}

type PageError = UseATMError | MaintenanceError;

export default function MaintenancePage({ params }: MaintenancePageProps) {
  // Estados para modales
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<
    MaintenanceRecord | undefined
  >();

  // Hook para obtener información del ATM
  const {
    atm,
    isLoading: isLoadingATM,
    error: atmError,
  } = useATM(params.atmId);

  // Hook para gestionar registros de mantenimiento
  const {
    maintenanceRecords,
    total,
    page,
    totalPages,
    filters,
    isLoading,
    error,
    updateFilters,
    create,
    update,
    delete: deleteRecord,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,
  } = useMaintenanceRecords({
    atmId: params.atmId,
    limit: 10,
  });

  if (isLoading || isLoadingATM) {
    return <DashboardSkeleton />;
  }

  const pageError = (error || atmError) as PageError | null;
  if (pageError) {
    return (
      <DashboardError
        message={pageError.message}
        code={pageError.code}
        retry={() => updateFilters(filters)}
      />
    );
  }

  const handleView = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setIsDetailsOpen(true);
  };

  const handleEdit = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setIsFormOpen(true);
  };

  const handleDelete = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;
    await deleteRecord({
      atmId: selectedRecord.atmId,
      maintenanceId: selectedRecord.id,
    });
    setIsConfirmDeleteOpen(false);
    setSelectedRecord(undefined);
  };

  if (!atm) {
    return <DashboardError message="ATM no encontrado" code="NOT_FOUND" />;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold leading-6 text-gray-900">
            Mantenimientos - ATM {atm.code}
          </h2>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Historial de mantenimientos realizados
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            type="button"
            onClick={() => {
              setSelectedRecord(undefined);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Registrar Mantenimiento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <MaintenanceFilters
        currentFilters={filters}
        onFilterChange={updateFilters}
      />

      {/* Tabla */}
      <MaintenanceTable
        records={maintenanceRecords}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Paginación */}
      <div className="mt-5">
        <nav
          className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0"
          aria-label="Pagination"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-gray-700">
              Mostrando{" "}
              <span className="font-medium">{(page - 1) * 10 + 1}</span> a{" "}
              <span className="font-medium">{Math.min(page * 10, total)}</span>{" "}
              de <span className="font-medium">{total}</span> resultados
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end">
            <button
              onClick={() => updateFilters({ page: page - 1 })}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => updateFilters({ page: page + 1 })}
              disabled={page === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </nav>
      </div>

      {/* Modal de Detalles */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedRecord(undefined);
        }}
        title="Detalles del Mantenimiento"
      >
        {selectedRecord && <MaintenanceDetails record={selectedRecord} />}
      </Modal>

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedRecord(undefined);
        }}
        title={`${selectedRecord ? "Editar" : "Registrar"} Mantenimiento`}
      >
        <MaintenanceForm
          atm={atm}
          onSubmit={(data) => {
            if (selectedRecord) {
              update({
                atmId: selectedRecord.atmId,
                maintenanceId: selectedRecord.id,
                data,
              });
            } else {
              create({
                atmId: atm.id,
                data,
              });
            }
            setIsFormOpen(false);
            setSelectedRecord(undefined);
          }}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedRecord(undefined);
          }}
          isSubmitting={isCreating || isUpdating}
          error={selectedRecord ? updateError : createError}
        />
      </Modal>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setSelectedRecord(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Mantenimiento"
        message="¿Estás seguro que deseas eliminar este mantenimiento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        type="danger"
        isLoading={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
