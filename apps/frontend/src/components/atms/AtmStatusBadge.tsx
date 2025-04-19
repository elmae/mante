type AtmStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "ERROR";

interface AtmStatusBadgeProps {
  status: AtmStatus;
}

const statusColors = {
  ACTIVE:
    "bg-green-100 text-green-800 rounded-full px-2 py-1 text-sm font-medium",
  INACTIVE:
    "bg-gray-100 text-gray-800 rounded-full px-2 py-1 text-sm font-medium",
  MAINTENANCE:
    "bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 text-sm font-medium",
  ERROR: "bg-red-100 text-red-800 rounded-full px-2 py-1 text-sm font-medium",
};

export const AtmStatusBadge = ({ status }: AtmStatusBadgeProps) => {
  return <span className={statusColors[status]}>{status}</span>;
};

export default AtmStatusBadge;
