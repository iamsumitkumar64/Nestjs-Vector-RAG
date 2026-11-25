import { Module } from '@nestjs/common';
import { SearchDocumentController } from './search-document.controller.js';
import { SearchDocumentHandler } from './search-document.handler.js';
import { DocumentRepository } from '../../../infrastructure/repository/document-repository/document.repository.js';
import { GeminiEmbeddingService } from '../../../infrastructure/service/gemini-embedding/gemini-embedding.service.js';

@Module({
    controllers: [SearchDocumentController],
    providers: [
        SearchDocumentHandler,
        DocumentRepository,
        GeminiEmbeddingService,
    ],
    exports: [SearchDocumentHandler],
})
export class SearchDocumentModule {}
