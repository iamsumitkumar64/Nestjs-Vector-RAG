"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, TextField, Typography, InputAdornment, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDebounce } from "use-debounce";
import { searchSchema } from "@/schemas/search";
import { SearchCompProps } from "./search-comp.interface";
import styles from "./search-comp.module.css";

export default function SearchComp({
    onSearch,
    placeholder = "Search...",
    debounceDelay = 800,
    schema = searchSchema,
    disabled = false,
}: SearchCompProps) {
    const [query, setQuery] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [debouncedQuery] = useDebounce(query, debounceDelay);
    const isInitialMount = useRef(true);
    const lastExecutedQuery = useRef("");

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        if (disabled) return;

        const trimmed = debouncedQuery.trim();
        // Do not trigger API if query is empty or unchanged
        if (!trimmed || trimmed === lastExecutedQuery.current) {
            return;
        }

        const result = schema.safeParse(trimmed);
        if (!result.success) {
            setError(result.error.issues[0]?.message || "Invalid search input");
            return;
        }

        setError(null);
        lastExecutedQuery.current = result.data;
        onSearch(result.data);
    }, [debouncedQuery, onSearch, schema, disabled]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (disabled) return;
        const trimmed = query.trim();
        if (!trimmed || trimmed === lastExecutedQuery.current) return;

        const result = schema.safeParse(trimmed);
        if (!result.success) {
            setError(result.error.issues[0]?.message || "Invalid search input");
            return;
        }

        setError(null);
        lastExecutedQuery.current = result.data;
        onSearch(result.data);
    };

    return (
        <Box component="form" onSubmit={handleFormSubmit} className={styles.container}>
            <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                    size="small"
                    fullWidth
                    disabled={disabled}
                    value={query}
                    placeholder={placeholder}
                    error={Boolean(error)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (error) setError(null);
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: "#9e9e9e" }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={disabled || !query.trim()}
                    sx={{ textTransform: "none", px: 3, fontWeight: 600, minWidth: 90 }}
                >
                    Search
                </Button>
            </Box>
            {error && <Typography className={styles.error}>{error}</Typography>}
        </Box>
    );
}
