import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProcessedDocumentState {
    documentId: string;
    fileName: string;
    fileUrl: string;
    totalChunks: number;
    status: string;
}

export interface DocumentState {
    uploadedPdf: {
        fileName: string;
        fileUrl: string;
    } | null;
    processedDocument: ProcessedDocumentState | null;
}

const initialState: DocumentState = {
    uploadedPdf: null,
    processedDocument: null,
};

export const documentSlice = createSlice({
    name: "document",
    initialState,
    reducers: {
        setUploadedPdf: (state, action: PayloadAction<{ fileName: string; fileUrl: string } | null>) => {
            state.uploadedPdf = action.payload;
        },
        setProcessedDocument: (state, action: PayloadAction<ProcessedDocumentState | null>) => {
            state.processedDocument = action.payload;
        },
        clearDocumentState: (state) => {
            state.uploadedPdf = null;
            state.processedDocument = null;
        },
    },
});

export const { setUploadedPdf, setProcessedDocument, clearDocumentState } = documentSlice.actions;
export default documentSlice.reducer;
