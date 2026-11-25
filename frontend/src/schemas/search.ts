import { z } from "zod";

export const searchSchema = z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, " "))
    .refine((val) => val === "" || val.length >= 2, {
        message: "Search must be at least 2 characters",
    })
    .refine((val) => val.length <= 500, {
        message: "Search query cannot exceed 500 characters",
    });

export type SearchSchemaType = z.infer<typeof searchSchema>;
