import { ISearchRepository } from '../repositories/SearchRepository';
import { PageResponse } from '../types/search';

export class GetPageUseCase {
  constructor(private searchRepo: ISearchRepository) {}

  async execute(page: number, qiraat?: string): Promise<PageResponse> {
    const result = await this.searchRepo.getVersesByPage(page, qiraat);

    if (!result) {
      throw new Error(`Page not found: ${String(page)}`);
    }

    return result;
  }
}
