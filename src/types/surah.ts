import { z } from 'zod';

// Surah Metadata Schema
export const SurahMetadataSchema = z.object({
  number: z.number().min(1).max(114).describe('Surah number (1-114)'),
  name: z.string().describe('Surah name in transliteration'),
  arabicName: z.string().describe('Surah name in Arabic'),
  ayahCount: z.number().describe('Total number of ayahs in this surah'),
});

export const SurahListResponseSchema = z.array(SurahMetadataSchema);

// Verse in Surah Schema
export const VerseSchema = z.object({
  ayah: z.number().describe('Ayah number'),
  page: z.number().describe('Page number in Mushaf'),
  juz: z.number().describe('Juz number'),
  text: z.string().describe('Verse text in Uthmani script'),
});

export const SurahResponseSchema = z.object({
  surah: z.number().describe('Surah number'),
  name: z.string().describe('Surah name'),
  arabicName: z.string().describe('Surah name in Arabic'),
  ayahCount: z.number().describe('Total ayahs'),
  verses: z.array(VerseSchema).describe('Array of verses'),
});

// Query Params
export const SurahParamsSchema = z.object({
  surah: z.coerce.number().min(1).max(114),
});

export const SurahQuerySchema = z.object({
  qiraat: z.string().optional().describe('Filter by Qiraat slug (e.g., hafs, warsh)'),
});

// Types
export type SurahMetadata = z.infer<typeof SurahMetadataSchema>;
export type SurahResponse = z.infer<typeof SurahResponseSchema>;
export type Verse = z.infer<typeof VerseSchema>;
