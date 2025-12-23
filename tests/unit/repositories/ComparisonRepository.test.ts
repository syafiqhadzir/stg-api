import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComparisonRepository } from '../../../src/repositories/ComparisonRepository';
import * as db from '../../../src/db';

vi.mock('../../../src/db', () => ({
    query: vi.fn(),
    getClient: vi.fn(),
}));

describe('ComparisonRepository', () => {
    let repo: ComparisonRepository;

    beforeEach(() => {
        repo = new ComparisonRepository();
        vi.clearAllMocks();
    });

    it('should return comparison data when found', async () => {
        const mockRow = { surah: 1, ayah: 1, variants: { qiraat_hafs: 'test' } };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (db.query as any).mockResolvedValue({
            rows: [mockRow],
            rowCount: 1
        });

        const result = await repo.getComparison(1, 1);
        expect(result).toEqual(mockRow);
        expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [1, 1]);
    });

    it('should return null when not found', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (db.query as any).mockResolvedValue({
            rows: [],
            rowCount: 0
        });

        const result = await repo.getComparison(1, 1);
        expect(result).toBeNull();
    });
});
