import { query } from '../db';
import { QiraatMetadata } from '../types/qiraat';

export interface IQiraatRepository {
  getAllQiraat(): Promise<QiraatMetadata[]>;
}

export class QiraatRepository implements IQiraatRepository {
  async getAllQiraat(): Promise<QiraatMetadata[]> {
    const sql = `
      SELECT 
        slug,
        name,
        description
      FROM qiraat_metadata
      ORDER BY slug
    `;

    const result = await query(sql, []);

    return result.rows.map((row: { slug: string; name: string; description: string | null }) => ({
      slug: row.slug,
      name: row.name,
      description: row.description,
    }));
  }
}
