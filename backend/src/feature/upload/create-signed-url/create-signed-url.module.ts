import { Module } from '@nestjs/common';
import { CreateSignedUrlController } from './create-signed-url.controller.js';
import { CreateSignedUrlHandler } from './create-signed-url.handler.js';
import { CloudinaryService } from '../../../infrastructure/service/cloudinary/cloudinary.service.js';
import { DocumentRepository } from '../../../infrastructure/repository/document-repository/document.repository.js';

@Module({
  imports: [],
  controllers: [CreateSignedUrlController],
  providers: [CreateSignedUrlHandler, CloudinaryService, DocumentRepository],
  exports: [CloudinaryService, DocumentRepository],
})
export class CreateSignedUrlModule {}
