import { z } from 'zod';
import { VerseSchema } from './surah';

// Juz/Page Query Params
export const JuzParamsSchema = z.object({
  juz: z.coerce.number().min(1).max(30),
});

export const PageParamsSchema = z.object({
  page: z.coerce.number().min(1),
});

export const VersesQuerySchema = z.object({
  qiraat: z.string().optional().describe('Filter by Qiraat slug'),
});

// Juz Response
export const JuzResponseSchema = z.object({
  juz: z.number().describe('Juz number (1-30)'),
  verses: z
    .array(
      VerseSchema.extend({
        surah: z.number().describe('Surah number'),
      }),
    )
    .describe('Array of verses in this Juz'),
});

// Page Response
export const PageResponseSchema = z.object({
  page: z.number().describe('Page number'),
  verses: z
    .array(
      VerseSchema.extend({
        surah: z.number().describe('Surah number'),
      }),
    )
    .describe('Array of verses on this page'),
});

// Search
export const SearchQuerySchema = z.object({
  q: z.string().min(1).describe('Search query in Arabic'),
  qiraat: z.string().optional().describe('Filter by Qiraat slug'),
  limit: z.coerce.number().min(1).max(100).default(20).describe('Max results'),
});

export const SearchResultSchema = z.object({
  surah: z.number().describe('Surah number'),
  ayah: z.number().describe('Ayah number'),
  text: z.string().describe('Matching verse text'),
  qiraat: z.string().describe('Qiraat slug'),
});

export const SearchResponseSchema = z.object({
  query: z.string().describe('Original search query'),
  count: z.number().describe('Number of results'),
  results: z.array(SearchResultSchema).describe('Search results'),
});

// Types
export type JuzResponse = z.infer<typeof JuzResponseSchema>;
export type PageResponse = z.infer<typeof PageResponseSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
