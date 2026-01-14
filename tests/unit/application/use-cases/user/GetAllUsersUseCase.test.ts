import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GetAllUsersUseCase } from '../../../../../src/application/use-cases/user/GetAllUsersUseCase';
import { IUserRepository } from '../../../../../src/domain/repositories/IUserRepository';
import { User } from '../../../../../src/domain/entities/User';
import { Email } from '../../../../../src/domain/value-objects/Email';
import { UserId } from '../../../../../src/domain/value-objects/UserId';

describe('GetAllUsersUseCase', () => {
  let getAllUsersUseCase: GetAllUsersUseCase;
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

    getAllUsersUseCase = new GetAllUsersUseCase(mockUserRepository);
  });

  describe('execute', () => {
    it('should successfully get all users', async () => {
      const user1 = User.reconstitute(
        UserId.generate(),
        Email.create('user1@example.com'),
        'User One',
        'hashedPassword1',
        new Date(),
        new Date()
      );

      const user2 = User.reconstitute(
        UserId.generate(),
        Email.create('user2@example.com'),
        'User Two',
        'hashedPassword2',
        new Date(),
        new Date()
      );

      (mockUserRepository.findAll as any).mockResolvedValue([user1, user2]);

      const result = await getAllUsersUseCase.execute();

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: user1.id.toString(),
        email: 'user1@example.com',
        name: 'User One',
        createdAt: user1.createdAt,
        updatedAt: user1.updatedAt,
      });
      expect(result[1]).toEqual({
        id: user2.id.toString(),
        email: 'user2@example.com',
        name: 'User Two',
        createdAt: user2.createdAt,
        updatedAt: user2.updatedAt,
      });
    });

    it('should return empty array when no users exist', async () => {
      (mockUserRepository.findAll as any).mockResolvedValue([]);

      const result = await getAllUsersUseCase.execute();

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
