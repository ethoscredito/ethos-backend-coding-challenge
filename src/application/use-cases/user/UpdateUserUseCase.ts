import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UpdateUserDTO } from '../../dtos/user/UpdateUserDTO';
import { UserResponseDTO } from '../../dtos/user/UserResponseDTO';
import { UserId } from '../../../domain/value-objects/UserId';
import { Password } from '../../../domain/value-objects/Password';
import { UserNotFoundError } from '../../../domain/errors/UserNotFoundError';
import { Email } from '../../../domain/value-objects/Email';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: UpdateUserDTO & { id: string }): Promise<UserResponseDTO> {
    const userId = UserId.create(request.id);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (request.name !== undefined) {
      user.updateProfile(user.email, request.name);
    }

    if (request.password !== undefined) {
      const password = Password.create(request.password);
      await user.updatePassword(password);
    }

    await this.userRepository.save(user);

    return {
      id: user.id.toString(),
      email: user.email.value,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
