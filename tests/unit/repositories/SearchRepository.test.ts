import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchRepository } from '../../../src/repositories/SearchRepository';
import * as db from '../../../src/db';

vi.mock('../../../src/db', () => ({
    query: vi.fn(),
}));

describe('SearchRepository', () => {
    let repo: SearchRepository;

    beforeEach(() => {
        repo = new SearchRepository();
        vi.clearAllMocks();
    });

    const mockVerses = [
        { surah: '1', ayah: '1', page: '1', juz: '1', text: 'Test' },
    ];

    describe('getVersesByJuz', () => {
        it('should return verses for juz (default hafs)', async () => {
            (db.query as any).mockResolvedValue({ rows: mockVerses });

            const result = await repo.getVersesByJuz(1);

            expect(result).not.toBeNull();
            expect(result?.juz).toBe(1);
            expect(result?.verses[0].text).toBe('Test');

            const call = (db.query as any).mock.calls[0];
            expect(call[0]).toContain("q.slug = 'hafs'");
        });

        it('should filter by qiraat', async () => {
            (db.query as any).mockResolvedValue({ rows: mockVerses });
            await repo.getVersesByJuz(1, 'warsh');

            const call = (db.query as any).mock.calls[0];
            expect(call[1]).toContain('warsh');
        });

        it('should return null if no verses found', async () => {
            (db.query as any).mockResolvedValue({ rows: [] });
            const result = await repo.getVersesByJuz(99);
            expect(result).toBeNull();
        });
    });

    describe('getVersesByPage', () => {
        it('should return verses for page', async () => {
            (db.query as any).mockResolvedValue({ rows: mockVerses });

            const result = await repo.getVersesByPage(1);
            expect(result).not.toBeNull();
            expect(result?.page).toBe(1);
        });

        it('should return null if not found', async () => {
            (db.query as any).mockResolvedValue({ rows: [] });
            const result = await repo.getVersesByPage(999);
            expect(result).toBeNull();
        });
    });

    describe('searchText', () => {
        it('should return search results', async () => {
            const mockResults = [
                { surah: '1', ayah: '1', text: 'Matched', qiraat: 'hafs' },
            ];
            (db.query as any).mockResolvedValue({ rows: mockResults });

            const result = await repo.searchText('query');

            expect(result.count).toBe(1);
            expect(result.results[0].text).toBe('Matched');
        });

        it('should filter search by qiraat', async () => {
            (db.query as any).mockResolvedValue({ rows: [] });
            await repo.searchText('query', 'warsh');

            const call = (db.query as any).mock.calls[0];
            expect(call[1]).toContain('warsh');
        });
    });
});
