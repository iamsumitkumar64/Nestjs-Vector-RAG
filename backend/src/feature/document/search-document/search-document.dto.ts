import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max, IsUUID } from 'class-validator';

export class SearchDocumentDto {
    @IsNotEmpty()
    @IsString()
    query: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(50)
    topK?: number;

    @IsOptional()
    @IsUUID()
    documentId?: string;
}
