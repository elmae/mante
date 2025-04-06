import React from "react";
import { cn } from "@/lib/utils";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { RetentionRule } from "@/types/retention";

interface RetentionRulesListProps {
  rules: RetentionRule[];
  onEdit?: (rule: RetentionRule) => void;
  onDelete?: (ruleId: string) => void;
  className?: string;
}

export function RetentionRulesList({
  rules,
  onEdit,
  onDelete,
  className,
}: RetentionRulesListProps) {
  const formatMimeType = (pattern: string): string => {
    switch (pattern) {
      case "^image/":
        return "Imágenes";
      case "^application/pdf$":
        return "PDF";
      case "^application/(msword|vnd\\.openxmlformats)":
        return "Documentos Word";
      case "^application/vnd\\.ms-excel":
        return "Excel";
      case "^text/":
        return "Texto plano";
      case ".*":
        return "Todos los archivos";
      default:
        return pattern;
    }
  };

  const formatParentType = (type: RetentionRule["parentType"]): string => {
    switch (type) {
      case "ticket":
        return "Tickets";
      case "maintenance":
        return "Mantenimientos";
      case "*":
        return "Todos";
      default:
        return type;
    }
  };

  if (rules.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        No hay reglas de retención configuradas.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg",
        className
      )}
    >
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Tipo de Archivo
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Aplicar a
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Estados
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Retención
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rules.map((rule) => (
            <tr key={rule.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                {formatMimeType(rule.mimeTypePattern)}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {formatParentType(rule.parentType)}
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                {rule.parentType === "*" ? (
                  "Todos"
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {rule.parentStatus.map((status) => (
                      <span
                        key={status}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize"
                      >
                        {status.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {rule.retentionDays} días
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(rule)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Editar</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(rule.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Eliminar</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
