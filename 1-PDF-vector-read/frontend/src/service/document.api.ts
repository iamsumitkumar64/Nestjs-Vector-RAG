const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8090";

export interface ProcessDocumentResponse {
    message: string;
    documentId: string;
    fileName: string;
    fileUrl: string;
    totalChunks: number;
    status: string;
}

export interface ChunkResult {
    id: string;
    documentId: string;
    chunkIndex: number;
    content: string;
    similarity: number;
}

export interface SearchDocumentResponse {
    query: string;
    totalResults: number;
    results: ChunkResult[];
}

export interface CloudinaryFile {
    publicId: string;
    url: string;
    format: string;
    bytes: number;
    createdAt: string;
}

export interface ListCloudinaryFilesResponse {
    total: number;
    files: CloudinaryFile[];
}

export async function processDocumentApi(fileName: string, fileUrl: string): Promise<ProcessDocumentResponse> {
    const res = await fetch(`${BACKEND_API_URL}/document/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileUrl }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Failed to process document");
    }

    return data;
}

export async function searchDocumentApi(query: string, topK: number = 5, documentId?: string): Promise<SearchDocumentResponse> {
    const res = await fetch(`${BACKEND_API_URL}/document/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, topK, ...(documentId && { documentId }) }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Failed to search document");
    }

    return data;
}

export async function listCloudinaryFilesApi(folder?: string): Promise<ListCloudinaryFilesResponse> {
    const url = folder ? `${BACKEND_API_URL}/upload/files?folder=${encodeURIComponent(folder)}` : `${BACKEND_API_URL}/upload/files`;
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Failed to list Cloudinary files");
    }
    return data;
}

export async function deleteCloudinaryFileApi(publicId: string, fileUrl?: string): Promise<{ message: string; success: boolean }> {
    const query = new URLSearchParams({ publicId });
    if (fileUrl) query.append("fileUrl", fileUrl);

    const res = await fetch(`${BACKEND_API_URL}/upload/file?${query.toString()}`, {
        method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Failed to delete file");
    }
    return data;
}
