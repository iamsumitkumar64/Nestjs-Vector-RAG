"use client";

import React, { useState } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Paper,
    LinearProgress
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useAppDispatch } from "@/redux/hooks.ts";
import { uploadFile } from "@/redux/feature/upload/upload-action";
import { FileUploadProps } from "./file-upload.interface";
import styles from "./file-upload.module.css";

export default function FileUpload({ onSuccess }: FileUploadProps) {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            setError("Only PDF files are supported");
            setSelectedFile(null);
            return;
        }

        setError(null);
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);
        try {
            const url = await dispatch(uploadFile(selectedFile)).unwrap();
            setUploadedUrl(url);
            onSuccess?.(url);
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                    ? err
                    : "Upload failed. Check backend and Cloudinary credentials.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={2} className={styles.container}>
            <Box className={styles.dropZone}>
                <PictureAsPdfIcon sx={{ fontSize: 48, color: "#d32f2f" }} />
                <Typography variant="h6" className={styles.heading}>
                    Select PDF Document
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Upload a PDF to store on Cloudinary
                </Typography>

                <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadIcon />}
                    disabled={loading}
                    className={styles.chooseButton}
                >
                    Choose PDF
                    <input
                        type="file"
                        accept="application/pdf,.pdf"
                        hidden
                        onChange={handleFileChange}
                    />
                </Button>
            </Box>

            {selectedFile && (
                <Box className={styles.fileDetails}>
                    <Typography variant="body2">
                        <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUpload}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                        className={styles.uploadButton}
                    >
                        {loading ? "Uploading to Cloudinary..." : "Upload PDF"}
                    </Button>
                </Box>
            )}

            {loading && <LinearProgress className={styles.progress} />}

            {uploadedUrl && (
                <Box className={styles.successBox}>
                    <CheckCircleIcon color="success" />
                    <Box>
                        <Typography variant="body2" className={styles.successTitle}>
                            PDF Uploaded Successfully!
                        </Typography>
                        <a
                            href={uploadedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.fileLink}
                        >
                            Open Uploaded PDF
                        </a>
                    </Box>
                </Box>
            )}

            {error && (
                <Box className={styles.errorBox}>
                    <ErrorIcon color="error" />
                    <Typography variant="body2" className={styles.errorText}>
                        {error}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}
