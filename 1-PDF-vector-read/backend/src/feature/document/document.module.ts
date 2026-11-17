import { Module } from '@nestjs/common';
import { ProcessDocumentModule } from './process-document/process-document.module.js';
import { SearchDocumentModule } from './search-document/search-document.module.js';

@Module({
    imports: [
        ProcessDocumentModule,
        SearchDocumentModule,
    ],
    exports: [
        ProcessDocumentModule,
        SearchDocumentModule,
    ],
})
export class DocumentModule {}
