import { Module } from '@nestjs/common';
import { ProcessDocumentController } from './process-document.controller.js';
import { ProcessDocumentHandler } from './process-document.handler.js';
import { DocumentRepository } from '../../../infrastructure/repository/document-repository/document.repository.js';
import { PdfParserService } from '../../../infrastructure/service/pdf-parser/pdf-parser.service.js';
import { TextChunkerService } from '../../../infrastructure/service/text-chunker/text-chunker.service.js';
import { GeminiEmbeddingService } from '../../../infrastructure/service/gemini-embedding/gemini-embedding.service.js';

@Module({
    controllers: [ProcessDocumentController],
    providers: [
        ProcessDocumentHandler,
        DocumentRepository,
        PdfParserService,
        TextChunkerService,
        GeminiEmbeddingService,
    ],
    exports: [ProcessDocumentHandler],
})
export class ProcessDocumentModule {}
