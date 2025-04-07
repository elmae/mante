"use client";

import React from "react";
import { TwoFactorSetup } from "@/components/settings/security/TwoFactorSetup";
import { SessionManager } from "@/components/settings/security/SessionManager";
import { ApiKeyManager } from "@/components/settings/security/ApiKeyManager";
import { useSecurity } from "@/hooks/useSecurity";
import { DashboardError } from "@/components/dashboard/DashboardError";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default function SecurityPage() {
  const { isLoadingSettings, settingsError } = useSecurity();

  if (isLoadingSettings) {
    return <DashboardSkeleton />;
  }

  if (settingsError) {
    return (
      <DashboardError
        message={
          settingsError instanceof Error
            ? settingsError.message
            : "Error al cargar la configuración de seguridad"
        }
        code="SECURITY_ERROR"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Configuración de Seguridad
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona la seguridad y el acceso a tu cuenta
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* 2FA */}
          <div className="bg-white shadow rounded-lg p-6">
            <TwoFactorSetup />
          </div>

          {/* Sesiones Activas */}
          <div className="bg-white shadow rounded-lg p-6">
            <SessionManager />
          </div>

          {/* API Keys */}
          <div className="bg-white shadow rounded-lg p-6">
            <ApiKeyManager />
          </div>
        </div>
      </div>
    </div>
  );
}
