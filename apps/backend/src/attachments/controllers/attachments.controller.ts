import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  Req,
  BadRequestException,
  StreamableFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AttachmentsService } from '../services/attachments.service';
import { CreateAttachmentDto, AttachmentResponseDto } from '../../domain/dtos/attachment.dto';
import { AuthorizedRequest } from '../../common/types/auth.types';

@Controller('attachments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  @Roles('user', 'admin', 'super_admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthorizedRequest
  ): Promise<AttachmentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const dto = new CreateAttachmentDto();
    dto.file_name = file.originalname;
    dto.mime_type = file.mimetype;
    dto.file_size = file.size;

    return this.attachmentsService.uploadFile(file, req.user.id, dto);
  }

  @Get(':id')
  @Roles('user', 'admin', 'super_admin')
  async downloadFile(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const { stream, attachment } = await this.attachmentsService.downloadFile(id);

    res.set({
      'Content-Type': attachment.mime_type,
      'Content-Disposition': `attachment; filename="${attachment.file_name}"`
    });

    return new StreamableFile(stream);
  }

  @Get(':id/info')
  @Roles('user', 'admin', 'super_admin')
  async getFileInfo(@Param('id') id: string): Promise<AttachmentResponseDto> {
    return this.attachmentsService.getFileInfo(id);
  }

  @Delete(':id')
  @Roles('user', 'admin', 'super_admin')
  async deleteFile(@Param('id') id: string, @Req() req: AuthorizedRequest): Promise<void> {
    await this.attachmentsService.deleteFile(id, req.user.id);
  }

  @Post(':id/restore')
  @Roles('user', 'admin', 'super_admin')
  async restoreFile(@Param('id') id: string): Promise<AttachmentResponseDto> {
    return this.attachmentsService.restoreFile(id);
  }

  @Get('parent/:parentType/:parentId')
  @Roles('user', 'admin', 'super_admin')
  async getFilesByParent(
    @Param('parentType') parentType: 'ticket' | 'maintenance',
    @Param('parentId') parentId: string
  ): Promise<AttachmentResponseDto[]> {
    return this.attachmentsService.getFilesByParent(parentType, parentId);
  }

  @Get('user/deleted')
  @Roles('user', 'admin', 'super_admin')
  async getDeletedFiles(@Req() req: AuthorizedRequest): Promise<AttachmentResponseDto[]> {
    return this.attachmentsService.getDeletedFiles(req.user.id);
  }

  @Delete('user/recycle-bin')
  @Roles('user', 'admin', 'super_admin')
  async emptyRecycleBin(@Req() req: AuthorizedRequest): Promise<void> {
    await this.attachmentsService.emptyRecycleBin(req.user.id);
  }
}
