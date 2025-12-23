import { describe, it, expect, vi } from 'vitest';
import { GetComparisonUseCase } from '../../../src/usecases/GetComparisonUseCase';
import { IComparisonRepository } from '../../../src/repositories/ComparisonRepository';

describe('GetComparisonUseCase', () => {
    it('should return comparison data when found', async () => {
        const mockRepo: IComparisonRepository = {
            getComparison: vi.fn().mockResolvedValue({ surah: 1, ayah: 1, variants: {} })
        };

        const useCase = new GetComparisonUseCase(mockRepo);
        const result = await useCase.execute(1, 1);

        expect(result).toEqual({ surah: 1, ayah: 1, variants: {} });
        expect(mockRepo.getComparison).toHaveBeenCalledWith(1, 1);
    });

    it('should throw error when not found', async () => {
        const mockRepo: IComparisonRepository = {
            getComparison: vi.fn().mockResolvedValue(null)
        };

        const useCase = new GetComparisonUseCase(mockRepo);

        await expect(useCase.execute(1, 1)).rejects.toThrow('Verse not found: Surah 1, Ayah 1');
    });
});
