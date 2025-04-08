import { promises as fsPromises } from 'fs';
import fs from 'fs';
import path from 'path';
import { IStoragePort, SaveFileResult, GetFileResult } from '../../ports/output/storage.port';
import { pipeline } from 'stream/promises';

export class LocalStorageAdapter implements IStoragePort {
  constructor(private readonly basePath: string) {}

  async saveFile(file: Express.Multer.File, destinationPath: string): Promise<SaveFileResult> {
    const fullPath = path.join(this.basePath, destinationPath);
    const directory = path.dirname(fullPath);

    // Asegurar que el directorio existe
    await fsPromises.mkdir(directory, { recursive: true });

    // Mover el archivo usando stream para mejor manejo de archivos grandes
    await pipeline(fs.createReadStream(file.path), fs.createWriteStream(fullPath));

    // Eliminar el archivo temporal
    await fsPromises.unlink(file.path);

    return {
      path: destinationPath,
      size: file.size,
      mimeType: file.mimetype
    };
  }

  async getFile(filePath: string): Promise<GetFileResult> {
    const fullPath = path.join(this.basePath, filePath);
    const stats = await fsPromises.stat(fullPath);
    const mimeType = this.getMimeType(fullPath);

    return {
      stream: fs.createReadStream(fullPath),
      size: stats.size,
      mimeType
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filePath);
    await fsPromises.unlink(fullPath);
  }

  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    const sourceFullPath = path.join(this.basePath, sourcePath);
    const destinationFullPath = path.join(this.basePath, destinationPath);
    const directory = path.dirname(destinationFullPath);

    // Asegurar que el directorio de destino existe
    await fsPromises.mkdir(directory, { recursive: true });

    // Mover el archivo
    await fsPromises.rename(sourceFullPath, destinationFullPath);
  }

  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.basePath, filePath);
    try {
      await fsPromises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileSize(filePath: string): Promise<number> {
    const fullPath = path.join(this.basePath, filePath);
    const stats = await fsPromises.stat(fullPath);
    return stats.size;
  }

  async deleteDirectory(directoryPath: string): Promise<void> {
    const fullPath = path.join(this.basePath, directoryPath);
    await fsPromises.rm(fullPath, { recursive: true, force: true });
  }

  async createDirectory(directoryPath: string): Promise<void> {
    const fullPath = path.join(this.basePath, directoryPath);
    await fsPromises.mkdir(fullPath, { recursive: true });
  }

  async listFiles(directoryPath: string): Promise<string[]> {
    const fullPath = path.join(this.basePath, directoryPath);
    const entries = await fsPromises.readdir(fullPath, { withFileTypes: true });

    const files: string[] = [];
    for (const entry of entries) {
      if (entry.isFile()) {
        files.push(entry.name);
      }
    }

    return files;
  }

  async getDirectorySize(directoryPath: string): Promise<number> {
    const fullPath = path.join(this.basePath, directoryPath);
    let size = 0;

    async function calculateSize(dirPath: string): Promise<void> {
      const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullEntryPath = path.join(dirPath, entry.name);
        if (entry.isFile()) {
          const stats = await fsPromises.stat(fullEntryPath);
          size += stats.size;
        } else if (entry.isDirectory()) {
          await calculateSize(fullEntryPath);
        }
      }
    }

    await calculateSize(fullPath);
    return size;
  }

  private getMimeType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv'
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }
}
