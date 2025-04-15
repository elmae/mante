import { type MaintenanceRecord } from "@/types/maintenance";

interface MaintenanceTableProps {
  records: MaintenanceRecord[];
  onView?: (record: MaintenanceRecord) => void;
  onEdit?: (record: MaintenanceRecord) => void;
  onDelete?: (record: MaintenanceRecord) => void;
}

export function MaintenanceTable({
  records,
  onView,
  onEdit,
  onDelete,
}: MaintenanceTableProps) {
  const statusColors = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const typeLabels = {
    preventive: "Preventivo",
    corrective: "Correctivo",
    installation: "Instalación",
  };

  const statusLabels = {
    completed: "Completado",
    pending: "Pendiente",
    in_progress: "En Progreso",
    cancelled: "Cancelado",
  };

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                >
                  Tipo
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
                  Descripción
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Próx. Mantenimiento
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                    {typeLabels[record.type]}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        statusColors[record.status]
                      }`}
                    >
                      {statusLabels[record.status]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {record.description}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(record.startDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {record.schedule?.nextDate
                      ? new Date(record.schedule.nextDate).toLocaleDateString()
                      : "No programado"}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                    <div className="flex justify-end gap-2">
                      {onView && (
                        <button
                          onClick={() => onView(record)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Ver
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(record)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Editar
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(record)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron registros de mantenimiento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
