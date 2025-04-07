import React from "react";
import { useSecurity } from "@/hooks/useSecurity";
import { Button } from "@/components/common/Button";
import type { SessionInfo } from "@/types/security";

export function SessionManager() {
  const {
    sessions,
    isLoadingSessions,
    revokeSession,
    revokeAllOtherSessions,
    isRevokingSession,
    isRevokingAllSessions,
  } = useSecurity();

  const handleRevokeSession = async (sessionId: string) => {
    const confirm = window.confirm(
      "¿Estás seguro de que quieres cerrar esta sesión?"
    );
    if (!confirm) return;
    await revokeSession(sessionId);
  };

  const handleRevokeAllSessions = async () => {
    const confirm = window.confirm(
      "¿Estás seguro de que quieres cerrar todas las otras sesiones?"
    );
    if (!confirm) return;
    await revokeAllOtherSessions();
  };

  const formatLastActive = (date: string) => {
    const lastActive = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - lastActive.getTime()) / 1000 / 60
    );

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
    }
    return lastActive.toLocaleDateString();
  };

  const renderSessionRow = (session: SessionInfo) => (
    <div
      key={session.id}
      className="flex items-center justify-between p-4 border-b last:border-b-0"
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {session.device.toLowerCase().includes("mobile") ? (
                <path
                  fillRule="evenodd"
                  d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5 4a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.device} - {session.browser}
            </p>
            <p className="text-sm text-gray-500">
              {session.ip} {session.location && `• ${session.location}`}
            </p>
            <p className="text-xs text-gray-400">
              Última actividad: {formatLastActive(session.lastActive)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">
        {session.current ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Sesión actual
          </span>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRevokeSession(session.id)}
            loading={isRevokingSession}
          >
            Cerrar sesión
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Sesiones Activas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona las sesiones activas en todos tus dispositivos
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoadingSessions ? (
          <div className="p-4 text-center text-gray-500">
            Cargando sesiones...
          </div>
        ) : !sessions?.length ? (
          <div className="p-4 text-center text-gray-500">
            No hay otras sesiones activas
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {sessions.map(renderSessionRow)}
            </div>
            {sessions.length > 1 && (
              <div className="px-4 py-3 bg-gray-50 text-right">
                <Button
                  variant="outline"
                  onClick={handleRevokeAllSessions}
                  loading={isRevokingAllSessions}
                  disabled={isRevokingAllSessions}
                >
                  Cerrar todas las otras sesiones
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
