import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateUserUseCase } from '../../../../../src/application/use-cases/user/CreateUserUseCase';
import { IUserRepository } from '../../../../../src/domain/repositories/IUserRepository';
import { Email } from '../../../../../src/domain/value-objects/Email';
import { DomainError } from '../../../../../src/domain/errors/DomainError';
import { User } from '../../../../../src/domain/entities/User';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn() as any,
      findByEmail: jest.fn() as any,
      findAll: jest.fn() as any,
      save: jest.fn() as any,
      delete: jest.fn() as any,
      existsByEmail: jest.fn() as any,
    };

    createUserUseCase = new CreateUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('should successfully create a new user', async () => {
      const request = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      };

      (mockUserRepository.existsByEmail as any).mockResolvedValue(false);
      (mockUserRepository.save as any).mockImplementation(async (user: User) => user);

      const result = await createUserUseCase.execute(request);

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(Email.create(request.email));
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: expect.any(String),
        email: request.email,
        name: request.name,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw error when email already exists', async () => {
      const request = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'password123',
      };

      (mockUserRepository.existsByEmail as any).mockResolvedValue(true);

      await expect(createUserUseCase.execute(request))
        .rejects.toThrow(DomainError);
      await expect(createUserUseCase.execute(request))
        .rejects.toThrow('Email already in use');

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(Email.create(request.email));
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid email format', async () => {
      const request = {
        email: 'invalid-email',
        name: 'Test User',
        password: 'password123',
      };

      await expect(createUserUseCase.execute(request))
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

      await expect(createUserUseCase.execute(request))
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

      await expect(createUserUseCase.execute(request))
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

      await createUserUseCase.execute(request);

      expect(savedUser).toBeDefined();
      expect(savedUser.hashedPassword).not.toBe(request.password);
      expect(savedUser.hashedPassword).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });
  });
});
