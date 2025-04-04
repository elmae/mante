"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ATM } from "@/services/api/atm";

const atmSchema = z.object({
  code: z
    .string()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(50, "El código no puede exceder 50 caracteres"),
  model: z.string().min(2, "El modelo debe tener al menos 2 caracteres"),
  manufacturer: z
    .string()
    .min(2, "El fabricante debe tener al menos 2 caracteres"),
  location: z.object({
    address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
    coordinates: z.object({
      latitude: z
        .number()
        .min(-90, "Latitud debe estar entre -90 y 90")
        .max(90, "Latitud debe estar entre -90 y 90"),
      longitude: z
        .number()
        .min(-180, "Longitud debe estar entre -180 y 180")
        .max(180, "Longitud debe estar entre -180 y 180"),
    }),
  }),
  zone: z.string().min(2, "La zona debe tener al menos 2 caracteres"),
  status: z
    .enum(["operational", "maintenance", "offline", "error"])
    .default("operational"),
  installationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
  lastMaintenance: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)")
    .default(() => new Date().toISOString().split("T")[0]),
  nextMaintenance: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)")
    .default(() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date.toISOString().split("T")[0];
    }),
});

type ATMFormData = z.infer<typeof atmSchema>;

interface ATMFormProps {
  atm?: ATM;
  onSubmit: (data: Omit<ATM, "id">) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ATMForm({
  atm,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ATMFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ATMFormData>({
    resolver: zodResolver(atmSchema),
    defaultValues: atm
      ? {
          code: atm.code,
          model: atm.model,
          manufacturer: atm.manufacturer,
          location: atm.location,
          zone: atm.zone,
          status: atm.status,
          installationDate: atm.installationDate,
          lastMaintenance: atm.lastMaintenance,
          nextMaintenance: atm.nextMaintenance,
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
        {/* Código */}
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

        {/* Modelo */}
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
              <p className="mt-2 text-sm text-red-600">
                {errors.model.message}
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
              <option value="operational">Operativo</option>
              <option value="maintenance">En mantenimiento</option>
              <option value="offline">Fuera de línea</option>
              <option value="error">Error</option>
            </select>
            {errors.status && (
              <p className="mt-2 text-sm text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        {/* Fabricante */}
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

        {/* Dirección */}
        <div className="sm:col-span-2">
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

        {/* Coordenadas */}
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
              step="any"
              id="latitude"
              {...register("location.coordinates.latitude", {
                valueAsNumber: true,
              })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            />
            {errors.location?.coordinates?.latitude && (
              <p className="mt-2 text-sm text-red-600">
                {errors.location.coordinates.latitude.message}
              </p>
            )}
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
              step="any"
              id="longitude"
              {...register("location.coordinates.longitude", {
                valueAsNumber: true,
              })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            />
            {errors.location?.coordinates?.longitude && (
              <p className="mt-2 text-sm text-red-600">
                {errors.location.coordinates.longitude.message}
              </p>
            )}
          </div>
        </div>

        {/* Zona */}
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

        {/* Fecha de Instalación */}
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

        {/* Último Mantenimiento */}
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

        {/* Próximo Mantenimiento */}
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

export default ATMForm;
