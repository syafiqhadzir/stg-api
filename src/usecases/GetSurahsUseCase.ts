import { ISurahRepository } from '../repositories/SurahRepository';
import { SurahMetadata } from '../types/surah';

export class GetSurahsUseCase {
  constructor(private surahRepo: ISurahRepository) {}

  async execute(): Promise<SurahMetadata[]> {
    return this.surahRepo.getAllSurahs();
  }
}
