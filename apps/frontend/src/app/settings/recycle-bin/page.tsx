"use client";

import { RecycleBin } from "@/components/common";
import { useFiles } from "@/hooks/useFiles";
import { FileAttachment } from "@/types/files";

export default function RecycleBinPage() {
  const {
    deletedFiles,
    isLoadingDeleted,
    restoreFile: restore,
    emptyRecycleBin,
    isEmptyingRecycleBin,
  } = useFiles();

  const handleRestore = (file: FileAttachment) => {
    restore(file.id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Papelera de Reciclaje
        </h1>
        <p className="text-gray-600">
          Aquí puedes ver y restaurar archivos eliminados. Los archivos se
          eliminan permanentemente después de 30 días.
        </p>
      </div>

      <RecycleBin
        files={deletedFiles}
        isLoading={isLoadingDeleted}
        onRestore={handleRestore}
        onEmptyBin={emptyRecycleBin}
        isEmptyingBin={isEmptyingRecycleBin}
      />
    </div>
  );
}
