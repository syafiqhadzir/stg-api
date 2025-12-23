import { z } from 'zod';

// Zod Schema for Query Parameters
export const ComparisonQuerySchema = z.object({
  surah: z.coerce.number().min(1).max(114),
  ayah: z.coerce.number().min(1), // Max depends on Surah, handled in logic
});

export type ComparisonQuery = z.infer<typeof ComparisonQuerySchema>;

// API Response Schemas (for Swagger documentation)
export const VariantTextSchema = z.object({
  text: z.string().describe('The variant text of the verse'),
  page: z.number().describe('Page number in the Mushaf'),
  juz: z.number().describe('Juz (part) number'),
});

export const ComparisonResponseSchema = z.object({
  surah: z.number().describe('Surah number (1-114)'),
  ayah: z.number().describe('Ayah (verse) number'),
  variants: z.record(z.string(), VariantTextSchema).describe('Map of variant slug to text data'),
});

export const ErrorResponseSchema = z.object({
  statusCode: z.number().describe('HTTP status code'),
  error: z.string().describe('Error type/name'),
  message: z.string().describe('Human-readable error message'),
});

// TypeScript Types (inferred from schemas)
export type VariantText = z.infer<typeof VariantTextSchema>;
export type ComparisonResponse = z.infer<typeof ComparisonResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Legacy interfaces for compatibility
export type ComparisonMatrix = Record<string, VariantText>;
