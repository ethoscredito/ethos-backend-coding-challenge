import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserResponseDTO } from '../../dtos/user/UserResponseDTO';
import { UserId } from '../../../domain/value-objects/UserId';
import { UserNotFoundError } from '../../../domain/errors/UserNotFoundError';

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: { id: string }): Promise<UserResponseDTO> {
    const userId = UserId.create(request.id);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      id: user.id.toString(),
      email: user.email.value,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
