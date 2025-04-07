"use client";

import { MaintenanceList } from "@/components/maintenance/MaintenanceList";

export default function MaintenancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gestión de Mantenimiento
            </h1>
            <p className="text-gray-600">
              Administra y da seguimiento a los mantenimientos de ATMs
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Nuevo Mantenimiento
            </button>
          </div>
        </div>
      </div>

      <MaintenanceList />
    </div>
  );
}
