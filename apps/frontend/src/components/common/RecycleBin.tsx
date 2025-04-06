import React from "react";
import { FileAttachment } from "@/types/files";
import { cn } from "@/lib/utils";
import { FileList } from "./FileList";

interface RecycleBinProps {
  files: FileAttachment[];
  isLoading?: boolean;
  isEmptyingBin?: boolean;
  onRestore?: (file: FileAttachment) => void;
  onEmptyBin?: () => void;
  className?: string;
}

export function RecycleBin({
  files,
  isLoading = false,
  isEmptyingBin = false,
  onRestore,
  onEmptyBin,
  className,
}: RecycleBinProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Papelera de Reciclaje
          </h3>
          <p className="text-sm text-gray-500">
            {files.length} archivo{files.length !== 1 ? "s" : ""} eliminado
            {files.length !== 1 ? "s" : ""}
          </p>
        </div>
        {files.length > 0 && onEmptyBin && (
          <button
            onClick={onEmptyBin}
            disabled={isLoading || isEmptyingBin}
            className={cn(
              "px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md",
              "hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500",
              (isLoading || isEmptyingBin) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isEmptyingBin ? (
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 animate-spin"
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
                Vaciando...
              </div>
            ) : (
              "Vaciar Papelera"
            )}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <svg
            className="w-8 h-8 text-blue-500 animate-spin"
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
      ) : (
        <FileList
          files={files}
          isDeleted={true}
          onRestore={onRestore}
          className="bg-white rounded-lg shadow"
        />
      )}
    </div>
  );
}
