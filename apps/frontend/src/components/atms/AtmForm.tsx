import { useState, useEffect } from "react";
import { ATM } from "@/types/entities";

interface AtmFormProps {
  onSubmit: (data: Omit<ATM, "id">) => Promise<void>;
  isLoading?: boolean;
  onCancel: () => void;
  initialData?: ATM;
}

type FormData = Omit<ATM, "id">;

export const AtmForm = ({
  onSubmit,
  isLoading = false,
  onCancel,
  initialData,
}: AtmFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    serial: "",
    model: "",
    manufacturer: "",
    location: {
      address: "",
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
    code: "",
    zone: "",
    status: "operational",
    lastMaintenance: new Date().toISOString().split("T")[0],
    nextMaintenance: new Date().toISOString().split("T")[0],
    installationDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (initialData) {
      const formattedData: FormData = {
        serial: initialData.serial,
        model: initialData.model,
        manufacturer: initialData.manufacturer,
        location: initialData.location,
        code: initialData.code,
        zone: initialData.zone,
        status: initialData.status,
        lastMaintenance: new Date(initialData.lastMaintenance)
          .toISOString()
          .split("T")[0],
        nextMaintenance: new Date(initialData.nextMaintenance)
          .toISOString()
          .split("T")[0],
        installationDate: new Date(initialData.installationDate)
          .toISOString()
          .split("T")[0],
      };
      setFormData(formattedData);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FormData],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Serial
          </label>
          <input
            type="text"
            name="serial"
            value={formData.serial}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Modelo
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fabricante
          </label>
          <input
            type="text"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Código
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Zona
          </label>
          <input
            type="text"
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Dirección
          </label>
          <input
            type="text"
            name="location.address"
            value={formData.location.address}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Fecha de Instalación
          </label>
          <input
            type="date"
            name="installationDate"
            value={formData.installationDate}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Último Mantenimiento
          </label>
          <input
            type="date"
            name="lastMaintenance"
            value={formData.lastMaintenance}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Próximo Mantenimiento
          </label>
          <input
            type="date"
            name="nextMaintenance"
            value={formData.nextMaintenance}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
        >
          {isLoading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default AtmForm;
