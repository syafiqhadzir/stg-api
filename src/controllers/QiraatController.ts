import { FastifyRequest, FastifyReply } from 'fastify';
import { GetQiraatUseCase } from '../usecases/GetQiraatUseCase';

export class QiraatController {
  constructor(private getQiraatUseCase: GetQiraatUseCase) {}

  async getAllQiraat(_req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.getQiraatUseCase.execute();
    reply.send(result);
  }
}
