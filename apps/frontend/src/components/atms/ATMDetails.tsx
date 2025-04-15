"use client";

import type { ATM } from "@/types/entities";

interface ATMDetailsProps {
  atm: ATM;
}

export function ATMDetails({ atm }: ATMDetailsProps) {
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
    <div className="space-y-6">
      {/* Información General */}
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Información General
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Código</dt>
            <dd className="mt-1 text-sm text-gray-900">{atm.code}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estado</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                  atm.status
                )}`}
              >
                {getStatusText(atm.status)}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Modelo</dt>
            <dd className="mt-1 text-sm text-gray-900">{atm.model}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Fabricante</dt>
            <dd className="mt-1 text-sm text-gray-900">{atm.manufacturer}</dd>
          </div>
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Ubicación
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Dirección</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {atm.location.address}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Zona</dt>
            <dd className="mt-1 text-sm text-gray-900">{atm.zone}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Coordenadas</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {atm.location.coordinates.latitude},{" "}
              {atm.location.coordinates.longitude}
            </dd>
          </div>
        </div>
      </div>

      {/* Mantenimiento */}
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Mantenimiento
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Fecha de Instalación
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(atm.installationDate).toLocaleDateString("es-DO")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Último Mantenimiento
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(atm.lastMaintenance).toLocaleDateString("es-DO")}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">
              Próximo Mantenimiento
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(atm.nextMaintenance).toLocaleDateString("es-DO")}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ATMDetails;
