import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class PdfParserService {
    /**
     * Downloads a PDF from a URL and extracts its plain text content.
     */
    async extractTextFromUrl(fileUrl: string): Promise<string> {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to download PDF (${response.statusText})`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());
        const parser = new PDFParse({ data: buffer });

        try {
            const data = await parser.getText();
            return (data.text || '')
                .replace(/\r\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
        } finally {
            await parser.destroy().catch(() => {});
        }
    }
}
