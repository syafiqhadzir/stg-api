import { FastifyInstance } from 'fastify';
import { ComparisonRepository } from './repositories/ComparisonRepository';
import { GetComparisonUseCase } from './usecases/GetComparisonUseCase';
import { ComparisonController } from './controllers/ComparisonController';

import { ComparisonQuerySchema } from './types';

export default async function apiRoutes(fastify: FastifyInstance) {
  // Dependency Injection Layer
  const comparisonRepo = new ComparisonRepository();
  const getComparisonUseCase = new GetComparisonUseCase(comparisonRepo);
  const comparisonController = new ComparisonController(getComparisonUseCase);

  // Routes
  fastify.get(
    '/compare',
    {
      schema: {
        querystring: ComparisonQuerySchema,
      },
    },
    async (req, reply) => {
      return comparisonController.getComparison(req as any, reply);
    },
  );
}
