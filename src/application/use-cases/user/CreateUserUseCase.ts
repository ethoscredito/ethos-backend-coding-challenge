import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { CreateUserDTO } from '../../dtos/user/CreateUserDTO';
import { UserResponseDTO } from '../../dtos/user/UserResponseDTO';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { User } from '../../../domain/entities/User';
import { DomainError } from '../../../domain/errors/DomainError';

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: CreateUserDTO): Promise<UserResponseDTO> {
    const email = Email.create(request.email);
    const password = Password.create(request.password);

    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      throw new DomainError('Email already in use');
    }

    const user = await User.create(email, request.name, password);

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
