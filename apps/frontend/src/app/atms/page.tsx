"use client";

import { useState } from "react";
import { useATMs } from "@/hooks/useATMs";
import { ATMFilters } from "@/components/atms/ATMFilters";
import { ATMTable } from "@/components/atms/ATMTable";
import { ATMForm } from "@/components/atms/ATMForm";
import { ATMDetails } from "@/components/atms/ATMDetails";
import { MaintenanceForm } from "@/components/atms/MaintenanceForm";
import { Modal } from "@/components/common/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Pagination } from "@/components/common/Pagination";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardError } from "@/components/dashboard/DashboardError";
import type { ATM } from "@/types/entities";
import type { CreateMaintenanceRecord } from "@/services/api/maintenance";

export default function ATMsPage() {
  // Estado de modales y ATM seleccionado
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState(false);
  const [isConfirmMaintenanceOpen, setIsConfirmMaintenanceOpen] =
    useState(false);
  const [selectedATM, setSelectedATM] = useState<ATM | undefined>();
  const [pendingFormData, setPendingFormData] = useState<
    Omit<ATM, "id"> | undefined
  >();
  const [pendingMaintenance, setPendingMaintenance] = useState<
    CreateMaintenanceRecord | undefined
  >();

  // Estado y operaciones de ATMs
  const {
    atms,
    total,
    page,
    totalPages,
    filters,
    isLoading,
    error,
    updateFilters,
    deleteATM,
    createATM,
    updateATM,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError,
    registerMaintenance,
    isRegistering,
    maintenanceError,
  } = useATMs({ limit: 10 });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <DashboardError
        message={error.message || "Error al cargar los ATMs"}
        code={error.code}
        retry={() => updateFilters(filters)}
      />
    );
  }

  const handleView = (atm: ATM) => {
    setSelectedATM(atm);
    setIsDetailsOpen(true);
  };

  const handleEdit = (atm: ATM) => {
    setSelectedATM(atm);
    setIsFormOpen(true);
  };

  const handleDelete = (atm: ATM) => {
    setSelectedATM(atm);
    setIsConfirmDeleteOpen(true);
  };

  const handleFormSubmit = (data: Omit<ATM, "id">) => {
    setPendingFormData({
      ...data,
      serial: data.code, // Use code as serial if not provided
    });
    setIsConfirmSaveOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedATM) return;
    await deleteATM(selectedATM.id);
    setIsConfirmDeleteOpen(false);
    setSelectedATM(undefined);
  };

  const handleConfirmSave = async () => {
    if (!pendingFormData) return;

    if (selectedATM) {
      await updateATM({ id: selectedATM.id, data: pendingFormData });
    } else {
      await createATM(pendingFormData);
    }
    setIsFormOpen(false);
    setIsConfirmSaveOpen(false);
    setSelectedATM(undefined);
    setPendingFormData(undefined);
  };

  const handleMaintenance = (atm: ATM) => {
    setSelectedATM(atm);
    setIsMaintenanceOpen(true);
  };

  const handleMaintenanceSubmit = (data: CreateMaintenanceRecord) => {
    setPendingMaintenance(data);
    setIsConfirmMaintenanceOpen(true);
  };

  const handleConfirmMaintenance = async () => {
    if (!selectedATM || !pendingMaintenance) return;
    await registerMaintenance({
      atmId: selectedATM.id,
      data: pendingMaintenance,
    });
    setIsMaintenanceOpen(false);
    setIsConfirmMaintenanceOpen(false);
    setSelectedATM(undefined);
    setPendingMaintenance(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold leading-6 text-gray-900">
            ATMs
          </h2>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Listado de cajeros automáticos y su estado actual
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            type="button"
            onClick={() => {
              setSelectedATM(undefined);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Agregar ATM
          </button>
        </div>
      </div>

      {/* Filtros */}
      <ATMFilters onFilterChange={updateFilters} currentFilters={filters} />

      {/* Tabla */}
      <ATMTable
        atms={atms}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMaintenance={handleMaintenance}
      />

      {/* Paginación */}
      <div className="mt-5">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => updateFilters({ page: newPage })}
        />
      </div>

      {/* Resumen */}
      <div className="mt-4 text-sm text-gray-500">
        Mostrando {atms.length} de {total} ATMs
      </div>

      {/* Modal de Detalles */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedATM(undefined);
        }}
        title={`Detalles del ATM ${selectedATM?.code || ""}`}
      >
        {selectedATM && <ATMDetails atm={selectedATM} />}
      </Modal>

      {/* Modal de Crear/Editar ATM */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedATM(undefined);
        }}
        title={selectedATM ? "Editar ATM" : "Crear ATM"}
      >
        <ATMForm
          atm={selectedATM}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedATM(undefined);
          }}
          isSubmitting={isCreating || isUpdating}
          error={selectedATM ? updateError : createError}
        />
      </Modal>

      {/* Modal de Mantenimiento */}
      <Modal
        isOpen={isMaintenanceOpen}
        onClose={() => {
          setIsMaintenanceOpen(false);
          setSelectedATM(undefined);
        }}
        title={`Registrar Mantenimiento - ATM ${selectedATM?.code || ""}`}
      >
        {selectedATM && (
          <MaintenanceForm
            atm={selectedATM}
            onSubmit={handleMaintenanceSubmit}
            onCancel={() => {
              setIsMaintenanceOpen(false);
              setSelectedATM(undefined);
            }}
            isSubmitting={isRegistering}
            error={maintenanceError}
          />
        )}
      </Modal>

      {/* Diálogos de confirmación */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => {
          setIsConfirmDeleteOpen(false);
          setSelectedATM(undefined);
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar ATM"
        message={`¿Estás seguro que deseas eliminar el ATM ${selectedATM?.code}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
        isLoading={isDeleting}
        error={deleteError}
      />

      <ConfirmDialog
        isOpen={isConfirmSaveOpen}
        onClose={() => {
          setIsConfirmSaveOpen(false);
          setPendingFormData(undefined);
        }}
        onConfirm={handleConfirmSave}
        title={selectedATM ? "Guardar Cambios" : "Crear ATM"}
        message="¿Estás seguro que deseas guardar los cambios?"
        confirmText="Guardar"
        type="info"
        isLoading={isCreating || isUpdating}
        error={selectedATM ? updateError : createError}
      />

      <ConfirmDialog
        isOpen={isConfirmMaintenanceOpen}
        onClose={() => {
          setIsConfirmMaintenanceOpen(false);
          setPendingMaintenance(undefined);
        }}
        onConfirm={handleConfirmMaintenance}
        title="Registrar Mantenimiento"
        message="¿Estás seguro que deseas registrar este mantenimiento?"
        confirmText="Registrar"
        type="warning"
        isLoading={isRegistering}
        error={maintenanceError}
      />
    </div>
  );
}
