import { IQiraatRepository } from '../repositories/QiraatRepository';
import { QiraatMetadata } from '../types/qiraat';

export class GetQiraatUseCase {
  constructor(private qiraatRepo: IQiraatRepository) {}

  async execute(): Promise<QiraatMetadata[]> {
    return this.qiraatRepo.getAllQiraat();
  }
}
