import { Body, Controller, Post } from '@nestjs/common';
import { ProcessDocumentHandler } from './process-document.handler.js';
import { ProcessDocumentDto } from './process-document.dto.js';

@Controller('document')
export class ProcessDocumentController {
    constructor(private readonly processDocumentHandler: ProcessDocumentHandler) {}

    @Post('process')
    async processDocument(@Body() body: ProcessDocumentDto) {
        return await this.processDocumentHandler.handler(body);
    }
}
