import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UserError } from "@/services/api/user";
import type { ProfileUpdateData } from "@/types/user";
import { toast } from "sonner";

export function useProfile() {
  const queryClient = useQueryClient();

  // Query para obtener el perfil
  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: userService.getCurrentProfile,
    retry: (failureCount, error) => {
      if (error instanceof UserError && error.code === "UNAUTHORIZED") {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Mutation para actualizar perfil
  const updateProfileMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil actualizado exitosamente");
    },
    onError: (error: UserError) => {
      toast.error(error.message);
    },
  });

  // Mutation para actualizar avatar
  const updateAvatarMutation = useMutation({
    mutationFn: userService.updateAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Avatar actualizado exitosamente");
    },
    onError: (error: UserError) => {
      toast.error(error.message);
    },
  });

  // Mutation para eliminar avatar
  const deleteAvatarMutation = useMutation({
    mutationFn: userService.deleteAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Avatar eliminado exitosamente");
    },
    onError: (error: UserError) => {
      toast.error(error.message);
    },
  });

  // Mutation para cambiar contraseña
  const changePasswordMutation = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => {
      toast.success("Contraseña actualizada exitosamente");
    },
    onError: (error: UserError) => {
      toast.error(error.message);
    },
  });

  // Mutation para actualizar preferencias
  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences: ProfileUpdateData["preferences"]) =>
      userService.updatePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Preferencias actualizadas exitosamente");
    },
    onError: (error: UserError) => {
      toast.error(error.message);
    },
  });

  // Query para notificaciones no leídas
  const {
    data: unreadCount,
    isLoading: isLoadingUnread,
    error: unreadError,
  } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: userService.getUnreadNotificationsCount,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });

  return {
    // Datos del perfil
    profile,
    isLoading,
    error,
    refetch,

    // Notificaciones
    unreadNotifications: unreadCount || 0,
    isLoadingUnread,
    unreadError,

    // Acciones
    updateProfile: updateProfileMutation.mutate,
    updateAvatar: updateAvatarMutation.mutate,
    deleteAvatar: deleteAvatarMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate,

    // Estado de las mutaciones
    isUpdating: updateProfileMutation.isPending,
    isUpdatingAvatar: updateAvatarMutation.isPending,
    isDeletingAvatar: deleteAvatarMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,

    // Errores de las mutaciones
    updateError: updateProfileMutation.error,
    avatarError: updateAvatarMutation.error,
    deleteAvatarError: deleteAvatarMutation.error,
    passwordError: changePasswordMutation.error,
    preferencesError: updatePreferencesMutation.error,
  };
}
