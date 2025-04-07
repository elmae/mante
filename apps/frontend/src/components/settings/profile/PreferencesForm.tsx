import React from "react";
import { useProfile } from "@/hooks/useProfile";
import { Select, type SelectOption } from "@/components/common/Select";
import { Switch } from "@/components/common/Switch";
import { Button } from "@/components/common/Button";
import { toast } from "sonner";
import type { DeepPartial, UserPreferences } from "@/types/user";

const THEME_OPTIONS: SelectOption[] = [
  { label: "Claro", value: "light" },
  { label: "Oscuro", value: "dark" },
  { label: "Sistema", value: "system" },
];

const LANGUAGE_OPTIONS: SelectOption[] = [
  { label: "Español", value: "es" },
  { label: "English", value: "en" },
];

const NOTIFICATION_LEVELS: SelectOption[] = [
  { label: "Todas", value: "all" },
  { label: "Importantes", value: "important" },
  { label: "Ninguna", value: "none" },
];

const DASHBOARD_VIEWS: SelectOption[] = [
  { label: "Tickets", value: "tickets" },
  { label: "Mantenimiento", value: "maintenance" },
  { label: "ATMs", value: "atms" },
];

const REFRESH_INTERVALS: SelectOption[] = [
  { label: "1 minuto", value: "1" },
  { label: "5 minutos", value: "5" },
  { label: "10 minutos", value: "10" },
  { label: "30 minutos", value: "30" },
];

export function PreferencesForm() {
  const { profile, isUpdatingPreferences, updatePreferences } = useProfile();
  const preferences = profile?.preferences;

  const [formState, setFormState] = React.useState<
    DeepPartial<UserPreferences>
  >(
    preferences || {
      theme: "system",
      language: "es",
      notifications: {
        email: true,
        push: true,
        desktop: true,
        categories: {
          tickets: { enabled: true, level: "all", methods: ["email", "push"] },
          maintenance: {
            enabled: true,
            level: "important",
            methods: ["email"],
          },
          atms: {
            enabled: true,
            level: "important",
            methods: ["email", "push"],
          },
          system: {
            enabled: true,
            level: "all",
            methods: ["email", "desktop"],
          },
        },
      },
      dashboard: {
        showStats: true,
        defaultView: "tickets",
        refreshInterval: 5,
      },
    }
  );

  type NestedObject = {
    [key: string]: NestedObject | unknown;
  };

  const updateNestedValue = (path: string[], value: unknown) => {
    setFormState((prev) => {
      const newState = { ...prev };
      let current: NestedObject = newState;

      for (let i = 0; i < path.length - 1; i++) {
        if (!(path[i] in current)) {
          current[path[i]] = {};
        }
        current = current[path[i]] as NestedObject;
      }

      current[path[path.length - 1]] = value;
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePreferences(formState);
      toast.success("Preferencias actualizadas exitosamente");
    } catch {
      // Error ya manejado por el hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Preferencias
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Personaliza tu experiencia en la plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Tema */}
        <Select
          label="Tema"
          value={formState.theme || "system"}
          onChange={(value) => updateNestedValue(["theme"], value)}
          options={THEME_OPTIONS}
        />

        {/* Idioma */}
        <Select
          label="Idioma"
          value={formState.language || "es"}
          onChange={(value) => updateNestedValue(["language"], value)}
          options={LANGUAGE_OPTIONS}
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Notificaciones</h4>

        {/* Métodos de notificación */}
        <div className="space-y-2">
          <Switch
            label="Email"
            checked={formState.notifications?.email || false}
            onChange={(checked) =>
              updateNestedValue(["notifications", "email"], checked)
            }
          />
          <Switch
            label="Notificaciones Push"
            checked={formState.notifications?.push || false}
            onChange={(checked) =>
              updateNestedValue(["notifications", "push"], checked)
            }
          />
          <Switch
            label="Notificaciones de Escritorio"
            checked={formState.notifications?.desktop || false}
            onChange={(checked) =>
              updateNestedValue(["notifications", "desktop"], checked)
            }
          />
        </div>

        {/* Categorías de notificaciones */}
        <div className="space-y-4 mt-4">
          <h5 className="text-sm font-medium text-gray-700">
            Categorías de Notificaciones
          </h5>

          {Object.entries(formState.notifications?.categories || {}).map(
            ([category, settings]) => (
              <div
                key={category}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h6 className="text-sm font-medium text-gray-900 capitalize mb-2">
                  {category}
                </h6>
                <div className="space-y-2">
                  <Switch
                    label="Activado"
                    checked={settings?.enabled || false}
                    onChange={(checked) =>
                      updateNestedValue(
                        ["notifications", "categories", category, "enabled"],
                        checked
                      )
                    }
                  />
                  <Select
                    label="Nivel"
                    value={settings?.level || "all"}
                    onChange={(value) =>
                      updateNestedValue(
                        ["notifications", "categories", category, "level"],
                        value
                      )
                    }
                    options={NOTIFICATION_LEVELS}
                    disabled={!settings?.enabled}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Dashboard */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Dashboard</h4>
        <Switch
          label="Mostrar estadísticas"
          checked={formState.dashboard?.showStats || false}
          onChange={(checked) =>
            updateNestedValue(["dashboard", "showStats"], checked)
          }
        />
        <Select
          label="Vista predeterminada"
          value={formState.dashboard?.defaultView || "tickets"}
          onChange={(value) =>
            updateNestedValue(["dashboard", "defaultView"], value)
          }
          options={DASHBOARD_VIEWS}
        />
        <Select
          label="Intervalo de actualización"
          value={String(formState.dashboard?.refreshInterval || 5)}
          onChange={(value) =>
            updateNestedValue(["dashboard", "refreshInterval"], Number(value))
          }
          options={REFRESH_INTERVALS}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={isUpdatingPreferences}>
          Guardar Preferencias
        </Button>
      </div>
    </form>
  );
}
