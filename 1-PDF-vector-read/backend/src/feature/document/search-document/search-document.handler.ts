import { Injectable } from '@nestjs/common';
import { SearchDocumentDto } from './search-document.dto.js';
import { DocumentRepository } from '../../../infrastructure/repository/document-repository/document.repository.js';
import { GeminiEmbeddingService } from '../../../infrastructure/service/gemini-embedding/gemini-embedding.service.js';

@Injectable()
export class SearchDocumentHandler {
    constructor(
        private readonly documentRepository: DocumentRepository,
        private readonly geminiEmbeddingService: GeminiEmbeddingService,
    ) {}

    async handler(dto: SearchDocumentDto) {
        // If documentId is provided, verify it exists before searching
        if (dto.documentId) {
            const doc = await this.documentRepository.findDocumentById(dto.documentId);
            if (!doc) {
                return {
                    query: dto.query,
                    totalResults: 0,
                    results: [],
                };
            }
        }

        const queryVector = await this.geminiEmbeddingService.embedText(dto.query);
        const results = await this.documentRepository.searchSimilarChunks(
            queryVector,
            dto.topK ?? 5,
            dto.documentId,
        );

        return {
            query: dto.query,
            totalResults: results.length,
            results,
        };
    }
}
