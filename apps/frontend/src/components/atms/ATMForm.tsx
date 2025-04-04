import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ATM } from "@/services/api/atm";

const atmSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  model: z.string().min(1, "El modelo es requerido"),
  location: z.object({
    address: z.string().min(1, "La dirección es requerida"),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }),
  status: z
    .enum(["operational", "maintenance", "offline", "error"])
    .default("operational"),
  lastMaintenance: z
    .string()
    .min(1, "La fecha del último mantenimiento es requerida"),
  nextMaintenance: z
    .string()
    .min(1, "La fecha del próximo mantenimiento es requerida"),
  manufacturer: z.string().min(1, "El fabricante es requerido"),
  installationDate: z.string().min(1, "La fecha de instalación es requerida"),
  zone: z.string().min(1, "La zona es requerida"),
});

type ATMFormData = z.infer<typeof atmSchema>;

interface ATMFormProps {
  atm?: ATM;
  onSubmit: (data: Omit<ATM, "id">) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  } | null;
}

export function ATMForm({
  atm,
  onSubmit,
  onCancel,
  isSubmitting = false,
  error = null,
}: ATMFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ATMFormData>({
    resolver: zodResolver(atmSchema),
    defaultValues: atm || {
      code: "",
      model: "",
      location: {
        address: "",
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
      },
      status: "operational",
      lastMaintenance: new Date().toISOString().split("T")[0], // Fecha actual como valor por defecto
      nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 30 días después como valor por defecto
      manufacturer: "",
      installationDate: "",
      zone: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          htmlFor="code"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Código
        </label>
        <div className="mt-2">
          <input
            type="text"
            id="code"
            {...register("code")}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
          />
          {errors.code && (
            <p className="mt-2 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="model"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Modelo
        </label>
        <div className="mt-2">
          <input
            type="text"
            id="model"
            {...register("model")}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
          />
          {errors.model && (
            <p className="mt-2 text-sm text-red-600">{errors.model.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Dirección
        </label>
        <div className="mt-2">
          <input
            type="text"
            id="address"
            {...register("location.address")}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
          />
          {errors.location?.address && (
            <p className="mt-2 text-sm text-red-600">
              {errors.location.address.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="latitude"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Latitud
          </label>
          <div className="mt-2">
            <input
              type="number"
              id="latitude"
              step="any"
              {...register("location.coordinates.latitude", {
                valueAsNumber: true,
              })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="longitude"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Longitud
          </label>
          <div className="mt-2">
            <input
              type="number"
              id="longitude"
              step="any"
              {...register("location.coordinates.longitude", {
                valueAsNumber: true,
              })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            />
          </div>
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
            <option value="operational">Operativo</option>
            <option value="maintenance">En Mantenimiento</option>
            <option value="offline">Fuera de Línea</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="lastMaintenance"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Último Mantenimiento
          </label>
          <div className="mt-2">
            <input
              type="date"
              id="lastMaintenance"
              {...register("lastMaintenance")}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            />
            {errors.lastMaintenance && (
              <p className="mt-2 text-sm text-red-600">
                {errors.lastMaintenance.message}
              </p>
            )}
          </div>
        </div>
        <div>
          <label
            htmlFor="nextMaintenance"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Próximo Mantenimiento
          </label>
          <div className="mt-2">
            <input
              type="date"
              id="nextMaintenance"
              {...register("nextMaintenance")}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            />
            {errors.nextMaintenance && (
              <p className="mt-2 text-sm text-red-600">
                {errors.nextMaintenance.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="manufacturer"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Fabricante
        </label>
        <div className="mt-2">
          <input
            type="text"
            id="manufacturer"
            {...register("manufacturer")}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
          />
          {errors.manufacturer && (
            <p className="mt-2 text-sm text-red-600">
              {errors.manufacturer.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="installationDate"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Fecha de Instalación
        </label>
        <div className="mt-2">
          <input
            type="date"
            id="installationDate"
            {...register("installationDate")}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
          />
          {errors.installationDate && (
            <p className="mt-2 text-sm text-red-600">
              {errors.installationDate.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="zone"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Zona
        </label>
        <div className="mt-2">
          <input
            type="text"
            id="zone"
            {...register("zone")}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
          />
          {errors.zone && (
            <p className="mt-2 text-sm text-red-600">{errors.zone.message}</p>
          )}
        </div>
      </div>

      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Guardando..." : "Guardar"}
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
