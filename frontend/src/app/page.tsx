"use client";

import React, { useState, useEffect } from "react";
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
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StorageIcon from "@mui/icons-material/Storage";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useSnackbar } from "notistack";
import FileUpload from "@/component/file-upload/file-upload";
import SearchComp from "@/component/search-comp/search-comp";
import {
  processDocumentApi,
  searchDocumentApi,
  listCloudinaryFilesApi,
  deleteCloudinaryFileApi,
  ChunkResult,
  CloudinaryFile,
} from "@/service/document.api";
import { useAppDispatch, useAppSelector } from "@/redux/hooks.ts";
import { setUploadedPdf, setProcessedDocument, clearDocumentState } from "@/redux/feature/document/document-slice";
import { RootState } from "@/redux/store";
import styles from "./home.module.css";

export default function Home() {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const { uploadedPdf, processedDocument } = useAppSelector((state: RootState) => state.document);

  const [processing, setProcessing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ChunkResult[]>([]);
  const [lastQuery, setLastQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cloudinary files list
  const [cloudinaryFiles, setCloudinaryFiles] = useState<CloudinaryFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deletingPublicId, setDeletingPublicId] = useState<string | null>(null);

  const fetchCloudinaryFiles = async () => {
    setLoadingFiles(true);
    try {
      const res = await listCloudinaryFilesApi();
      setCloudinaryFiles(res.files || []);
    } catch (err: any) {
      console.error("Failed to load Cloudinary files:", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchCloudinaryFiles();
  }, []);

  const handleUploadSuccess = async (url: string, fileName: string) => {
    dispatch(setUploadedPdf({ fileName, fileUrl: url }));
    dispatch(setProcessedDocument(null));
    setSearchResults([]);
    enqueueSnackbar(`PDF "${fileName}" uploaded!`, { variant: "success" });

    // Refresh Cloudinary files list
    fetchCloudinaryFiles();

    // Ingest into pgvector
    setProcessing(true);
    setErrorMsg(null);
    try {
      const res = await processDocumentApi(fileName, url);
      dispatch(setProcessedDocument(res));
      enqueueSnackbar(`Indexed ${res.totalChunks} chunks into pgvector!`, { variant: "success" });
    } catch (err: any) {
      const msg = err.message || "Failed to process document";
      setErrorMsg(msg);
      enqueueSnackbar(msg, { variant: "error", autoHideDuration: 6000 });
    } finally {
      setProcessing(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!processedDocument) {
      enqueueSnackbar("No active document selected. Upload or choose a PDF first.", { variant: "warning" });
      return;
    }

    setSearching(true);
    setLastQuery(query);
    setErrorMsg(null);
    try {
      const res = await searchDocumentApi(query, 5, processedDocument?.documentId);
      setSearchResults(res.results);
      enqueueSnackbar(
        res.results.length ? `Found ${res.results.length} relevant chunks` : "No matching chunks found",
        { variant: res.results.length ? "success" : "info" }
      );
    } catch (err: any) {
      const msg = err.message || "Search failed";
      setErrorMsg(msg);
      enqueueSnackbar(msg, { variant: "error", autoHideDuration: 6000 });
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    dispatch(clearDocumentState());
    setSearchResults([]);
    setLastQuery("");
    setErrorMsg(null);
    enqueueSnackbar("Active document cleared from session.", { variant: "info" });
  };

  const handleDeletePermanently = async (file: CloudinaryFile) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to PERMANENTLY delete "${file.publicId}" from Cloudinary and the pgvector database?`
    );
    if (!confirmDelete) return;

    setDeletingPublicId(file.publicId);
    try {
      await deleteCloudinaryFileApi(file.publicId, file.url);
      enqueueSnackbar("File deleted permanently from Cloudinary & pgvector database!", { variant: "success" });

      // If the deleted document was active or stored, clear it
      if (processedDocument?.fileUrl === file.url || uploadedPdf?.fileUrl === file.url) {
        dispatch(clearDocumentState());
        setSearchResults([]);
      }

      await fetchCloudinaryFiles();
    } catch (err: any) {
      const msg = err.message || "Failed to delete file";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setDeletingPublicId(null);
    }
  };

  const handleSelectAsActive = async (file: CloudinaryFile) => {
    const fileName = file.publicId.split("/").pop() + ".pdf";
    dispatch(setUploadedPdf({ fileName, fileUrl: file.url }));
    dispatch(setProcessedDocument(null));
    setSearchResults([]);

    setProcessing(true);
    setErrorMsg(null);
    try {
      const res = await processDocumentApi(fileName, file.url);
      dispatch(setProcessedDocument(res));
      enqueueSnackbar(`Switched active document to "${fileName}" (${res.totalChunks} chunks)`, { variant: "success" });
    } catch (err: any) {
      const msg = err.message || "Failed to process document";
      setErrorMsg(msg);
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box className={styles.mainWrapper}>
      <AppBar position="static" elevation={1} className={styles.appBar}>
        <Toolbar className={styles.toolbar}>
          <Typography variant="h6" className={styles.appTitle}>
            RAG: PDF → Chunk → Gemini → pgvector
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {processedDocument && (
              <Chip
                label={processedDocument.fileName}
                color="primary"
                size="small"
                onDelete={handleReset}
                deleteIcon={<DeleteIcon />}
              />
            )}
            <Chip label="pgvector Ready" color="success" size="small" />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className={styles.contentContainer}>
        <Box className={styles.headerSection}>
          <Typography variant="h4" className={styles.pageTitle}>
            Upload PDF & Query pgvector
          </Typography>
          <Typography variant="body1" className={styles.pageSubtitle}>
            Upload a PDF document. Chunks and Gemini embeddings are automatically indexed into PostgreSQL with pgvector for instant semantic search.
          </Typography>
        </Box>

        {!processedDocument ? (
          <Box sx={{ mb: 4 }}>
            <FileUpload onSuccess={handleUploadSuccess} />
          </Box>
        ) : (
          <Card elevation={2} className={styles.successCard}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <StorageIcon color="success" />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#166534" }}>
                    Active Indexed Document
                  </Typography>
                </Box>
                <Button size="small" variant="outlined" color="inherit" onClick={handleReset} startIcon={<DeleteIcon />}>
                  Clear Active Document
                </Button>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box className={styles.chipsWrapper}>
                <Chip label={`File: ${processedDocument.fileName}`} size="small" variant="outlined" />
                <Chip label={`Chunks: ${processedDocument.totalChunks}`} size="small" color="primary" />
                <Chip label="Gemini 768-dim" size="small" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        )}

        {processing && (
          <Paper elevation={1} className={styles.processingCard}>
            <CircularProgress size={32} sx={{ mb: 1 }} />
            <Typography variant="h6">Processing Document...</Typography>
            <Typography variant="body2" color="textSecondary">Parsing PDF → Creating Chunks → Embedding with Gemini → Saving in pgvector</Typography>
          </Paper>
        )}

        {errorMsg && <Alert severity="error" sx={{ mb: 4 }}>{errorMsg}</Alert>}

        <Paper elevation={2} className={styles.searchSection}>
          <Box className={styles.searchHeader}>
            <SearchIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" className={styles.searchTitle}>Semantic Search</Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2.5 }}>
            {processedDocument
              ? `Ask any question to search through "${processedDocument.fileName}".`
              : "Please upload or select an active document first to enable search."}
          </Typography>

          <SearchComp
            onSearch={handleSearch}
            placeholder={processedDocument ? "Ask a question about the document..." : "Upload a PDF first to search..."}
            disabled={!processedDocument}
          />

          {searching && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 2 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="textSecondary">Searching vectors in pgvector...</Typography>
            </Box>
          )}

          {searchResults.length > 0 && (
            <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Results for &quot;{lastQuery}&quot;:
              </Typography>
              {searchResults.map((item, idx) => (
                <Card key={item.id} variant="outlined" className={styles.chunkCard}>
                  <CardContent sx={{ p: 2 }}>
                    <Box className={styles.chunkHeader}>
                      <Typography variant="caption" color="textSecondary">Chunk #{item.chunkIndex + 1} (Rank #{idx + 1})</Typography>
                      <Chip
                        icon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                        label={`Similarity: ${(item.similarity * 100).toFixed(1)}%`}
                        color={item.similarity > 0.65 ? "success" : "info"}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" className={styles.chunkContent}>{item.content}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>

        <Paper elevation={2} className={styles.cloudinarySection}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CloudQueueIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Cloudinary Uploaded PDFs ({cloudinaryFiles.length})
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={loadingFiles ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={fetchCloudinaryFiles}
              disabled={loadingFiles}
            >
              Refresh List
            </Button>
          </Box>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Manage PDFs stored in your Cloudinary account. Deleting permanently removes the file from Cloudinary and purges all indexed vectors from the pgvector database.
          </Typography>

          {cloudinaryFiles.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ py: 3, textAlign: "center" }}>
              {loadingFiles ? "Loading files from Cloudinary..." : "No PDFs found in Cloudinary."}
            </Typography>
          ) : (
            <TableContainer className={styles.tableContainer}>
              <Table size="small">
                <TableHead>
                  <TableRow className={styles.tableHeadRow}>
                    <TableCell>PDF Name / Public ID</TableCell>
                    <TableCell align="center">Size</TableCell>
                    <TableCell align="center">Uploaded</TableCell>
                    <TableCell align="center">Active Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cloudinaryFiles.map((file) => {
                    const isActive = processedDocument?.fileUrl === file.url;
                    const isDeleting = deletingPublicId === file.publicId;

                    return (
                      <TableRow key={file.publicId} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <PictureAsPdfIcon color="error" fontSize="small" />
                            <Box sx={{ wordBreak: "break-all" }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {file.publicId.split("/").pop()}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {file.publicId}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption">
                            {(file.bytes / 1024).toFixed(1)} KB
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="caption">
                            {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {isActive ? (
                            <Chip label="Active" color="success" size="small" />
                          ) : (
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => handleSelectAsActive(file)}
                              disabled={processing}
                            >
                              Index & Set Active
                            </Button>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                            <Tooltip title="View PDF in new tab">
                              <IconButton
                                size="small"
                                component="a"
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <OpenInNewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Permanently delete from Cloudinary and pgvector">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeletePermanently(file)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? <CircularProgress size={16} color="error" /> : <DeleteIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
