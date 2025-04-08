import { FileAttachment, FileUploadResponse } from "../types/files";
import { api } from "../services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseFilesOptions {
  parentType?: "ticket" | "maintenance";
  parentId?: string;
  onUploadSuccess?: (file: FileAttachment) => void;
  onUploadError?: (error: Error) => void;
  onDeleteSuccess?: () => void;
  onDeleteError?: (error: Error) => void;
}

export function useFiles(options: UseFilesOptions = {}) {
  const queryClient = useQueryClient();

  // Obtener archivos por padre (ticket o mantenimiento)
  const {
    data: files = [],
    isLoading: isLoadingFiles,
    error: filesError,
  } = useQuery({
    queryKey: ["files", options.parentType, options.parentId],
    queryFn: async () => {
      if (!options.parentType || !options.parentId) return [];
      const response = await api.get<FileAttachment[]>(
        `/attachments/parent/${options.parentType}/${options.parentId}`
      );
      return response.data;
    },
    enabled: Boolean(options.parentType && options.parentId),
  });

  // Mutation para subir archivo
  const uploadMutation = useMutation<FileUploadResponse, Error, FormData>({
    mutationFn: async (formData) => {
      const response = await api.post<FileUploadResponse>(
        "/attachments/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["files", options.parentType, options.parentId],
      });
      options.onUploadSuccess?.(data.attachment);
    },
    onError: (error) => {
      options.onUploadError?.(error);
    },
  });

  // Mutation para eliminar archivo
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (fileId) => {
      await api.delete(`/attachments/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["files", options.parentType, options.parentId],
      });
      options.onDeleteSuccess?.();
    },
    onError: (error) => {
      options.onDeleteError?.(error);
    },
  });

  // Mutation para restaurar archivo
  const restoreMutation = useMutation<FileAttachment, Error, string>({
    mutationFn: async (fileId) => {
      const response = await api.post<FileAttachment>(
        `/attachments/${fileId}/restore`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["files", options.parentType, options.parentId],
      });
      queryClient.invalidateQueries({ queryKey: ["files", "deleted"] });
    },
  });

  // Query para obtener archivos eliminados
  const {
    data: deletedFiles = [],
    isLoading: isLoadingDeleted,
    error: deletedError,
  } = useQuery({
    queryKey: ["files", "deleted"],
    queryFn: async () => {
      const response = await api.get<FileAttachment[]>(
        "/attachments/user/deleted"
      );
      return response.data;
    },
  });

  // Mutation para vaciar la papelera
  const emptyRecycleBinMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await api.post("/attachments/recycle-bin/empty");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", "deleted"] });
    },
  });

  // Función para descargar archivo
  const downloadFile = async (fileId: string): Promise<void> => {
    try {
      const response = await api.get(`/attachments/${fileId}/download`, {
        responseType: "blob",
      });

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        response.headers["content-disposition"]
          ?.split("filename=")[1]
          .replace(/"/g, "") || "download"
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  };

  return {
    // Estado
    files,
    deletedFiles,
    isLoadingFiles,
    isLoadingDeleted,
    filesError,
    deletedError,

    // Operaciones
    uploadFile: uploadMutation.mutate,
    deleteFile: deleteMutation.mutate,
    restoreFile: restoreMutation.mutate,
    downloadFile,
    emptyRecycleBin: () => emptyRecycleBinMutation.mutate(),

    // Estado de las mutaciones
    isUploadingFile: uploadMutation.isPending,
    isDeletingFile: deleteMutation.isPending,
    isRestoringFile: restoreMutation.isPending,
    isEmptyingRecycleBin: emptyRecycleBinMutation.isPending,
  };
}
