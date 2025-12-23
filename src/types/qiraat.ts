import { z } from 'zod';

// Qiraat Metadata Schema
export const QiraatMetadataSchema = z.object({
  slug: z.string().describe('URL-friendly identifier (e.g., hafs, warsh)'),
  name: z.string().describe('Full name of the Qiraat'),
  description: z.string().nullable().describe('Optional description'),
});

export const QiraatListResponseSchema = z.array(QiraatMetadataSchema);

// Types
export type QiraatMetadata = z.infer<typeof QiraatMetadataSchema>;
