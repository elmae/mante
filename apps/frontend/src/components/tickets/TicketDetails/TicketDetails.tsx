import { Ticket, TicketPriority, TicketStatus } from "@/types/entities";
import { formatDate } from "@/utils/date";
import { Comments } from "./Comments";

interface TicketDetailsProps {
  ticket: Ticket | null;
  isLoading?: boolean;
  currentUser?: {
    id: string;
    email: string;
    name: string;
  };
}

const getStatusColor = (status: TicketStatus): string => {
  const colors: Record<TicketStatus, string> = {
    [TicketStatus.OPEN]: "bg-yellow-500",
    [TicketStatus.ASSIGNED]: "bg-blue-500",
    [TicketStatus.IN_PROGRESS]: "bg-purple-500",
    [TicketStatus.RESOLVED]: "bg-green-500",
    [TicketStatus.CLOSED]: "bg-gray-500",
  };
  return colors[status];
};

const getPriorityColor = (priority: TicketPriority): string => {
  const colors: Record<TicketPriority, string> = {
    [TicketPriority.LOW]: "bg-blue-500",
    [TicketPriority.MEDIUM]: "bg-yellow-500",
    [TicketPriority.HIGH]: "bg-orange-500",
    [TicketPriority.CRITICAL]: "bg-red-500",
  };
  return colors[priority];
};

export const TicketDetails = ({
  ticket,
  isLoading,
  currentUser,
}: TicketDetailsProps) => {
  if (isLoading) {
    return (
      <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Ticket no encontrado</h2>
        <p className="text-gray-600 dark:text-gray-300">
          El ticket solicitado no existe o no tienes permisos para verlo
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-1">{ticket.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Ticket #{ticket.id}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getPriorityColor(
                ticket.priority
              )}`}
            >
              {ticket.priority.toUpperCase()}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(
                ticket.status
              )}`}
            >
              {ticket.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Descripción */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Descripción</h3>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* Detalles del ATM */}
        {ticket.atm && (
          <div>
            <h3 className="text-lg font-semibold mb-2">ATM</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="font-medium">Serial: {ticket.atm.serial}</p>
              <p className="text-gray-600 dark:text-gray-300">
                Modelo: {ticket.atm.model}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Ubicación: {ticket.atm.location}
              </p>
            </div>
          </div>
        )}

        {/* Asignación y Fechas */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Asignación</h3>
            {ticket.assignedTo ? (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-lg font-medium">
                    {ticket.assignedTo.name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{ticket.assignedTo.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {ticket.assignedTo.email}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">Sin asignar</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Fechas</h3>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="font-medium">Creado:</span>{" "}
                {formatDate(ticket.created_at)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Actualizado:</span>{" "}
                {formatDate(ticket.updated_at)}
              </p>
              {ticket.due_date && (
                <p className="text-sm">
                  <span className="font-medium">Fecha límite:</span>{" "}
                  {formatDate(ticket.due_date)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Métricas SLA */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Métricas</h3>
          <span
            className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
              ticket.met_sla ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {ticket.met_sla ? "Cumple SLA" : "No cumple SLA"}
          </span>
        </div>

        {/* Comentarios */}
        <Comments ticketId={ticket.id} currentUser={currentUser} />
      </div>
    </div>
  );
};
