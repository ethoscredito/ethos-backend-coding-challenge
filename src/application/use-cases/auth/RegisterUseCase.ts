import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ITokenService } from '../../ports/ITokenService';
import { RegisterRequestDTO } from '../../dtos/auth/RegisterRequestDTO';
import { LoginResponseDTO } from '../../dtos/auth/LoginResponseDTO';
import { Email } from '../../../domain/value-objects/Email';
import { Password } from '../../../domain/value-objects/Password';
import { User } from '../../../domain/entities/User';
import { DomainError } from '../../../domain/errors/DomainError';

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(request: RegisterRequestDTO): Promise<LoginResponseDTO> {
    const email = Email.create(request.email);
    const password = Password.create(request.password);

    const emailExists = await this.userRepository.existsByEmail(email);
    if (emailExists) {
      throw new DomainError('Email already in use');
    }

    const user = await User.create(email, request.name, password);

    await this.userRepository.save(user);

    const token = this.tokenService.generateToken({
      userId: user.id.toString(),
      email: user.email.value,
    });

    return {
      token,
      user: {
        id: user.id.toString(),
        email: user.email.value,
        name: user.name,
      },
    };
  }
}
