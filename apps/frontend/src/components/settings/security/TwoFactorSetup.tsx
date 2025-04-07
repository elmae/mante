import React from "react";
import { useSecurity } from "@/hooks/useSecurity";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { QRCodeSVG } from "qrcode.react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { TwoFactorSetup as TwoFactorSetupData } from "@/types/security";

interface TwoFactorVerifyForm {
  code: string;
}

export function TwoFactorSetup() {
  const {
    settings,
    setup2FA,
    enable2FA,
    disable2FA,
    isSettingUp2FA,
    isEnabling2FA,
    isDisabling2FA,
  } = useSecurity();

  const [setupData, setSetupData] = React.useState<TwoFactorSetupData | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TwoFactorVerifyForm>();

  const handleSetup = async () => {
    try {
      const data = await setup2FA();
      setSetupData(data);
    } catch {
      // Error ya manejado por el hook
      setSetupData(null);
    }
  };

  const onVerifySubmit = handleSubmit(async (data) => {
    try {
      await enable2FA({
        method: "app",
        code: data.code,
      });
      setSetupData(null);
      reset();
    } catch {
      // Error ya manejado por el hook
    }
  });

  const handleDisable = async () => {
    const code = prompt("Por favor, ingresa un código 2FA para confirmar:");
    if (!code) return;

    try {
      await disable2FA({
        method: "app",
        code,
      });
      toast.success("2FA desactivado exitosamente");
    } catch {
      // Error ya manejado por el hook
    }
  };

  if (!settings) return null;

  if (setupData) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Configurar Autenticación de Dos Factores
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Escanea el código QR con tu aplicación de autenticación
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white rounded-lg shadow">
            <QRCodeSVG value={setupData.qrCode} size={200} />
          </div>

          <div className="text-sm text-gray-500">
            <p>
              ¿No puedes escanear el código? Ingresa esta clave manualmente:
            </p>
            <code className="block mt-2 p-2 bg-gray-100 rounded font-mono">
              {setupData.secret}
            </code>
          </div>

          <form onSubmit={onVerifySubmit} className="w-full max-w-sm space-y-4">
            <Input
              label="Código de Verificación"
              {...register("code", {
                required: "El código es requerido",
                pattern: {
                  value: /^\d{6}$/,
                  message: "El código debe tener 6 dígitos",
                },
              })}
              error={errors.code?.message}
              placeholder="000000"
            />

            <Button
              type="submit"
              className="w-full"
              loading={isEnabling2FA}
              disabled={isEnabling2FA}
            >
              Verificar y Activar
            </Button>
          </form>

          {setupData.backupCodes.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">
                Códigos de Respaldo
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                Guarda estos códigos en un lugar seguro. Los necesitarás si
                pierdes acceso a tu aplicación de autenticación.
              </p>
              <div className="mt-2 p-4 bg-gray-100 rounded font-mono text-sm">
                {setupData.backupCodes.map((code) => (
                  <div key={code}>{code}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">
          Autenticación de Dos Factores
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Agrega una capa adicional de seguridad a tu cuenta
        </p>
      </div>

      <div className="flex items-start">
        <div className="flex-grow">
          <h4 className="text-base font-medium text-gray-900">
            {settings.twoFactorEnabled
              ? "2FA está activado"
              : "2FA está desactivado"}
          </h4>
          <p className="mt-1 text-sm text-gray-500">
            {settings.twoFactorEnabled
              ? "Tu cuenta está protegida con autenticación de dos factores"
              : "Activa 2FA para mayor seguridad"}
          </p>
        </div>
        <Button
          onClick={settings.twoFactorEnabled ? handleDisable : handleSetup}
          loading={settings.twoFactorEnabled ? isDisabling2FA : isSettingUp2FA}
          variant={settings.twoFactorEnabled ? "outline" : "primary"}
        >
          {settings.twoFactorEnabled ? "Desactivar 2FA" : "Activar 2FA"}
        </Button>
      </div>

      {settings.twoFactorEnabled && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Códigos de respaldo
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Te quedan {settings.backupCodesRemaining} códigos de respaldo.{" "}
                  {settings.backupCodesRemaining < 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 text-yellow-800"
                      onClick={handleSetup}
                    >
                      Generar nuevos códigos
                    </Button>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
