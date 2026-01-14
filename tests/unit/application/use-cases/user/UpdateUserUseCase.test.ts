import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UpdateUserUseCase } from '../../../../../src/application/use-cases/user/UpdateUserUseCase';
import { IUserRepository } from '../../../../../src/domain/repositories/IUserRepository';
import { User } from '../../../../../src/domain/entities/User';
import { Email } from '../../../../../src/domain/value-objects/Email';
import { UserId } from '../../../../../src/domain/value-objects/UserId';
import { UserNotFoundError } from '../../../../../src/domain/errors/UserNotFoundError';
import { Password } from '../../../../../src/domain/value-objects/Password';

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
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

    updateUserUseCase = new UpdateUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('should successfully update user name', async () => {
      const userId = UserId.generate();
      const user = User.reconstitute(
        userId,
        Email.create('test@example.com'),
        'Old Name',
        'hashedPassword',
        new Date(),
        new Date()
      );

      (mockUserRepository.findById as any).mockResolvedValue(user);
      (mockUserRepository.save as any).mockImplementation(async (user: User) => user);

      const result = await updateUserUseCase.execute({
        id: userId.toString(),
        name: 'New Name',
      });

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('New Name');
      expect(result.email).toBe('test@example.com');
    });

    it('should successfully update user password', async () => {
      const userId = UserId.generate();
      const oldPassword = await Password.create('oldpassword123').hash();
      const user = User.reconstitute(
        userId,
        Email.create('test@example.com'),
        'Test User',
        oldPassword,
        new Date(),
        new Date()
      );

      let savedUser: User | null = null;
      (mockUserRepository.findById as any).mockResolvedValue(user);
      (mockUserRepository.save as any).mockImplementation(async (user: User) => {
        savedUser = user;
        return user;
      });

      const result = await updateUserUseCase.execute({
        id: userId.toString(),
        password: 'newpassword123',
      });

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(savedUser).toBeDefined();
      expect(savedUser!.hashedPassword).not.toBe(oldPassword);
      expect(savedUser!.hashedPassword).toMatch(/^\$2[aby]\$/);
    });

    it('should successfully update both name and password', async () => {
      const userId = UserId.generate();
      const user = User.reconstitute(
        userId,
        Email.create('test@example.com'),
        'Old Name',
        'hashedPassword',
        new Date(),
        new Date()
      );

      (mockUserRepository.findById as any).mockResolvedValue(user);
      (mockUserRepository.save as any).mockImplementation(async (user: User) => user);

      const result = await updateUserUseCase.execute({
        id: userId.toString(),
        name: 'New Name',
        password: 'newpassword123',
      });

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('New Name');
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      const userId = UserId.generate();

      (mockUserRepository.findById as any).mockResolvedValue(null);

      await expect(updateUserUseCase.execute({
        id: userId.toString(),
        name: 'New Name',
      })).rejects.toThrow(UserNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid user id format', async () => {
      const invalidId = 'not-a-uuid';

      await expect(updateUserUseCase.execute({
        id: invalidId,
        name: 'New Name',
      })).rejects.toThrow('Invalid UUID format');

      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for empty name', async () => {
      const userId = UserId.generate();
      const user = User.reconstitute(
        userId,
        Email.create('test@example.com'),
        'Test User',
        'hashedPassword',
        new Date(),
        new Date()
      );

      (mockUserRepository.findById as any).mockResolvedValue(user);

      await expect(updateUserUseCase.execute({
        id: userId.toString(),
        name: '',
      })).rejects.toThrow('User name cannot be empty');

      expect(mockUserRepository.findById).toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid password (less than 8 characters)', async () => {
      const userId = UserId.generate();
      const user = User.reconstitute(
        userId,
        Email.create('test@example.com'),
        'Test User',
        'hashedPassword',
        new Date(),
        new Date()
      );

      (mockUserRepository.findById as any).mockResolvedValue(user);

      await expect(updateUserUseCase.execute({
        id: userId.toString(),
        password: 'short',
      })).rejects.toThrow('Password must be at least 8 characters long');

      expect(mockUserRepository.findById).toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should not update when no fields provided', async () => {
      const userId = UserId.generate();
      const user = User.reconstitute(
        userId,
        Email.create('test@example.com'),
        'Test User',
        'hashedPassword',
        new Date(),
        new Date()
      );

      (mockUserRepository.findById as any).mockResolvedValue(user);
      (mockUserRepository.save as any).mockImplementation(async (user: User) => user);

      const result = await updateUserUseCase.execute({
        id: userId.toString(),
      });

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Test User');
    });
  });
});
