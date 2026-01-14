import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DeleteUserUseCase } from '../../../../../src/application/use-cases/user/DeleteUserUseCase';
import { IUserRepository } from '../../../../../src/domain/repositories/IUserRepository';
import { UserId } from '../../../../../src/domain/value-objects/UserId';
import { UserNotFoundError } from '../../../../../src/domain/errors/UserNotFoundError';

describe('DeleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase;
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

    deleteUserUseCase = new DeleteUserUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('should successfully delete a user', async () => {
      const userId = UserId.generate();

      (mockUserRepository.delete as any).mockResolvedValue(true);

      await deleteUserUseCase.execute({ id: userId.toString() });

      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      const userId = UserId.generate();

      (mockUserRepository.delete as any).mockResolvedValue(false);

      await expect(deleteUserUseCase.execute({ id: userId.toString() }))
        .rejects.toThrow(UserNotFoundError);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw error for invalid user id format', async () => {
      const invalidId = 'not-a-uuid';

      await expect(deleteUserUseCase.execute({ id: invalidId }))
        .rejects.toThrow('Invalid UUID format');

      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });
});
