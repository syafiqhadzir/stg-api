import { query } from '../db';
import { JuzResponse, PageResponse, SearchResponse, SearchResult } from '../types/search';

export interface ISearchRepository {
  getVersesByJuz(juz: number, qiraat?: string): Promise<JuzResponse | null>;
  getVersesByPage(page: number, qiraat?: string): Promise<PageResponse | null>;
  searchText(q: string, qiraat?: string, limit?: number): Promise<SearchResponse>;
}

export class SearchRepository implements ISearchRepository {
  async getVersesByJuz(juz: number, qiraat?: string): Promise<JuzResponse | null> {
    let sql = `
      SELECT 
        v.surah_number as surah,
        v.ayah_number as ayah,
        v.page_number as page,
        v.juz_number as juz,
        r.text_uthmani as text
      FROM quran_verses v
      JOIN recitation_texts r ON r.verse_id = v.id
      JOIN qiraat_metadata q ON q.id = r.qiraat_id
      WHERE v.juz_number = $1
    `;

    const params: (number | string)[] = [juz];

    if (qiraat) {
      sql += ` AND q.slug = $2`;
      params.push(qiraat);
    } else {
      sql += ` AND q.slug = 'hafs'`;
    }

    sql += ` ORDER BY v.surah_number, v.ayah_number`;

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return null;
    }

    return {
      juz,
      verses: result.rows.map(
        (row: { surah: string; ayah: string; page: string; juz: string; text: string }) => ({
          surah: Number(row.surah),
          ayah: Number(row.ayah),
          page: Number(row.page),
          juz: Number(row.juz),
          text: row.text,
        }),
      ),
    };
  }

  async getVersesByPage(page: number, qiraat?: string): Promise<PageResponse | null> {
    let sql = `
      SELECT 
        v.surah_number as surah,
        v.ayah_number as ayah,
        v.page_number as page,
        v.juz_number as juz,
        r.text_uthmani as text
      FROM quran_verses v
      JOIN recitation_texts r ON r.verse_id = v.id
      JOIN qiraat_metadata q ON q.id = r.qiraat_id
      WHERE v.page_number = $1
    `;

    const params: (number | string)[] = [page];

    if (qiraat) {
      sql += ` AND q.slug = $2`;
      params.push(qiraat);
    } else {
      sql += ` AND q.slug = 'hafs'`;
    }

    sql += ` ORDER BY v.surah_number, v.ayah_number`;

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return null;
    }

    return {
      page,
      verses: result.rows.map(
        (row: { surah: string; ayah: string; page: string; juz: string; text: string }) => ({
          surah: Number(row.surah),
          ayah: Number(row.ayah),
          page: Number(row.page),
          juz: Number(row.juz),
          text: row.text,
        }),
      ),
    };
  }

  async searchText(q: string, qiraat?: string, limit = 20): Promise<SearchResponse> {
    let sql = `
      SELECT 
        v.surah_number as surah,
        v.ayah_number as ayah,
        r.text_uthmani as text,
        q.slug as qiraat,
        similarity(r.text_uthmani, $1) as score
      FROM recitation_texts r
      JOIN quran_verses v ON v.id = r.verse_id
      JOIN qiraat_metadata q ON q.id = r.qiraat_id
      WHERE r.text_uthmani % $1
    `;

    const params: (string | number)[] = [q];
    let paramIndex = 2;

    if (qiraat) {
      sql += ` AND q.slug = $${String(paramIndex)}`;
      params.push(qiraat);
      paramIndex++;
    }

    sql += ` ORDER BY score DESC LIMIT $${String(paramIndex)}`;
    params.push(limit);

    const result = await query(sql, params);

    const results: SearchResult[] = result.rows.map(
      (row: { surah: string; ayah: string; text: string; qiraat: string }) => ({
        surah: Number(row.surah),
        ayah: Number(row.ayah),
        text: row.text,
        qiraat: row.qiraat,
      }),
    );

    return {
      query: q,
      count: results.length,
      results,
    };
  }
}
