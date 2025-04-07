"use client";

import { useProfile } from "@/hooks/useProfile";
import { ProfileForm } from "@/components/settings/profile/ProfileForm";
import { PasswordForm } from "@/components/settings/profile/PasswordForm";
import { PreferencesForm } from "@/components/settings/profile/PreferencesForm";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { DashboardError } from "@/components/dashboard/DashboardError";

export default function ProfilePage() {
  const { isLoading, error } = useProfile();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <DashboardError
        message={
          error instanceof Error ? error.message : "Error al cargar el perfil"
        }
        code="PROFILE_ERROR"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Configuración del Perfil
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tu información personal y preferencias
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Sección de Información Personal */}
          <div className="bg-white shadow rounded-lg p-6">
            <ProfileForm />
          </div>

          {/* Sección de Contraseña */}
          <div className="bg-white shadow rounded-lg p-6">
            <PasswordForm />
          </div>

          {/* Sección de Preferencias */}
          <div className="bg-white shadow rounded-lg p-6">
            <PreferencesForm />
          </div>
        </div>
      </div>
    </div>
  );
}
