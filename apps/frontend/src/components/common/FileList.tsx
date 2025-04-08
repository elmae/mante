import React from "react";
import { FileAttachment } from "@/types/files";
import { cn } from "@/lib/utils";
import { Badge } from "./Badge";

interface FileListProps {
  files: FileAttachment[];
  showActions?: boolean;
  isDeleted?: boolean;
  onDownload?: (file: FileAttachment) => void;
  onDelete?: (file: FileAttachment) => void;
  onRestore?: (file: FileAttachment) => void;
  className?: string;
}

export function FileList({
  files,
  showActions = true,
  isDeleted = false,
  onDownload,
  onDelete,
  onRestore,
  className,
}: FileListProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (mimeType: string): React.ReactElement => {
    if (mimeType.startsWith("image/")) {
      return (
        <svg
          className="w-6 h-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    }

    if (mimeType === "application/pdf") {
      return (
        <svg
          className="w-6 h-6 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-6 h-6 text-gray-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  if (files.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        {isDeleted
          ? "No hay archivos en la papelera"
          : "No hay archivos adjuntos"}
      </div>
    );
  }

  return (
    <ul className={cn("divide-y divide-gray-200", className)}>
      {files.map((file) => (
        <li key={file.id} className="py-4">
          <div className="flex items-center space-x-4">
            {getFileIcon(file.mime_type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.file_name}
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatFileSize(file.file_size)}</span>
                <span>•</span>
                <Badge
                  variant={
                    file.mime_type.startsWith("image/") ? "info" : "default"
                  }
                  size="sm"
                >
                  {file.mime_type}
                </Badge>
              </div>
            </div>
            {showActions && (
              <div className="flex items-center space-x-2">
                {onDownload && (
                  <button
                    onClick={() => onDownload(file)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Descargar archivo"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                )}
                {!isDeleted && onDelete && (
                  <button
                    onClick={() => onDelete(file)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar archivo"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
                {isDeleted && onRestore && (
                  <button
                    onClick={() => onRestore(file)}
                    className="text-green-600 hover:text-green-800"
                    title="Restaurar archivo"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
