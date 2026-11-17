import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryFileResource {
    publicId: string;
    url: string;
    format: string;
    bytes: number;
    createdAt: string;
}

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private readonly configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    createUploadSignature(folder: string = 'RAG_Learning') {
        const timestamp = Math.floor(Date.now() / 1000);
        const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET') ?? '';

        const paramsToSign = {
            timestamp,
            folder,
        };

        const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

        return {
            uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            signature,
            timestamp,
            apiKey,
            api_key: apiKey,
            folder,
        };
    }

    /**
     * Lists uploaded PDFs from Cloudinary.
     * If folder is passed, filters by folder prefix; otherwise lists all PDFs in the account.
     */
    async listPdfFiles(folder?: string): Promise<CloudinaryFileResource[]> {
        try {
            const options: any = {
                resource_type: 'image',
                type: 'upload',
                max_results: 100,
            };
            if (folder) {
                options.prefix = folder;
            }

            const res = await cloudinary.api.resources(options);

            // Also check raw resource_type if needed
            let rawResources: any[] = [];
            try {
                const rawOptions = { ...options, resource_type: 'raw' };
                const rawRes = await cloudinary.api.resources(rawOptions);
                rawResources = rawRes.resources || [];
            } catch (_) {}

            const allResources = [...(res.resources || []), ...rawResources];

            return allResources
                .filter((r: any) => r.format === 'pdf' || r.public_id.endsWith('.pdf'))
                .map((r: any) => ({
                    publicId: r.public_id,
                    url: r.secure_url,
                    format: r.format || 'pdf',
                    bytes: r.bytes,
                    createdAt: r.created_at,
                }));
        } catch (error: any) {
            this.logger.error(`Error listing Cloudinary files: ${error.message}`);
            return [];
        }
    }

    /**
     * Permanently deletes a file from Cloudinary by its public_id or URL.
     */
    async deleteFile(publicId: string): Promise<{ success: boolean; result: string }> {
        try {
            // First try deleting as image (PDFs are typically image resource_type in Cloudinary)
            let result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            if (result.result !== 'ok') {
                result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
            }

            return {
                success: result.result === 'ok',
                result: result.result,
            };
        } catch (error: any) {
            this.logger.error(`Error deleting Cloudinary file ${publicId}: ${error.message}`);
            throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
        }
    }
}
