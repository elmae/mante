"use client";

import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import type { ATM } from "@/services/api/atm";

interface ATMTableProps {
  atms: ATM[];
  onView: (atm: ATM) => void;
  onEdit: (atm: ATM) => void;
  onDelete: (atm: ATM) => void;
  onMaintenance: (atm: ATM) => void;
}

export function ATMTable({
  atms,
  onView,
  onEdit,
  onDelete,
  onMaintenance,
}: ATMTableProps) {
  const getStatusColor = (status: ATM["status"]) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: ATM["status"]) => {
    switch (status) {
      case "operational":
        return "Operativo";
      case "maintenance":
        return "En mantenimiento";
      case "offline":
        return "Fuera de línea";
      case "error":
        return "Error";
      default:
        return status;
    }
  };

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Código
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Ubicación
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Estado
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Último Mantenimiento
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Próximo Mantenimiento
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {atms.map((atm) => (
            <tr key={atm.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {atm.code}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {atm.location.address}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                    atm.status
                  )}`}
                >
                  {getStatusText(atm.status)}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {new Date(atm.lastMaintenance).toLocaleDateString("es-DO")}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {new Date(atm.nextMaintenance).toLocaleDateString("es-DO")}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onView(atm)}
                    className="text-primary-600 hover:text-primary-900"
                    title="Ver detalles"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEdit(atm)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onMaintenance(atm)}
                    className="text-yellow-600 hover:text-yellow-900"
                    title="Registrar mantenimiento"
                  >
                    <WrenchScrewdriverIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(atm)}
                    className="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ATMTable;
