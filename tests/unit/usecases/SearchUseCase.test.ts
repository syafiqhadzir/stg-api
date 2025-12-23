import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchUseCase } from '../../../src/usecases/SearchUseCase';
import { ISearchRepository } from '../../../src/repositories/SearchRepository';

const mockSearchRepo = {
    getVersesByJuz: vi.fn(),
    getVersesByPage: vi.fn(),
    searchText: vi.fn(),
} as unknown as ISearchRepository;

describe('SearchUseCase', () => {
    let useCase: SearchUseCase;

    beforeEach(() => {
        useCase = new SearchUseCase(mockSearchRepo);
        vi.clearAllMocks();
    });

    it('should return search results', async () => {
        const mockResults = [{ surah: 1, ayah: 1, text: 'test', qiraat: 'hafs' }];
        (mockSearchRepo.searchText as any).mockResolvedValue({
            query: 'query',
            count: 1,
            results: mockResults,
        });

        const result = await useCase.execute('query', 'hafs', 10);

        expect(result).toEqual({
            query: 'query',
            count: 1,
            results: mockResults,
        });
        expect(mockSearchRepo.searchText).toHaveBeenCalledWith('query', 'hafs', 10);
    });
});
