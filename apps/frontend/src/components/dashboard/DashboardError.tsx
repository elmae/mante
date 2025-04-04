"use client";

import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface DashboardErrorProps {
  message?: string;
}

export function DashboardError({
  message = "Error al cargar los datos",
}: DashboardErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <ExclamationCircleIcon className="h-12 w-12 text-red-500" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        Ha ocurrido un error
      </h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}

export default DashboardError;
