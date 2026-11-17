import { Injectable, Logger } from '@nestjs/common';
import { ProcessDocumentDto } from './process-document.dto.js';
import { DocumentRepository } from '../../../infrastructure/repository/document-repository/document.repository.js';
import { PdfParserService } from '../../../infrastructure/service/pdf-parser/pdf-parser.service.js';
import { TextChunkerService } from '../../../infrastructure/service/text-chunker/text-chunker.service.js';
import { GeminiEmbeddingService } from '../../../infrastructure/service/gemini-embedding/gemini-embedding.service.js';
import { DocumentStatus } from '../../../domain/document/enum/document-status.enum.js';

@Injectable()
export class ProcessDocumentHandler {
    private readonly logger = new Logger(ProcessDocumentHandler.name);

    constructor(
        private readonly documentRepository: DocumentRepository,
        private readonly pdfParserService: PdfParserService,
        private readonly textChunkerService: TextChunkerService,
        private readonly geminiEmbeddingService: GeminiEmbeddingService,
    ) {}

    async handler(dto: ProcessDocumentDto) {
        this.logger.log(`Processing document: ${dto.fileName}`);

        const document = await this.documentRepository.createDocument(dto);

        try {
            await this.documentRepository.updateDocumentStatus(document.id, DocumentStatus.PROCESSING);

            // 1. Extract text from PDF URL
            const text = await this.pdfParserService.extractTextFromUrl(dto.fileUrl);
            if (!text) throw new Error('PDF contained no readable text.');

            // 2. Split into overlapping chunks
            const rawChunks = this.textChunkerService.chunkText(text);
            if (!rawChunks.length) throw new Error('No valid chunks generated.');

            // 3. Compute vector embeddings in parallel
            const embeddings = await this.geminiEmbeddingService.embedBatch(rawChunks);

            // 4. Save chunks with vector embeddings to pgvector
            const chunkRecords = rawChunks.map((content, chunkIndex) => ({
                documentId: document.id,
                chunkIndex,
                content,
                embedding: embeddings[chunkIndex],
            }));
            await this.documentRepository.saveChunks(chunkRecords);

            // 5. Mark document as completed
            await this.documentRepository.updateDocumentStatus(document.id, DocumentStatus.COMPLETED, chunkRecords.length);

            return {
                message: 'Document successfully indexed into pgvector',
                documentId: document.id,
                fileName: dto.fileName,
                fileUrl: dto.fileUrl,
                totalChunks: chunkRecords.length,
                status: DocumentStatus.COMPLETED,
            };
        } catch (error: any) {
            await this.documentRepository.updateDocumentStatus(document.id, DocumentStatus.FAILED, 0, error.message);
            throw error;
        }
    }
}
