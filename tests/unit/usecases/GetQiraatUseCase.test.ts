import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetQiraatUseCase } from '../../../src/usecases/GetQiraatUseCase';
import { IQiraatRepository } from '../../../src/repositories/QiraatRepository';

const mockQiraatRepo = {
    getAllQiraat: vi.fn(),
} as unknown as IQiraatRepository;

describe('GetQiraatUseCase', () => {
    let useCase: GetQiraatUseCase;

    beforeEach(() => {
        useCase = new GetQiraatUseCase(mockQiraatRepo);
        vi.clearAllMocks();
    });

    it('should return all qiraat from repository', async () => {
        const mockQiraat = [{ slug: 'hafs', name: 'Hafs', description: null }];
        (mockQiraatRepo.getAllQiraat as any).mockResolvedValue(mockQiraat);

        const result = await useCase.execute();

        expect(result).toEqual(mockQiraat);
        expect(mockQiraatRepo.getAllQiraat).toHaveBeenCalledTimes(1);
    });
});
