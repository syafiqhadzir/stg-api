import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SurahRepository } from '../../../src/repositories/SurahRepository';
import * as db from '../../../src/db';

vi.mock('../../../src/db', () => ({
    query: vi.fn(),
}));

describe('SurahRepository', () => {
    let repo: SurahRepository;

    beforeEach(() => {
        repo = new SurahRepository();
        vi.clearAllMocks();
    });

    describe('getAllSurahs', () => {
        it('should return all surahs with metadata', async () => {
            // Mock first query: verses count
            (db.query as any)
                .mockResolvedValueOnce({
                    rows: [{ number: '1', ayahCount: '7' }],
                })
                // Mock second query: names
                .mockResolvedValueOnce({
                    rows: [{ surah_number: 1, name: 'Al-Fatiha', arabicName: 'الفاتحة' }],
                });

            const result = await repo.getAllSurahs();

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                number: 1,
                name: 'Al-Fatiha',
                arabicName: 'الفاتحة',
                ayahCount: 7,
            });
        });

        it('should handle missing metadata gracefully', async () => {
            (db.query as any)
                .mockResolvedValueOnce({
                    rows: [{ number: '2', ayahCount: '286' }],
                })
                .mockResolvedValueOnce({
                    rows: [], // No metadata found
                });

            const result = await repo.getAllSurahs();

            expect(result[0]).toEqual({
                number: 2,
                name: 'Surah 2',
                arabicName: '',
                ayahCount: 286,
            });
        });
    });

    describe('getSurah', () => {
        const mockMeta = {
            surah_number: 1,
            ayahCount: '7',
            name: 'Al-Fatiha',
            arabicName: 'الفاتحة',
        };

        const mockVerses = [
            { ayah: '1', page: '1', juz: '1', text: 'Bismillah' },
        ];

        it('should return surah with verses (default hafs)', async () => {
            // Meta query
            (db.query as any).mockResolvedValueOnce({
                rows: [mockMeta],
                rowCount: 1,
            });

            // Verses query
            (db.query as any).mockResolvedValueOnce({
                rows: mockVerses,
            });

            const result = await repo.getSurah(1);

            expect(result).not.toBeNull();
            expect(result?.name).toBe('Al-Fatiha');
            expect(result?.verses).toHaveLength(1);

            // Verify verses query used default 'hafs'
            const versesCall = (db.query as any).mock.calls[1];
            expect(versesCall[0]).toContain("q.slug = 'hafs'");
        });

        it('should return surah with verses for specific qiraat', async () => {
            (db.query as any).mockResolvedValueOnce({ rows: [mockMeta], rowCount: 1 });
            (db.query as any).mockResolvedValueOnce({ rows: mockVerses });

            await repo.getSurah(1, 'warsh');

            const versesCall = (db.query as any).mock.calls[1];
            expect(versesCall[1]).toContain('warsh');
        });

        it('should return null when surah not found (meta missing)', async () => {
            (db.query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 });

            const result = await repo.getSurah(999);
            expect(result).toBeNull();
        });
    });
});
