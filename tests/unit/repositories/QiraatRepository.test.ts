import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QiraatRepository } from '../../../src/repositories/QiraatRepository';
import * as db from '../../../src/db';

vi.mock('../../../src/db', () => ({
    query: vi.fn(),
}));

describe('QiraatRepository', () => {
    let repo: QiraatRepository;

    beforeEach(() => {
        repo = new QiraatRepository();
        vi.clearAllMocks();
    });

    describe('getAllQiraat', () => {
        it('should return all qiraat', async () => {
            const mockRows = [
                { slug: 'hafs', name: 'Hafs', description: 'Test' },
            ];
            (db.query as any).mockResolvedValue({ rows: mockRows });

            const result = await repo.getAllQiraat();

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockRows[0]);
        });
    });
});
