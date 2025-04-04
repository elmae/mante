"use client";

import { useState } from "react";
import { useATMs } from "@/hooks/useATMs";
import { ATMFilters } from "@/components/atms/ATMFilters";
import { ATMTable } from "@/components/atms/ATMTable";
import { ATMForm } from "@/components/atms/ATMForm";
import { ATMDetails } from "@/components/atms/ATMDetails";
import { Modal } from "@/components/common/Modal";
import { Pagination } from "@/components/common/Pagination";
import type { ATM } from "@/services/api/atm";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardError } from "@/components/dashboard/DashboardError";

export default function ATMsPage() {
  // Estado de modales y ATM seleccionado
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedATM, setSelectedATM] = useState<ATM | undefined>();

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
  } = useATMs({ limit: 10 });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <DashboardError message="Error al cargar los ATMs" />;
  }

  const handleView = (atm: ATM) => {
    setSelectedATM(atm);
    setIsDetailsOpen(true);
  };

  const handleEdit = (atm: ATM) => {
    setSelectedATM(atm);
    setIsFormOpen(true);
  };

  const handleDelete = async (atm: ATM) => {
    if (
      window.confirm(`¿Estás seguro que deseas eliminar el ATM ${atm.code}?`)
    ) {
      try {
        await deleteATM(atm.id);
      } catch (error) {
        console.error("Error al eliminar ATM:", error);
        alert("No se pudo eliminar el ATM. Por favor, inténtelo de nuevo.");
      }
    }
  };

  const handleMaintenance = (atm: ATM) => {
    // TODO: Implementar registro de mantenimiento
    console.log("Mantenimiento ATM:", atm);
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
          onSubmit={async (data) => {
            try {
              if (selectedATM) {
                await updateATM({ id: selectedATM.id, data });
              } else {
                await createATM(data);
              }
              setIsFormOpen(false);
              setSelectedATM(undefined);
            } catch (error) {
              console.error("Error al guardar ATM:", error);
              alert(
                "No se pudo guardar el ATM. Por favor, inténtelo de nuevo."
              );
            }
          }}
          onCancel={() => {
            setIsFormOpen(false);
            setSelectedATM(undefined);
          }}
          isSubmitting={isCreating || isUpdating}
        />
      </Modal>
    </div>
  );
}
