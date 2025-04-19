import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { Attachment } from '../domain/entities/attachment.entity';
import { AttachmentsController } from './controllers/attachments.controller';
import { AttachmentsService } from './services/attachments.service';
import { DEFAULT_FILE_STORAGE_OPTIONS } from '../services/files';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: (req, file, cb) => {
            cb(null, DEFAULT_FILE_STORAGE_OPTIONS.uploadPath);
          },
          filename: (req, file, cb) => {
            const uuid = uuidv4();
            cb(null, `${uuid}${extname(file.originalname)}`);
          }
        }),
        limits: {
          fileSize: DEFAULT_FILE_STORAGE_OPTIONS.maxSizeInBytes
        },
        fileFilter: (req, file, cb) => {
          if (DEFAULT_FILE_STORAGE_OPTIONS.allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
          } else {
            cb(new Error('File type not allowed'), false);
          }
        }
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [AttachmentsController],
  providers: [
    AttachmentsService,
    {
      provide: 'FILE_STORAGE_OPTIONS',
      useValue: DEFAULT_FILE_STORAGE_OPTIONS
    },
    {
      provide: 'RETENTION_RULES',
      useValue: [] // Se configurará después
    }
  ],
  exports: [AttachmentsService]
})
export class AttachmentsModule {}
