import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { RegisterUseCase } from '../../../../../src/application/use-cases/auth/RegisterUseCase';
import { IUserRepository } from '../../../../../src/domain/repositories/IUserRepository';
import { ITokenService } from '../../../../../src/application/ports/ITokenService';
import { Email } from '../../../../../src/domain/value-objects/Email';
import { DomainError } from '../../../../../src/domain/errors/DomainError';
import { User } from '../../../../../src/domain/entities/User';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
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

    registerUseCase = new RegisterUseCase(mockUserRepository, mockTokenService);
  });

  describe('execute', () => {
    it('should successfully register a new user', async () => {
      
      const request = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      const token = 'jwt-token-123';

      (mockUserRepository.existsByEmail as any).mockResolvedValue(false);
      (mockUserRepository.save as any).mockImplementation(async (user: User) => user);
      (mockTokenService.generateToken as any).mockReturnValue(token);

      
      const result = await registerUseCase.execute(request);

      
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(Email.create(request.email));
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockTokenService.generateToken).toHaveBeenCalledWith({
        userId: expect.any(String),
        email: request.email,
      });
      expect(result).toEqual({
        token,
        user: {
          id: expect.any(String),
          email: request.email,
          name: request.name,
        },
      });
    });

    it('should throw error when email already exists', async () => {
      
      const request = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'password123',
      };

      (mockUserRepository.existsByEmail as any).mockResolvedValue(true);

      
      await expect(registerUseCase.execute(request))
        .rejects.toThrow(DomainError);
      await expect(registerUseCase.execute(request))
        .rejects.toThrow('Email already in use');

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(Email.create(request.email));
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockTokenService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      
      const request = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'password123',
      };

      
      await expect(registerUseCase.execute(request))
        .rejects.toThrow('Invalid email format');

      expect(mockUserRepository.existsByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid password (less than 8 characters)', async () => {
      
      const request = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'short',
      };

      
      await expect(registerUseCase.execute(request))
        .rejects.toThrow('Password must be at least 8 characters long');

      expect(mockUserRepository.existsByEmail).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for empty name', async () => {
      
      const request = {
        email: 'test@example.com',
        name: '',
        password: 'password123',
      };

      (mockUserRepository.existsByEmail as any).mockResolvedValue(false);

      
      await expect(registerUseCase.execute(request))
        .rejects.toThrow('User name cannot be empty');

      expect(mockUserRepository.existsByEmail).toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should hash the password before saving', async () => {
      
      const request = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      let savedUser: any;
      (mockUserRepository.existsByEmail as any).mockResolvedValue(false);
      (mockUserRepository.save as any).mockImplementation(async (user: User) => {
        savedUser = user;
        return user;
      });
      (mockTokenService.generateToken as any).mockReturnValue('token');

      
      await registerUseCase.execute(request);

      
      expect(savedUser).toBeDefined();
      expect(savedUser.hashedPassword).not.toBe(request.password);
      expect(savedUser.hashedPassword).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });
  });
});
