import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ATM } from "@/types/entities";
import type { CreateMaintenanceRecord } from "@/types/maintenance";

const maintenanceSchema = z.object({
  atmId: z.string(),
  type: z.enum(["preventive", "corrective"] as const, {
    required_error: "El tipo de mantenimiento es requerido",
  }),
  description: z.string().min(1, "La descripción es requerida"),
  findings: z.string().min(1, "Los hallazgos son requeridos"),
  recommendations: z.string().optional(),
  status: z.enum(["completed", "pending", "in_progress"] as const, {
    required_error: "El estado es requerido",
  }),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface MaintenanceFormProps {
  atm: ATM;
  onSubmit: (data: CreateMaintenanceRecord) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  } | null;
}

export function MaintenanceForm({
  atm,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = null,
}: MaintenanceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      atmId: atm.id,
      type: "preventive",
      description: "",
      findings: "",
      recommendations: "",
      status: "pending",
      startDate: new Date().toISOString().split("T")[0],
    },
  });

  const handleFormSubmit = handleSubmit((data) => {
    const formData: CreateMaintenanceRecord = {
      ...data,
      atmId: atm.id,
      recommendations: data.recommendations || "",
    };
    onSubmit(formData);
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Información del ATM */}
      <div className="rounded-md bg-gray-50 p-4">
        <h4 className="text-sm font-medium text-gray-900">
          Información del ATM
        </h4>
        <dl className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Código</dt>
            <dd className="text-sm text-gray-900">{atm.code}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Modelo</dt>
            <dd className="text-sm text-gray-900">{atm.model}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Ubicación</dt>
            <dd className="text-sm text-gray-900">{atm.location.address}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Estado</dt>
            <dd className="text-sm text-gray-900">{atm.status}</dd>
          </div>
        </dl>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error {error.code && `(${error.code})`}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
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

      <div>
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
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      <div>
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
          />
          {errors.findings && (
            <p className="mt-2 text-sm text-red-600">
              {errors.findings.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="startDate"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Fecha de Inicio
        </label>
        <div className="mt-2">
          <input
            type="date"
            id="startDate"
            {...register("startDate")}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
          />
          {errors.startDate && (
            <p className="mt-2 text-sm text-red-600">
              {errors.startDate.message}
            </p>
          )}
        </div>
      </div>

      <div>
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
          />
          {errors.recommendations && (
            <p className="mt-2 text-sm text-red-600">
              {errors.recommendations.message}
            </p>
          )}
        </div>
      </div>

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
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completado</option>
          </select>
          {errors.status && (
            <p className="mt-2 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Registrando..." : "Registrar Mantenimiento"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
