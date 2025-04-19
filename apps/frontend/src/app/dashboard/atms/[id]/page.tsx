"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { atmService } from "@/services/api/atm";
import { ATM } from "@/types/entities";

interface AtmDetailPageProps {
  params: {
    id: string;
  };
}

export default function AtmDetailPage({ params }: AtmDetailPageProps) {
  const router = useRouter();
  const [atm, setAtm] = useState<ATM | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAtm = async () => {
      try {
        const data = await atmService.getATM(params.id);
        setAtm(data);
      } catch (err) {
        setError("Error al cargar el ATM");
        console.error("Error al cargar ATM:", err);
      }
    };

    fetchAtm();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("¿Está seguro que desea eliminar este ATM?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await atmService.deleteATM(params.id);
      router.push("/dashboard/atms");
    } catch (err) {
      setError("Error al eliminar el ATM");
      console.error("Error al eliminar ATM:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  if (!atm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ATM: {atm.serial}</h1>
        <div className="space-x-2">
          <button
            onClick={() => router.push(`/dashboard/atms/${params.id}/edit`)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Información General
            </h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Estado: </span>
                <span
                  className={`px-2 py-1 text-sm font-medium rounded-full ${
                    atm.status === "operational"
                      ? "bg-green-100 text-green-800"
                      : atm.status === "maintenance"
                      ? "bg-yellow-100 text-yellow-800"
                      : atm.status === "offline"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {atm.status === "operational"
                    ? "Operativo"
                    : atm.status === "maintenance"
                    ? "En Mantenimiento"
                    : atm.status === "offline"
                    ? "Fuera de Línea"
                    : "Error"}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Modelo: </span>
                <span>{atm.model}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Dirección: </span>
                <span>{atm.location.address}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Código: </span>
                <span>{atm.code}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Detalles Técnicos
            </h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Fabricante: </span>
                <span>{atm.manufacturer}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Fecha de instalación:{" "}
                </span>
                <span>
                  {new Date(atm.installationDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Último mantenimiento:{" "}
                </span>
                <span>
                  {new Date(atm.lastMaintenance).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Próximo mantenimiento:{" "}
                </span>
                <span>
                  {new Date(atm.nextMaintenance).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Zona: </span>
                <span>{atm.zone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ubicación
          </h2>
          <div className="bg-gray-100 p-4 rounded">
            <p className="text-gray-700 mb-2">Dirección:</p>
            <p className="mb-4 font-medium">{atm.location.address}</p>
            <p className="text-gray-700">Coordenadas:</p>
            <div className="mt-2 space-y-1">
              <p>
                <span className="font-medium">Latitud: </span>
                {atm.location.coordinates.latitude.toFixed(6)}
              </p>
              <p>
                <span className="font-medium">Longitud: </span>
                {atm.location.coordinates.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
