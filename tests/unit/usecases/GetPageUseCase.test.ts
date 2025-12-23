import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPageUseCase } from '../../../src/usecases/GetPageUseCase';
import { ISearchRepository } from '../../../src/repositories/SearchRepository';

const mockSearchRepo = {
    getVersesByJuz: vi.fn(),
    getVersesByPage: vi.fn(),
    searchText: vi.fn(),
} as unknown as ISearchRepository;

describe('GetPageUseCase', () => {
    let useCase: GetPageUseCase;

    beforeEach(() => {
        useCase = new GetPageUseCase(mockSearchRepo);
        vi.clearAllMocks();
    });

    it('should return page verses when found', async () => {
        const mockVerses = [{ surah: 1, ayah: 1, text: 'test', qiraat: 'hafs', page: 1, juz: 1 }];
        (mockSearchRepo.getVersesByPage as any).mockResolvedValue({ page: 1, verses: mockVerses });

        const result = await useCase.execute(1, 'hafs');

        expect(result).toEqual({ page: 1, verses: mockVerses });
        expect(mockSearchRepo.getVersesByPage).toHaveBeenCalledWith(1, 'hafs');
    });

    it('should throw error when no verses found', async () => {
        (mockSearchRepo.getVersesByPage as any).mockResolvedValue(null);

        await expect(useCase.execute(999)).rejects.toThrow('Page not found: 999');
    });
});
