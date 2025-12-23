import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSurahUseCase } from '../../../src/usecases/GetSurahUseCase';
import { ISurahRepository } from '../../../src/repositories/SurahRepository';

const mockSurahRepo = {
    getAllSurahs: vi.fn(),
    getSurah: vi.fn(),
} as unknown as ISurahRepository;

describe('GetSurahUseCase', () => {
    let useCase: GetSurahUseCase;

    beforeEach(() => {
        useCase = new GetSurahUseCase(mockSurahRepo);
        vi.clearAllMocks();
    });

    it('should return surah details when found', async () => {
        const mockSurah = {
            surah: 1,
            name: 'Al-Fatiha',
            arabicName: 'الفاتحة',
            ayahCount: 7,
            verses: [],
        };
        (mockSurahRepo.getSurah as any).mockResolvedValue(mockSurah);

        const result = await useCase.execute(1, 'hafs');

        expect(result).toEqual(mockSurah);
        expect(mockSurahRepo.getSurah).toHaveBeenCalledWith(1, 'hafs');
    });

    it('should throw error when surah not found', async () => {
        (mockSurahRepo.getSurah as any).mockResolvedValue(null);

        await expect(useCase.execute(999)).rejects.toThrow('Surah not found: 999');
    });
});
