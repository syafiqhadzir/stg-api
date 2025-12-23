import { FastifyRequest, FastifyReply } from 'fastify';
import { GetComparisonUseCase } from '../usecases/GetComparisonUseCase';
import { ComparisonQuerySchema, ComparisonQuery } from '../types';

export class ComparisonController {
    constructor(private getComparisonUseCase: GetComparisonUseCase) { }

    async getComparison(
        req: FastifyRequest<{ Querystring: ComparisonQuery }>,
        reply: FastifyReply
    ): Promise<void> {
        try {
            // 1. Validate Input (Fastify validation is usually done in route schema, but doing here for strict control if mapped manually)
            const validationResult = ComparisonQuerySchema.safeParse(req.query);

            if (!validationResult.success) {
                reply.status(400).send({
                    error: 'Validation Error',
                    details: validationResult.error.format()
                });
                return;
            }

            const { surah, ayah } = validationResult.data;

            // 2. Execute Use Case
            const result = await this.getComparisonUseCase.execute(surah, ayah);

            // 3. Return Response
            reply.send(result);

        } catch (error: unknown) {
            const err = error as Error;
            if (err.message.includes('Verse not found')) {
                reply.status(404).send({ error: err.message });
            } else {
                throw error; // Pass to global handler
            }
        }
    }
}

