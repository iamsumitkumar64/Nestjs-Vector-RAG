import { Document } from '../entity/document.entity.js';
import { DocumentChunk } from '../entity/document-chunk.entity.js';
import { DocumentStatus } from '../enum/document-status.enum.js';

export interface ChunkSearchResult {
    id: string;
    documentId: string;
    chunkIndex: number;
    content: string;
    similarity: number;
}

export interface IDocumentRepository {
    createDocument(data: { fileName: string; fileUrl: string }): Promise<Document>;
    updateDocumentStatus(id: string, status: DocumentStatus, totalChunks?: number, errorMessage?: string): Promise<void>;
    findDocumentById(id: string): Promise<Document | null>;
    saveChunks(chunks: Array<{ documentId: string; chunkIndex: number; content: string; embedding: number[] }>): Promise<void>;
    searchSimilarChunks(queryVector: number[], topK: number, documentId?: string): Promise<ChunkSearchResult[]>;
    deleteDocumentByUrl(fileUrl: string): Promise<void>;
}
