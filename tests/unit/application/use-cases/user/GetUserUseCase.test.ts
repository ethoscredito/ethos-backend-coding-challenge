import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GetUserUseCase } from '../../../../../src/application/use-cases/user/GetUserUseCase';
import { IUserRepository } from '../../../../../src/domain/repositories/IUserRepository';
import { User } from '../../../../../src/domain/entities/User';
import { Email } from '../../../../../src/domain/value-objects/Email';
import { UserId } from '../../../../../src/domain/value-objects/UserId';
import { UserNotFoundError } from '../../../../../src/domain/errors/UserNotFoundError';

describe('GetUserUseCase', () => {
  let getUserUseCase: GetUserUseCase;
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

    getUserUseCase = new GetUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('should successfully get a user by id', async () => {
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

      const result = await getUserUseCase.execute({ id: userId.toString() });

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        id: userId.toString(),
        email: 'test@example.com',
        name: 'Test User',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      const userId = UserId.generate();

      (mockUserRepository.findById as any).mockResolvedValue(null);

      await expect(getUserUseCase.execute({ id: userId.toString() }))
        .rejects.toThrow(UserNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw error for invalid user id format', async () => {
      const invalidId = 'not-a-uuid';

      await expect(getUserUseCase.execute({ id: invalidId }))
        .rejects.toThrow('Invalid UUID format');

      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });
  });
});
