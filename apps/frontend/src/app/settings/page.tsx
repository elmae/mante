import { settingsNavigation } from "@/lib/settings-navigation";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración</h1>
        <p className="text-gray-600">
          Administra la configuración de tu cuenta y preferencias del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <item.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                {item.name}
              </h3>
            </div>
            <p className="text-gray-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
