import { FastifyInstance } from 'fastify';
import { ComparisonRepository } from './repositories/ComparisonRepository';
import { GetComparisonUseCase } from './usecases/GetComparisonUseCase';
import { ComparisonController } from './controllers/ComparisonController';

export default async function apiRoutes(fastify: FastifyInstance) {
  // Dependency Injection Layer
  const comparisonRepo = new ComparisonRepository();
  const getComparisonUseCase = new GetComparisonUseCase(comparisonRepo);
  const comparisonController = new ComparisonController(getComparisonUseCase);

  // Routes
  fastify.get('/compare', async (req, reply) => {
    // Cast strict type for generic handling in controller if needed, 
    // but Controller expects specific types which is fine.
    // We pass req and reply directly.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return comparisonController.getComparison(req as any, reply);
  });
}
