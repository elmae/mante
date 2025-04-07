import React from "react";
import { useProfile } from "@/hooks/useProfile";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { PasswordChange } from "@/types/user";

export function PasswordForm() {
  const { isChangingPassword, changePassword, passwordError } = useProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PasswordChange>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const onSubmit = handleSubmit(async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      await changePassword(data);
      reset(); // Limpiar el formulario después de un cambio exitoso
      toast.success("Contraseña actualizada exitosamente");
    } catch {
      // El error ya se muestra a través del toast en el hook
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Cambiar Contraseña
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Asegúrate de usar una contraseña segura y no compartirla con nadie
        </p>
      </div>

      <div className="space-y-4">
        {/* Contraseña Actual */}
        <Input
          type="password"
          label="Contraseña Actual"
          error={errors.currentPassword?.message}
          {...register("currentPassword", {
            required: "La contraseña actual es requerida",
            minLength: {
              value: 8,
              message: "La contraseña debe tener al menos 8 caracteres",
            },
          })}
        />

        {/* Nueva Contraseña */}
        <Input
          type="password"
          label="Nueva Contraseña"
          error={errors.newPassword?.message}
          {...register("newPassword", {
            required: "La nueva contraseña es requerida",
            minLength: {
              value: 8,
              message: "La contraseña debe tener al menos 8 caracteres",
            },
            pattern: {
              value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
              message:
                "La contraseña debe contener al menos una letra y un número",
            },
          })}
        />

        {/* Confirmar Contraseña */}
        <Input
          type="password"
          label="Confirmar Nueva Contraseña"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            required: "Debes confirmar la nueva contraseña",
            validate: (value) =>
              value === newPassword || "Las contraseñas no coinciden",
          })}
        />
      </div>

      {passwordError && (
        <div className="text-sm text-red-600">
          Error al cambiar la contraseña. Por favor, verifica tus datos e
          intenta nuevamente.
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isChangingPassword}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={isChangingPassword}>
          Cambiar Contraseña
        </Button>
      </div>
    </form>
  );
}
