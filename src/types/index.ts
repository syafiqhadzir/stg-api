import { z } from 'zod';

// Zod Schema for Query Parameters
export const ComparisonQuerySchema = z.object({
    surah: z.coerce.number().min(1).max(114),
    ayah: z.coerce.number().min(1), // Max depends on Surah, handled in logic
});

export type ComparisonQuery = z.infer<typeof ComparisonQuerySchema>;

// Domain Entities
export interface VariantText {
    text: string;
    page: number;
    juz: number;
}

export interface ComparisonMatrix {
    [variantSlug: string]: VariantText;
}

// API Response Interface
export interface ComparisonResponse {
    surah: number;
    ayah: number;
    variants: ComparisonMatrix;
}

export interface ErrorResponse {
    error: string;
    statusCode: number;
    details?: unknown;
}
