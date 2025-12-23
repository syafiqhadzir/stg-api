import { FastifyInstance } from 'fastify';
import { ComparisonRepository } from './repositories/ComparisonRepository';
import { GetComparisonUseCase } from './usecases/GetComparisonUseCase';
import { ComparisonController } from './controllers/ComparisonController';

import { ComparisonQuerySchema, ComparisonResponseSchema, ErrorResponseSchema } from './types';

export default function apiRoutes(fastify: FastifyInstance) {
  // Dependency Injection Layer
  const comparisonRepo = new ComparisonRepository();
  const getComparisonUseCase = new GetComparisonUseCase(comparisonRepo);
  const comparisonController = new ComparisonController(getComparisonUseCase);

  // Routes
  fastify.get(
    '/compare',
    {
      schema: {
        tags: ['Comparison'],
        summary: 'Compare Quranic verse variants',
        description:
          "Retrieves the text of a specific verse (ayah) from multiple Qira'at (recitation variants). Returns the text, page number, and juz for each available recitation.",
        operationId: 'getComparison',
        querystring: ComparisonQuerySchema,
        response: {
          200: ComparisonResponseSchema,
          400: ErrorResponseSchema,
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return comparisonController.getComparison(req as any, reply);
    },
  );
}
