import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { LoginUseCase } from '../../../../../src/application/use-cases/auth/LoginUseCase';
import { IUserRepository } from '../../../../../src/domain/repositories/IUserRepository';
import { ITokenService } from '../../../../../src/application/ports/ITokenService';
import { User } from '../../../../../src/domain/entities/User';
import { Email } from '../../../../../src/domain/value-objects/Email';
import { Password } from '../../../../../src/domain/value-objects/Password';
import { UserId } from '../../../../../src/domain/value-objects/UserId';
import { InvalidCredentialsError } from '../../../../../src/domain/errors/InvalidCredentialsError';
import { UserNotFoundError } from '../../../../../src/domain/errors/UserNotFoundError';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let mockUserRepository: IUserRepository;
  let mockTokenService: ITokenService;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn() as any,
      findByEmail: jest.fn() as any,
      findAll: jest.fn() as any,
      save: jest.fn() as any,
      delete: jest.fn() as any,
      existsByEmail: jest.fn() as any,
    };

    mockTokenService = {
      generateToken: jest.fn() as any,
      verifyToken: jest.fn() as any,
    };

    loginUseCase = new LoginUseCase(mockUserRepository, mockTokenService);
  });

  describe('execute', () => {
    it('should successfully login with valid credentials', async () => {
      
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await Password.create(password).hash();

      const user = User.reconstitute(
        UserId.generate(),
        Email.create(email),
        'Test User',
        hashedPassword,
        new Date(),
        new Date()
      );

      const token = 'jwt-token-123';

      (mockUserRepository.findByEmail as any).mockResolvedValue(user);
      (mockTokenService.generateToken as any).mockReturnValue(token);

      
      const result = await loginUseCase.execute({ email, password });

      
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(Email.create(email));
      expect(mockTokenService.generateToken).toHaveBeenCalledWith({
        userId: user.id.toString(),
        email: user.email.toString(),
      });
      expect(result).toEqual({
        token,
        user: {
          id: user.id.toString(),
          email: user.email.toString(),
          name: user.name,
        },
      });
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      
      const email = 'nonexistent@example.com';
      const password = 'password123';

      (mockUserRepository.findByEmail as any).mockResolvedValue(null);

      
      await expect(loginUseCase.execute({ email, password }))
        .rejects.toThrow(UserNotFoundError);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(Email.create(email));
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw InvalidCredentialsError when password is incorrect', async () => {
      
      const email = 'test@example.com';
      const correctPassword = 'password123';
      const incorrectPassword = 'wrongpassword';
      const hashedPassword = await Password.create(correctPassword).hash();

      const user = User.reconstitute(
        UserId.generate(),
        Email.create(email),
        'Test User',
        hashedPassword,
        new Date(),
        new Date()
      );

      (mockUserRepository.findByEmail as any).mockResolvedValue(user);

      
      await expect(loginUseCase.execute({ email, password: incorrectPassword }))
        .rejects.toThrow(InvalidCredentialsError);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(Email.create(email));
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      
      const invalidEmail = 'not-an-email';
      const password = 'password123';

      
      await expect(loginUseCase.execute({ email: invalidEmail, password }))
        .rejects.toThrow('Invalid email format');
    });
  });
});
