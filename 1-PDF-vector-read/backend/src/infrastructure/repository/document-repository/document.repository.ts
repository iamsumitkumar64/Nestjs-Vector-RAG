import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Document } from '../../../domain/document/entity/document.entity.js';
import { DocumentStatus } from '../../../domain/document/enum/document-status.enum.js';
import {
    IDocumentRepository,
    ChunkSearchResult,
} from '../../../domain/document/repository/document.repository.interface.js';

@Injectable()
export class DocumentRepository implements IDocumentRepository {
    constructor(private readonly dataSource: DataSource) {}

    async createDocument(data: { fileName: string; fileUrl: string }): Promise<Document> {
        return this.dataSource.getRepository(Document).save({
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            status: DocumentStatus.PENDING,
        });
    }

    async updateDocumentStatus(
        id: string,
        status: DocumentStatus,
        totalChunks?: number,
        errorMessage?: string,
    ): Promise<void> {
        await this.dataSource.getRepository(Document).update(id, {
            status,
            ...(totalChunks !== undefined && { totalChunks }),
            ...(errorMessage !== undefined && { errorMessage }),
        });
    }

    async findDocumentById(id: string): Promise<Document | null> {
        return this.dataSource.getRepository(Document).findOne({
            where: { id },
            relations: { chunks: true },
        });
    }

    async saveChunks(
        chunks: Array<{ documentId: string; chunkIndex: number; content: string; embedding: number[] }>,
    ): Promise<void> {
        for (const c of chunks) {
            await this.dataSource.query(
                `INSERT INTO "document_chunks" ("documentId", "chunkIndex", content, embedding)
                 VALUES ($1, $2, $3, $4::vector)`,
                [c.documentId, c.chunkIndex, c.content, `[${c.embedding.join(',')}]`],
            );
        }
    }

    async searchSimilarChunks(
        queryVector: number[],
        topK = 5,
        documentId?: string,
    ): Promise<ChunkSearchResult[]> {
        const vectorStr = `[${queryVector.join(',')}]`;
        const whereClause = documentId ? `WHERE "documentId" = $2` : '';
        const limitParam = documentId ? '$3' : '$2';
        const params: any[] = documentId ? [vectorStr, documentId, topK] : [vectorStr, topK];

        const rows = await this.dataSource.query(
            `SELECT id, "documentId", "chunkIndex", content,
                    ROUND((1 - (embedding <=> $1::vector))::numeric, 4) AS similarity
             FROM "document_chunks"
             ${whereClause}
             ORDER BY embedding <=> $1::vector ASC
             LIMIT ${limitParam}`,
            params,
        );

        return rows.map((r: any) => ({
            id: r.id,
            documentId: r.documentId,
            chunkIndex: Number(r.chunkIndex),
            content: r.content,
            similarity: Number(r.similarity),
        }));
    }

    async deleteDocumentByUrl(fileUrl: string): Promise<void> {
        const urlWithoutProtocol = fileUrl.replace(/^https?:\/\//, '');
        await this.dataSource.query(
            `DELETE FROM "documents" WHERE "fileUrl" = $1 OR "fileUrl" LIKE $2`,
            [fileUrl, `%${urlWithoutProtocol}%`],
        );
    }
}
