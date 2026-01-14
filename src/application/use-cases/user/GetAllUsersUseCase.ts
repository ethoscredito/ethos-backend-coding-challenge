import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserResponseDTO } from '../../dtos/user/UserResponseDTO';

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();

    return users.map(user => ({
      id: user.id.toString(),
      email: user.email.value,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
