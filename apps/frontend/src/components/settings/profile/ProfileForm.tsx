import React from "react";
import { useProfile } from "@/hooks/useProfile";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ProfileUpdateData } from "@/types/user";

export function ProfileForm() {
  const { profile, isUpdating, updateProfile } = useProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileUpdateData>({
    defaultValues: {
      name: profile?.name || "",
      phone: profile?.phone || "",
      department: profile?.department || "",
      position: profile?.position || "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateProfile(data);
      reset(data); // Actualiza el estado del formulario
    } catch (error) {
      toast.error("Error al actualizar el perfil");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Información Personal
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Actualiza tu información de perfil
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Nombre */}
        <Input
          label="Nombre"
          error={errors.name?.message}
          {...register("name", {
            required: "El nombre es requerido",
            minLength: {
              value: 2,
              message: "El nombre debe tener al menos 2 caracteres",
            },
          })}
        />

        {/* Teléfono */}
        <Input
          label="Teléfono"
          type="tel"
          error={errors.phone?.message}
          {...register("phone", {
            pattern: {
              value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
              message: "Ingresa un número de teléfono válido",
            },
          })}
        />

        {/* Departamento */}
        <Input
          label="Departamento"
          error={errors.department?.message}
          {...register("department")}
        />

        {/* Cargo */}
        <Input
          label="Cargo"
          error={errors.position?.message}
          {...register("position")}
        />

        {/* Email (solo lectura) */}
        <Input
          label="Email"
          value={profile?.email}
          disabled
          helperText="El email no puede ser modificado"
        />

        {/* Rol (solo lectura) */}
        <Input
          label="Rol"
          value={profile?.role}
          disabled
          helperText="El rol es asignado por administradores"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={!isDirty || isUpdating}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!isDirty || isUpdating}
          loading={isUpdating}
        >
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
}
