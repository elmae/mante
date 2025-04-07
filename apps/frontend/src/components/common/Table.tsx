import React from "react";
import { cn } from "@/lib/utils";

export type ColumnAccessor<T> = {
  [K in keyof T]: T[K] extends
    | string
    | number
    | boolean
    | Date
    | null
    | undefined
    ? K
    : never;
}[keyof T];

export interface Column<T> {
  header: string;
  accessor: ColumnAccessor<T>;
  cell?: (value: T[ColumnAccessor<T>], row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  className,
  emptyMessage = "No hay datos disponibles",
}: TableProps<T>) {
  if (!data.length) {
    return <div className="text-center py-8 text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className={cn("overflow-x-auto rounded-lg shadow", className)}>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={cn(
                  "py-3.5 px-3 text-left text-sm font-semibold text-gray-900",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column, colIndex) => {
                const value = row[column.accessor];
                return (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className={cn(
                      "whitespace-nowrap py-4 px-3 text-sm text-gray-500",
                      column.className
                    )}
                  >
                    {column.cell
                      ? column.cell(value as T[ColumnAccessor<T>], row)
                      : value != null
                      ? String(value)
                      : "-"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
