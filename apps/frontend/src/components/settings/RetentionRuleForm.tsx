import React from "react";
import { cn } from "@/lib/utils";
import { NewRetentionRule, RetentionRule } from "@/types/retention";

interface RetentionRuleFormProps {
  onSubmit: (rule: NewRetentionRule) => void;
  initialValues?: RetentionRule;
  className?: string;
}

const DEFAULT_STATUS_OPTIONS = {
  ticket: ["open", "in_progress", "closed", "resolved"],
  maintenance: ["pending", "in_progress", "completed"],
};

export function RetentionRuleForm({
  onSubmit,
  initialValues,
  className,
}: RetentionRuleFormProps) {
  const [rule, setRule] = React.useState<NewRetentionRule>(
    initialValues || {
      mimeTypePattern: "^image/",
      parentType: "ticket",
      parentStatus: ["closed", "resolved"],
      retentionDays: 90,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rule);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Tipo de Archivo */}
      <div>
        <label
          htmlFor="mimeTypePattern"
          className="block text-sm font-medium text-gray-700"
        >
          Tipo de Archivo
        </label>
        <select
          id="mimeTypePattern"
          value={rule.mimeTypePattern}
          onChange={(e) =>
            setRule({ ...rule, mimeTypePattern: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="^image/">Imágenes</option>
          <option value="^application/pdf$">PDF</option>
          <option value="^application/(msword|vnd\.openxmlformats)">
            Documentos Word
          </option>
          <option value="^application/vnd\.ms-excel">Excel</option>
          <option value="^text/">Texto plano</option>
          <option value=".*">Todos los archivos</option>
        </select>
      </div>

      {/* Tipo de Padre */}
      <div>
        <label
          htmlFor="parentType"
          className="block text-sm font-medium text-gray-700"
        >
          Aplicar a
        </label>
        <select
          id="parentType"
          value={rule.parentType}
          onChange={(e) =>
            setRule({
              ...rule,
              parentType: e.target.value as RetentionRule["parentType"],
              parentStatus: [],
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="ticket">Tickets</option>
          <option value="maintenance">Mantenimientos</option>
          <option value="*">Todos</option>
        </select>
      </div>

      {/* Estados */}
      {rule.parentType !== "*" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estados
          </label>
          <div className="mt-2 space-y-2">
            {DEFAULT_STATUS_OPTIONS[rule.parentType].map((status) => (
              <label key={status} className="inline-flex items-center mr-4">
                <input
                  type="checkbox"
                  checked={rule.parentStatus.includes(status)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRule({
                        ...rule,
                        parentStatus: [...rule.parentStatus, status],
                      });
                    } else {
                      setRule({
                        ...rule,
                        parentStatus: rule.parentStatus.filter(
                          (s) => s !== status
                        ),
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600 capitalize">
                  {status.replace("_", " ")}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Días de Retención */}
      <div>
        <label
          htmlFor="retentionDays"
          className="block text-sm font-medium text-gray-700"
        >
          Días de Retención
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            id="retentionDays"
            min={1}
            value={rule.retentionDays}
            onChange={(e) =>
              setRule({ ...rule, retentionDays: parseInt(e.target.value) })
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
            días
          </span>
        </div>
      </div>

      {/* Botón Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Guardar Regla
        </button>
      </div>
    </form>
  );
}
