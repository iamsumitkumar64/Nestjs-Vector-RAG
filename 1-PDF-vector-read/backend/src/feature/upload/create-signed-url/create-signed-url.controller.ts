import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { CreateSignedUrlHandler } from './create-signed-url.handler.js';
import { CreateSignedUrlDto } from './create-signed-url.dto.js';
import { CloudinaryService } from '../../../infrastructure/service/cloudinary/cloudinary.service.js';
import { DocumentRepository } from '../../../infrastructure/repository/document-repository/document.repository.js';

@Controller('upload')
export class CreateSignedUrlController {
    constructor(
        private readonly createSignedUrlHandler: CreateSignedUrlHandler,
        private readonly cloudinaryService: CloudinaryService,
        private readonly documentRepository: DocumentRepository,
    ) {}

    @Post('signed-url')
    async createSignedUrlPost(@Body() body: CreateSignedUrlDto) {
        return await this.createSignedUrlHandler.handler(body);
    }

    @Get('files')
    async listUploadedFiles(@Query('folder') folder?: string) {
        const files = await this.cloudinaryService.listPdfFiles(folder);
        return {
            total: files.length,
            files,
        };
    }

    @Delete('file')
    async deleteFile(
        @Query('publicId') publicId: string,
        @Query('fileUrl') fileUrl?: string,
    ) {
        if (!publicId) {
            throw new Error('publicId query param is required');
        }

        // 1. Delete from Cloudinary
        const result = await this.cloudinaryService.deleteFile(publicId);

        // 2. Also remove from PostgreSQL / pgvector if fileUrl is supplied
        if (fileUrl) {
            await this.documentRepository.deleteDocumentByUrl(fileUrl);
        }

        return {
            message: 'File deleted permanently from Cloudinary and pgvector database',
            publicId,
            ...result,
        };
    }
}
