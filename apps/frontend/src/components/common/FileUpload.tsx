import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { FileUploadOptions } from "@/types/files";

interface FileUploadProps extends FileUploadOptions {
  onUpload: (formData: FormData) => Promise<void>;
  isUploading?: boolean;
  className?: string;
}

export function FileUpload({
  onUpload,
  isUploading = false,
  maxSize = 50 * 1024 * 1024, // 50MB por defecto
  allowedTypes = [
    "image/*",
    "application/pdf",
    ".doc,.docx,.xls,.xlsx,.txt,.csv",
  ],
  multiple = false,
  className,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);

      if (acceptedFiles.length === 0) {
        return;
      }

      // Si no es multiple, solo usar el primer archivo
      const files = multiple ? acceptedFiles : [acceptedFiles[0]];

      // Crear FormData
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", file);
      });

      try {
        // Si es una imagen, mostrar preview
        if (files[0].type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(files[0]);
        }

        await onUpload(formData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al subir el archivo"
        );
      }
    },
    [multiple, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: allowedTypes.reduce((acc, type) => {
      if (type.startsWith(".")) {
        // Es una extensión
        acc[`application/${type.substring(1)}`] = [type];
      } else {
        // Es un mime type
        acc[type.split("/")[0]] = [type];
      }
      return acc;
    }, {} as Record<string, string[]>),
    multiple,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400",
          isUploading && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <input {...getInputProps()} disabled={isUploading} />
        {isUploading ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Subiendo archivo...</p>
          </div>
        ) : isDragActive ? (
          <p className="text-blue-500">Suelta los archivos aquí</p>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="text-blue-500">Click para seleccionar</span> o
              arrastra y suelta
            </div>
            <p className="text-xs text-gray-500">
              {allowedTypes.join(", ")} (Máx.{" "}
              {Math.round(maxSize / 1024 / 1024)}
              MB)
            </p>
          </div>
        )}
      </div>

      {preview && (
        <div className="relative w-32 h-32">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded"
          />
          <button
            onClick={() => setPreview(null)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
