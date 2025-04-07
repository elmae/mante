import React from "react";
import { useSecurity } from "@/hooks/useSecurity";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { useForm } from "react-hook-form";
import type {
  ApiScope,
  CreateApiKeyRequest,
  ApiKeyResponse,
} from "@/types/security";
import { toast } from "sonner";

const API_SCOPES: Array<{ label: string; value: ApiScope }> = [
  { label: "Leer perfil", value: "read:profile" },
  { label: "Modificar perfil", value: "write:profile" },
  { label: "Leer tickets", value: "read:tickets" },
  { label: "Modificar tickets", value: "write:tickets" },
  { label: "Leer ATMs", value: "read:atms" },
  { label: "Modificar ATMs", value: "write:atms" },
  { label: "Leer mantenimientos", value: "read:maintenance" },
  { label: "Modificar mantenimientos", value: "write:maintenance" },
];

interface ApiKeyForm extends Omit<CreateApiKeyRequest, "scopes"> {
  scopes: string[];
  expiresInDays?: string;
}

export function ApiKeyManager() {
  const {
    apiKeys,
    isLoadingApiKeys,
    createApiKey,
    revokeApiKey,
    isCreatingApiKey,
    isRevokingApiKey,
  } = useSecurity();

  const [showNewKeyForm, setShowNewKeyForm] = React.useState(false);
  const [newKeyDetails, setNewKeyDetails] = React.useState<{
    key: string;
    prefix: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApiKeyForm>({
    defaultValues: {
      name: "",
      scopes: [],
      expiresInDays: "30",
    },
  });

  const handleCreateKey = handleSubmit(async (data) => {
    try {
      const expiresAt = data.expiresInDays
        ? new Date(
            Date.now() + parseInt(data.expiresInDays) * 24 * 60 * 60 * 1000
          ).toISOString()
        : undefined;

      const result: ApiKeyResponse = await createApiKey({
        name: data.name,
        scopes: data.scopes as ApiScope[],
        expiresAt,
      });

      setNewKeyDetails({
        key: result.token,
        prefix: result.key.prefix,
      });
      reset();
      setShowNewKeyForm(false);
    } catch {
      // Error ya manejado por el hook
    }
  });

  const handleRevokeKey = async (keyId: string) => {
    const confirm = window.confirm(
      "¿Estás seguro de que quieres revocar esta API key? Esta acción no se puede deshacer."
    );
    if (!confirm) return;
    await revokeApiKey(keyId);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona las API keys para acceder a la API programáticamente
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setShowNewKeyForm(true)}>Crear API Key</Button>
        </div>
      </div>

      {/* Modal de nueva key */}
      {showNewKeyForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Crear nueva API Key
            </h3>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <Input
                label="Nombre"
                {...register("name", {
                  required: "El nombre es requerido",
                  minLength: {
                    value: 3,
                    message: "El nombre debe tener al menos 3 caracteres",
                  },
                })}
                error={errors.name?.message}
                placeholder="ej. Integración con CRM"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permisos
                </label>
                <div className="space-y-2">
                  {API_SCOPES.map((scope) => (
                    <label
                      key={scope.value}
                      className="inline-flex items-center mr-4"
                    >
                      <input
                        type="checkbox"
                        value={scope.value}
                        {...register("scopes", {
                          required: "Selecciona al menos un permiso",
                        })}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {scope.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.scopes && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.scopes.message}
                  </p>
                )}
              </div>

              <Select
                label="Expira en"
                {...register("expiresInDays")}
                options={[
                  { label: "7 días", value: "7" },
                  { label: "30 días", value: "30" },
                  { label: "90 días", value: "90" },
                  { label: "No expira", value: "" },
                ]}
              />

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewKeyForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={isCreatingApiKey}>
                  Crear API Key
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de nueva key creada */}
      {newKeyDetails && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              API Key Creada
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Guarda esta API key en un lugar seguro. No podrás verla de nuevo.
            </p>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4 break-all">
              {newKeyDetails.key}
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(newKeyDetails.key);
                  toast.success("API key copiada al portapapeles");
                }}
              >
                Copiar
              </Button>
              <Button onClick={() => setNewKeyDetails(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de API keys */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoadingApiKeys ? (
          <div className="p-4 text-center text-gray-500">
            Cargando API keys...
          </div>
        ) : !apiKeys?.length ? (
          <div className="p-4 text-center text-gray-500">
            No hay API keys creadas
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {apiKeys.map((key) => (
              <li key={key.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium text-gray-900">
                      {key.name}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Prefijo: {key.prefix} •{" "}
                      {key.expiresAt
                        ? `Expira: ${formatDate(key.expiresAt)}`
                        : "No expira"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {key.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeKey(key.id)}
                      loading={isRevokingApiKey}
                    >
                      Revocar
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
