import { ISurahRepository } from '../repositories/SurahRepository';
import { SurahResponse } from '../types/surah';

export class GetSurahUseCase {
  constructor(private surahRepo: ISurahRepository) {}

  async execute(surahNumber: number, qiraat?: string): Promise<SurahResponse> {
    const result = await this.surahRepo.getSurah(surahNumber, qiraat);

    if (!result) {
      throw new Error(`Surah not found: ${String(surahNumber)}`);
    }

    return result;
  }
}
