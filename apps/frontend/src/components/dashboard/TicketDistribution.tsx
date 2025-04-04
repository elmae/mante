"use client";

interface TicketStatus {
  name: string;
  count: number;
  color: string;
}

interface TicketDistributionProps {
  data: TicketStatus[];
  total: number;
}

export function TicketDistribution({ data, total }: TicketDistributionProps) {
  return (
    <div className="space-y-4">
      {data.map((status) => (
        <div key={status.name} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">{status.name}</span>
            <span className="text-gray-500">
              {status.count} ({Math.round((status.count / total) * 100)}%)
            </span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${status.color}`}
              style={{ width: `${(status.count / total) * 100}%` }}
            />
          </div>
        </div>
      ))}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Total de Tickets</span>
          <span className="font-medium text-gray-900">{total}</span>
        </div>
      </div>
    </div>
  );
}

export default TicketDistribution;
