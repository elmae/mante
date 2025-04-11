"use client";

import { useAuth } from "@/contexts/auth/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Bienvenido, {user.firstName} {user.lastName}
        </h2>
        <p className="text-gray-600">
          Este es el panel principal de la aplicación. Aquí podrás ver resúmenes
          y estadísticas importantes.
        </p>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Información de tu cuenta:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Email: {user.email}</li>
            <li>Rol: {user.role}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
