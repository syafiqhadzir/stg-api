import { FastifyRequest, FastifyReply } from 'fastify';
import { GetJuzUseCase } from '../usecases/GetJuzUseCase';
import { GetPageUseCase } from '../usecases/GetPageUseCase';
import { SearchUseCase } from '../usecases/SearchUseCase';

interface JuzParams {
  juz: number;
}

interface PageParams {
  page: number;
}

interface VersesQuery {
  qiraat?: string;
}

interface SearchQuery {
  q: string;
  qiraat?: string;
  limit?: number;
}

export class SearchController {
  constructor(
    private getJuzUseCase: GetJuzUseCase,
    private getPageUseCase: GetPageUseCase,
    private searchUseCase: SearchUseCase,
  ) {}

  async getJuz(
    req: FastifyRequest<{ Params: JuzParams; Querystring: VersesQuery }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { juz } = req.params;
      const { qiraat } = req.query;
      const result = await this.getJuzUseCase.execute(juz, qiraat);
      reply.send(result);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: err.message,
        });
      } else {
        throw error;
      }
    }
  }

  async getPage(
    req: FastifyRequest<{ Params: PageParams; Querystring: VersesQuery }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { page } = req.params;
      const { qiraat } = req.query;
      const result = await this.getPageUseCase.execute(page, qiraat);
      reply.send(result);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: err.message,
        });
      } else {
        throw error;
      }
    }
  }

  async search(
    req: FastifyRequest<{ Querystring: SearchQuery }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { q, qiraat, limit } = req.query;
    const result = await this.searchUseCase.execute(q, qiraat, limit);
    reply.send(result);
  }
}
