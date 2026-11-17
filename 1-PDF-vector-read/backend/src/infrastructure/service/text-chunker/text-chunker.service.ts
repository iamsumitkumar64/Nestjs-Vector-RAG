import { Injectable } from '@nestjs/common';

export interface ChunkOptions {
    chunkSize?: number;
    chunkOverlap?: number;
}

@Injectable()
export class TextChunkerService {
    // Sliding window text chunking
    chunkText(text: string, options?: ChunkOptions): string[] {
        if (!text?.trim()) return [];

        const chunkSize = options?.chunkSize ?? 800;
        const chunkOverlap = options?.chunkOverlap ?? 150;
        const step = Math.max(1, chunkSize - chunkOverlap);

        const chunks: string[] = [];
        let start = 0;

        while (start < text.length) {
            const end = Math.min(start + chunkSize, text.length);
            const chunk = text.slice(start, end).trim();
            if (chunk) chunks.push(chunk);
            if (end === text.length) break;
            start += step;
        }

        return chunks;
    }
}
