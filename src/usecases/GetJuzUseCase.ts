import { ISearchRepository } from '../repositories/SearchRepository';
import { JuzResponse } from '../types/search';

export class GetJuzUseCase {
  constructor(private searchRepo: ISearchRepository) {}

  async execute(juz: number, qiraat?: string): Promise<JuzResponse> {
    const result = await this.searchRepo.getVersesByJuz(juz, qiraat);

    if (!result) {
      throw new Error(`Juz not found: ${String(juz)}`);
    }

    return result;
  }
}
