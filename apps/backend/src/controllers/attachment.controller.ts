import { Request, Response } from 'express';
import { IFilesPort } from '../services/files';
import { CreateAttachmentDto } from '../domain/dtos/attachment.dto';
import { BadRequestError } from '../common/exceptions/bad-request.exception';
import { pipeline } from 'stream/promises';

export class AttachmentController {
  constructor(private readonly filesService: IFilesPort) {}

  async uploadFile(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const dto = new CreateAttachmentDto();
    Object.assign(dto, req.body);

    const result = await this.filesService.uploadFile(req.file, req.user.id, dto);

    res.status(201).json(result);
  }

  async downloadFile(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await this.filesService.downloadFile(id);

    res.setHeader('Content-Type', result.attachment.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${result.attachment.file_name}"`);

    await pipeline(result.stream, res);
  }
  async deleteFile(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this.filesService.deleteFile(id, req.user.id);
    res.status(204).send();
  }

  async restoreFile(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await this.filesService.restoreFile(id, req.user.id);
    res.json(result);
  }

  async getFileInfo(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await this.filesService.getFileInfo(id);
    res.json(result);
  }

  async getFilesByParent(req: Request, res: Response): Promise<void> {
    const { parentType, parentId } = req.params;

    if (parentType !== 'ticket' && parentType !== 'maintenance') {
      throw new BadRequestError('Invalid parent type');
    }

    const files = await this.filesService.getFilesByParent(parentType, parentId);
    res.json(files);
  }

  async getDeletedFiles(req: Request, res: Response): Promise<void> {
    const files = await this.filesService.getDeletedFiles(req.user.id);
    res.json(files);
  }

  async emptyRecycleBin(req: Request, res: Response): Promise<void> {
    await this.filesService.emptyRecycleBin(req.user.id);
    res.status(204).send();
  }
}
