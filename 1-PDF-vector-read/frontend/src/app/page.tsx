"use client";

import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import FileUpload from "@/component/file-upload/file-upload";
import styles from "./home.module.css";

export default function Home() {
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);

  const handleUploadSuccess = (url: string) => {
    setUploadedPdfUrl(url);
  };

  return (
    <Box className={styles.mainWrapper}>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: "#1e293b" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            RAG Pipeline - Step 1: PDF Upload
          </Typography>
          <Chip label="Learning Stage: 1" color="primary" size="small" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: "#0f172a" }}>
            Upload PDF Document
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Step 1 of the RAG pipeline. Upload a PDF document here. Cloudinary handles direct secure file upload via backend signed URLs.
          </Typography>
        </Box>

        <FileUpload onSuccess={handleUploadSuccess} />

        {uploadedPdfUrl && (
          <Card sx={{ mt: 4, borderRadius: 2, border: "1px solid #e2e8f0" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#1e293b" }}>
                Ready for Next Step (Chunking & Embedding)
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Cloudinary PDF URL:</strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: "#f8fafc",
                  p: 1.5,
                  borderRadius: 1,
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                  border: "1px solid #e2e8f0",
                }}
              >
                {uploadedPdfUrl}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
