import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { UserNotFoundError } from '../../../domain/errors/UserNotFoundError';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: { id: string }): Promise<void> {
    const userId = UserId.create(request.id);

    const deleted = await this.userRepository.delete(userId);
    if (!deleted) {
      throw new UserNotFoundError();
    }
  }
}
