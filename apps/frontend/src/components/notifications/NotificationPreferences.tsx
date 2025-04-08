import React from "react";
import { Switch } from "@headlessui/react";
import { useNotifications } from "@/hooks/useNotifications";
import { INotificationPreferences } from "@/types/notifications";

export const NotificationPreferences: React.FC = () => {
  const { preferences, updatePreferences } = useNotifications();

  if (!preferences) return null;

  const handleToggle = (key: keyof INotificationPreferences) => {
    if (preferences) {
      updatePreferences({
        ...preferences,
        [key]: !preferences[key],
      });
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h3 className="text-lg font-medium">Preferencias de Notificaciones</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Notificaciones en la aplicación</h4>
            <p className="text-sm text-gray-500">
              Recibe notificaciones mientras usas la aplicación
            </p>
          </div>
          <Switch
            checked={preferences.in_app_notifications}
            onChange={() => handleToggle("in_app_notifications")}
            className={`${
              preferences.in_app_notifications ? "bg-blue-600" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span className="sr-only">
              Activar notificaciones en la aplicación
            </span>
            <span
              className={`${
                preferences.in_app_notifications
                  ? "translate-x-6"
                  : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Notificaciones por correo</h4>
            <p className="text-sm text-gray-500">
              Recibe actualizaciones importantes por correo electrónico
            </p>
          </div>
          <Switch
            checked={preferences.email_notifications}
            onChange={() => handleToggle("email_notifications")}
            className={`${
              preferences.email_notifications ? "bg-blue-600" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span className="sr-only">Activar notificaciones por correo</span>
            <span
              className={`${
                preferences.email_notifications
                  ? "translate-x-6"
                  : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Notificaciones push</h4>
            <p className="text-sm text-gray-500">
              Recibe notificaciones incluso cuando no estés usando la aplicación
            </p>
          </div>
          <Switch
            checked={preferences.push_notifications}
            onChange={() => handleToggle("push_notifications")}
            className={`${
              preferences.push_notifications ? "bg-blue-600" : "bg-gray-200"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
          >
            <span className="sr-only">Activar notificaciones push</span>
            <span
              className={`${
                preferences.push_notifications
                  ? "translate-x-6"
                  : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>
    </div>
  );
};
