"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ATM } from "@/services/api/atm";

const maintenanceSchema = z.object({
  type: z.enum(["preventive", "corrective"], {
    required_error: "Seleccione el tipo de mantenimiento",
  }),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres"),
  findings: z
    .string()
    .min(10, "Los hallazgos deben tener al menos 10 caracteres")
    .max(500, "Los hallazgos no pueden exceder 500 caracteres"),
  actions: z
    .string()
    .min(10, "Las acciones deben tener al menos 10 caracteres")
    .max(500, "Las acciones no pueden exceder 500 caracteres"),
  recommendations: z
    .string()
    .min(10, "Las recomendaciones deben tener al menos 10 caracteres")
    .max(500, "Las recomendaciones no pueden exceder 500 caracteres"),
  nextMaintenanceDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
  status: z.enum(["completed", "pending", "in_progress"], {
    required_error: "Seleccione el estado del mantenimiento",
  }),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface MaintenanceFormProps {
  atm: ATM;
  onSubmit: (data: MaintenanceFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function MaintenanceForm({
  atm,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: MaintenanceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      type: "preventive",
      status: "completed",
      nextMaintenanceDate: (() => {
        const date = new Date();
        date.setMonth(date.getMonth() + 3);
        return date.toISOString().split("T")[0];
      })(),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-sm font-medium text-gray-500">ATM: {atm.code}</h3>
        <p className="mt-1 text-sm text-gray-500">
          Ubicación: {atm.location.address}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
        {/* Tipo de Mantenimiento */}
        <div className="sm:col-span-2">
          <label
            htmlFor="type"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Tipo de Mantenimiento
          </label>
          <div className="mt-2">
            <select
              id="type"
              {...register("type")}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            >
              <option value="preventive">Preventivo</option>
              <option value="corrective">Correctivo</option>
            </select>
            {errors.type && (
              <p className="mt-2 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>
        </div>

        {/* Descripción */}
        <div className="sm:col-span-2">
          <label
            htmlFor="description"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Descripción
          </label>
          <div className="mt-2">
            <textarea
              id="description"
              rows={3}
              {...register("description")}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              placeholder="Describa el mantenimiento realizado"
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Hallazgos */}
        <div className="sm:col-span-2">
          <label
            htmlFor="findings"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Hallazgos
          </label>
          <div className="mt-2">
            <textarea
              id="findings"
              rows={3}
              {...register("findings")}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              placeholder="Describa los hallazgos encontrados"
            />
            {errors.findings && (
              <p className="mt-2 text-sm text-red-600">
                {errors.findings.message}
              </p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="sm:col-span-2">
          <label
            htmlFor="actions"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Acciones Realizadas
          </label>
          <div className="mt-2">
            <textarea
              id="actions"
              rows={3}
              {...register("actions")}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              placeholder="Describa las acciones realizadas"
            />
            {errors.actions && (
              <p className="mt-2 text-sm text-red-600">
                {errors.actions.message}
              </p>
            )}
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="sm:col-span-2">
          <label
            htmlFor="recommendations"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Recomendaciones
          </label>
          <div className="mt-2">
            <textarea
              id="recommendations"
              rows={3}
              {...register("recommendations")}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              placeholder="Ingrese recomendaciones para futuros mantenimientos"
            />
            {errors.recommendations && (
              <p className="mt-2 text-sm text-red-600">
                {errors.recommendations.message}
              </p>
            )}
          </div>
        </div>

        {/* Estado */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Estado
          </label>
          <div className="mt-2">
            <select
              id="status"
              {...register("status")}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            >
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En Progreso</option>
            </select>
            {errors.status && (
              <p className="mt-2 text-sm text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        {/* Próximo Mantenimiento */}
        <div>
          <label
            htmlFor="nextMaintenanceDate"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Próximo Mantenimiento
          </label>
          <div className="mt-2">
            <input
              type="date"
              id="nextMaintenanceDate"
              {...register("nextMaintenanceDate")}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            />
            {errors.nextMaintenanceDate && (
              <p className="mt-2 text-sm text-red-600">
                {errors.nextMaintenanceDate.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="mt-6 flex justify-end gap-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}

export default MaintenanceForm;
