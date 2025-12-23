import { query } from '../db';
import { SurahMetadata, SurahResponse } from '../types/surah';

export interface ISurahRepository {
  getAllSurahs(): Promise<SurahMetadata[]>;
  getSurah(surahNumber: number, qiraat?: string): Promise<SurahResponse | null>;
}

export class SurahRepository implements ISurahRepository {
  async getAllSurahs(): Promise<SurahMetadata[]> {
    const sql = `
      SELECT 
        surah_number as number,
        COUNT(*) as "ayahCount"
      FROM quran_verses
      GROUP BY surah_number
      ORDER BY surah_number
    `;

    const result = await query(sql, []);

    // Get surah names from first verse of each surah (from metadata or recitation_texts)
    const namesQuery = `
      SELECT DISTINCT ON (v.surah_number)
        v.surah_number,
        COALESCE(r.metadata->>'sura_name_en', 'Surah ' || v.surah_number) as name,
        COALESCE(r.metadata->>'sura_name_ar', '') as "arabicName"
      FROM quran_verses v
      LEFT JOIN recitation_texts r ON r.verse_id = v.id
      WHERE v.ayah_number = 1
      ORDER BY v.surah_number, r.id
    `;

    const namesResult = await query(namesQuery, []);
    const namesMap = new Map(
      namesResult.rows.map((row: { surah_number: number; name: string; arabicName: string }) => [
        row.surah_number,
        { name: row.name, arabicName: row.arabicName },
      ]),
    );

    return result.rows.map((row: { number: string; ayahCount: string }) => ({
      number: Number(row.number),
      name: namesMap.get(Number(row.number))?.name ?? `Surah ${row.number}`,
      arabicName: namesMap.get(Number(row.number))?.arabicName ?? '',
      ayahCount: Number(row.ayahCount),
    }));
  }

  async getSurah(surahNumber: number, qiraat?: string): Promise<SurahResponse | null> {
    // Get surah metadata
    const metaQuery = `
      SELECT 
        v.surah_number,
        COUNT(*) as "ayahCount",
        COALESCE(r.metadata->>'sura_name_en', 'Surah ' || v.surah_number) as name,
        COALESCE(r.metadata->>'sura_name_ar', '') as "arabicName"
      FROM quran_verses v
      LEFT JOIN recitation_texts r ON r.verse_id = v.id AND v.ayah_number = 1
      WHERE v.surah_number = $1
      GROUP BY v.surah_number, r.metadata->>'sura_name_en', r.metadata->>'sura_name_ar'
      LIMIT 1
    `;

    const metaResult = await query(metaQuery, [surahNumber]);
    if (metaResult.rows.length === 0) {
      return null;
    }

    const meta = metaResult.rows[0];

    // Get verses
    let versesQuery = `
      SELECT 
        v.ayah_number as ayah,
        v.page_number as page,
        v.juz_number as juz,
        r.text_uthmani as text
      FROM quran_verses v
      JOIN recitation_texts r ON r.verse_id = v.id
      JOIN qiraat_metadata q ON q.id = r.qiraat_id
      WHERE v.surah_number = $1
    `;

    const params: (number | string)[] = [surahNumber];

    if (qiraat) {
      versesQuery += ` AND q.slug = $2`;
      params.push(qiraat);
    } else {
      versesQuery += ` AND q.slug = 'hafs'`; // Default to Hafs
    }

    versesQuery += ` ORDER BY v.ayah_number`;

    const versesResult = await query(versesQuery, params);

    return {
      surah: surahNumber,
      name: meta.name as string,
      arabicName: meta.arabicName as string,
      ayahCount: Number(meta.ayahCount),
      verses: versesResult.rows.map(
        (row: { ayah: string; page: string; juz: string; text: string }) => ({
          ayah: Number(row.ayah),
          page: Number(row.page),
          juz: Number(row.juz),
          text: row.text,
        }),
      ),
    };
  }
}
