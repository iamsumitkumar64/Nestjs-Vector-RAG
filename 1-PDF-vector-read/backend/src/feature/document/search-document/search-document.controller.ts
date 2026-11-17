import { Body, Controller, Post } from '@nestjs/common';
import { SearchDocumentHandler } from './search-document.handler.js';
import { SearchDocumentDto } from './search-document.dto.js';

@Controller('document')
export class SearchDocumentController {
    constructor(private readonly searchDocumentHandler: SearchDocumentHandler) {}

    @Post('search')
    async searchDocument(@Body() body: SearchDocumentDto) {
        return await this.searchDocumentHandler.handler(body);
    }
}
