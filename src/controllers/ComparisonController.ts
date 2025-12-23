import { FastifyRequest, FastifyReply } from 'fastify';
import { GetComparisonUseCase } from '../usecases/GetComparisonUseCase';
import { ComparisonQuery } from '../types';

export class ComparisonController {
  constructor(private getComparisonUseCase: GetComparisonUseCase) {}

  async getComparison(
    req: FastifyRequest<{ Querystring: ComparisonQuery }>,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      // 1. Validate Input (Handled by Route Schema)
      const { surah, ayah } = req.query;

      // 2. Execute Use Case
      const result = await this.getComparisonUseCase.execute(surah, ayah);

      // 3. Return Response
      reply.send(result);
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message.includes('Verse not found')) {
        reply.status(404).send({ statusCode: 404, error: 'Not Found', message: err.message });
      } else {
        throw error; // Pass to global handler
      }
    }
  }
}
