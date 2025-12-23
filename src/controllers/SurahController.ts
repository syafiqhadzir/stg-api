import { FastifyRequest, FastifyReply } from 'fastify';
import { GetSurahsUseCase } from '../usecases/GetSurahsUseCase';
import { GetSurahUseCase } from '../usecases/GetSurahUseCase';

interface SurahParams {
  surah: number;
}

interface SurahQuery {
  qiraat?: string;
}

export class SurahController {
  constructor(
    private getSurahsUseCase: GetSurahsUseCase,
    private getSurahUseCase: GetSurahUseCase,
  ) {}

  async getAllSurahs(_req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.getSurahsUseCase.execute();
    reply.send(result);
  }

  async getSurah(
    req: FastifyRequest<{ Params: SurahParams; Querystring: SurahQuery }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const { surah } = req.params;
      const { qiraat } = req.query;
      const result = await this.getSurahUseCase.execute(surah, qiraat);
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
}
