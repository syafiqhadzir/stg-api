import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSurahsUseCase } from '../../../src/usecases/GetSurahsUseCase';
import { ISurahRepository } from '../../../src/repositories/SurahRepository';

const mockSurahRepo = {
    getAllSurahs: vi.fn(),
    getSurah: vi.fn(),
} as unknown as ISurahRepository;

describe('GetSurahsUseCase', () => {
    let useCase: GetSurahsUseCase;

    beforeEach(() => {
        useCase = new GetSurahsUseCase(mockSurahRepo);
        vi.clearAllMocks();
    });

    it('should return all surahs from repository', async () => {
        const mockSurahs = [
            { number: 1, name: 'Al-Fatiha', arabicName: 'الفاتحة', ayahCount: 7 },
        ];
        (mockSurahRepo.getAllSurahs as any).mockResolvedValue(mockSurahs);

        const result = await useCase.execute();

        expect(result).toEqual(mockSurahs);
        expect(mockSurahRepo.getAllSurahs).toHaveBeenCalledTimes(1);
    });
});
