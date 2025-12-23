import { ISearchRepository } from '../repositories/SearchRepository';
import { SearchResponse } from '../types/search';

export class SearchUseCase {
  constructor(private searchRepo: ISearchRepository) {}

  async execute(q: string, qiraat?: string, limit?: number): Promise<SearchResponse> {
    return this.searchRepo.searchText(q, qiraat, limit);
  }
}
