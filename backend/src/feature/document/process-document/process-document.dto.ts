import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ProcessDocumentDto {
    @IsNotEmpty()
    @IsString()
    fileName: string;

    @IsNotEmpty()
    @IsUrl()
    fileUrl: string;
}
