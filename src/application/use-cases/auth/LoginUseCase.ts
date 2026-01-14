import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ITokenService } from '../../ports/ITokenService';
import { LoginRequestDTO } from '../../dtos/auth/LoginRequestDTO';
import { LoginResponseDTO } from '../../dtos/auth/LoginResponseDTO';
import { Email } from '../../../domain/value-objects/Email';
import { UserNotFoundError } from '../../../domain/errors/UserNotFoundError';
import { InvalidCredentialsError } from '../../../domain/errors/InvalidCredentialsError';

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(request: LoginRequestDTO): Promise<LoginResponseDTO> {
    const email = Email.create(request.email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }

    const isPasswordValid = await user.verifyPassword(request.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

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
