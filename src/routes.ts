import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { query } from './db';
import NodeCache from 'node-cache';

const router = Router();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

const CompareRequestSchema = z.object({
  surah: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0 && val <= 114, {
    message: "Invalid Surah number",
  }),
  ayah: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, {
    message: "Invalid Ayah number",
  }),
});

router.get('/qiraat/compare', async (req: Request, res: Response) => {
  try {
    const { surah, ayah } = CompareRequestSchema.parse(req.query);
    const cacheKey = `compare_${surah}_${ayah}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Fetch Base (Hafs)
    const baseQuery = `
      SELECT id, sura_no, aya_no, sura_name_en, sura_name_ar, text_uthmani, text_emlaey
      FROM quran_verses
      WHERE sura_no = $1 AND aya_no = $2;
    `;
    const baseRes = await query(baseQuery, [surah, ayah]);

    if (baseRes.rows.length === 0) {
      return res.status(404).json({ error: "Verse not found" });
    }

    const baseData = baseRes.rows[0];

    // Fetch Variants
    const variantsQuery = `
      SELECT v.name, r.text
      FROM recitations r
      JOIN qiraat_variants v ON r.variant_id = v.id
      WHERE r.verse_id = $1;
    `;
    const variantsRes = await query(variantsQuery, [baseData.id]);

    // Construct Response
    const recitations = [
      { name: "Hafs", text: baseData.text_uthmani }, // Include Hafs in list
      ...variantsRes.rows
    ];

    const responseData = {
      meta: {
        surah: baseData.sura_no,
        ayah: baseData.aya_no,
        surah_name_en: baseData.sura_name_en,
        surah_name_ar: baseData.sura_name_ar,
        base_text_emlaey: baseData.text_emlaey
      },
      recitations
    };

    cache.set(cacheKey, responseData);
    res.json(responseData);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
