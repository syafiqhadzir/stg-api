import { query } from '../db';
import { ComparisonResponse, ComparisonMatrix } from '../types';

export interface IComparisonRepository {
  getComparison(surah: number, ayah: number): Promise<ComparisonResponse | null>;
}

export class ComparisonRepository implements IComparisonRepository {
  async getComparison(surah: number, ayah: number): Promise<ComparisonResponse | null> {
    const sql = `
      SELECT 
        surah_number as surah, 
        ayah_number as ayah, 
        variants 
      FROM mv_comparison_matrix 
      WHERE surah_number = $1 AND ayah_number = $2
    `;

    const result = await query(sql, [surah, ayah]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      surah: Number(row.surah),
      ayah: Number(row.ayah),
      variants: row.variants as ComparisonMatrix,
    };
  }
}
