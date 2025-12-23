import { IComparisonRepository } from '../repositories/ComparisonRepository';
import { ComparisonResponse } from '../types';

export class GetComparisonUseCase {
  constructor(private comparisonRepo: IComparisonRepository) {}

  async execute(surah: number, ayah: number): Promise<ComparisonResponse> {
    const data = await this.comparisonRepo.getComparison(surah, ayah);

    if (!data) {
      throw new Error(`Verse not found: Surah ${String(surah)}, Ayah ${String(ayah)}`);
    }

    return data;
  }
}
