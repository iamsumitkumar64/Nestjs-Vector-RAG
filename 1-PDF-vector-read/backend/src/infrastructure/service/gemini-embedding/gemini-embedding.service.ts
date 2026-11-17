import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiEmbeddingService {
    private readonly ai: GoogleGenAI;
    private readonly modelName = 'gemini-embedding-001';
    private readonly targetDimension = 768;

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
        this.ai = new GoogleGenAI({ apiKey });
    }

    // Embeds text using Gemini embedding model
    async embedText(text: string): Promise<number[]> {
        const response = await this.ai.models.embedContent({
            model: this.modelName,
            contents: text,
            config: { outputDimensionality: this.targetDimension },
        });

        const values = response.embeddings?.[0]?.values;
        if (!values) throw new Error('No embedding returned from Gemini API');
        return values;
    }

    // Embeds multiple chunks
    async embedBatch(texts: string[]): Promise<number[][]> {
        return Promise.all(texts.map((text) => this.embedText(text)));
    }
}
