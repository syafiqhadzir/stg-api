import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetJuzUseCase } from '../../../src/usecases/GetJuzUseCase';
import { ISearchRepository } from '../../../src/repositories/SearchRepository';

const mockSearchRepo = {
    getVersesByJuz: vi.fn(),
    getVersesByPage: vi.fn(),
    searchText: vi.fn(),
} as unknown as ISearchRepository;

describe('GetJuzUseCase', () => {
    let useCase: GetJuzUseCase;

    beforeEach(() => {
        useCase = new GetJuzUseCase(mockSearchRepo);
        vi.clearAllMocks();
    });

    it('should return juz verses when found', async () => {
        const mockVerses = [{ surah: 1, ayah: 1, text: 'test', qiraat: 'hafs', page: 1, juz: 1 }];
        (mockSearchRepo.getVersesByJuz as any).mockResolvedValue({ juz: 1, verses: mockVerses });

        const result = await useCase.execute(1, 'hafs');

        expect(result).toEqual({ juz: 1, verses: mockVerses });
        expect(mockSearchRepo.getVersesByJuz).toHaveBeenCalledWith(1, 'hafs');
    });

    it('should throw error when no verses found', async () => {
        (mockSearchRepo.getVersesByJuz as any).mockResolvedValue(null);

        await expect(useCase.execute(31)).rejects.toThrow('Juz not found: 31');
    });
});
