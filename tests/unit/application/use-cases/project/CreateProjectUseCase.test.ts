import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CreateProjectUseCase } from '../../../../../src/application/use-cases/project/CreateProjectUseCase';
import { IProjectRepository } from '../../../../../src/domain/repositories/IProjectRepository';
import { IUserRepository } from '../../../../../src/domain/repositories/IUserRepository';
import { User } from '../../../../../src/domain/entities/User';
import { Project } from '../../../../../src/domain/entities/Project';
import { Email } from '../../../../../src/domain/value-objects/Email';
import { UserId } from '../../../../../src/domain/value-objects/UserId';
import { UserNotFoundError } from '../../../../../src/domain/errors/UserNotFoundError';

describe('CreateProjectUseCase', () => {
  let createProjectUseCase: CreateProjectUseCase;
  let mockProjectRepository: IProjectRepository;
  let mockUserRepository: IUserRepository;

  beforeEach(() => {
    mockProjectRepository = {
      findById: jest.fn() as any,
      findByUserId: jest.fn() as any,
      findAll: jest.fn() as any,
      save: jest.fn() as any,
      delete: jest.fn() as any,
    };

    mockUserRepository = {
      findById: jest.fn() as any,
      findByEmail: jest.fn() as any,
      findAll: jest.fn() as any,
      save: jest.fn() as any,
      delete: jest.fn() as any,
      existsByEmail: jest.fn() as any,
    };

    createProjectUseCase = new CreateProjectUseCase(
      mockProjectRepository,
      mockUserRepository
    );
  });

  describe('execute', () => {
    it('should successfully create a new project', async () => {
      const userId = UserId.generate();
      const user = User.reconstitute(
        userId,
        Email.create('test@example.com'),
        'Test User',
        'hashedPassword',
        new Date(),
        new Date()
      );

      const request = {
        name: 'New Project',
        description: 'Project description',
        userId: userId.toString(),
      };

      (mockUserRepository.findById as any).mockResolvedValue(user);
      (mockProjectRepository.save as any).mockImplementation(async (project: Project) => project);

      const result = await createProjectUseCase.execute(request);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockProjectRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: expect.any(String),
        name: 'New Project',
        description: 'Project description',
        userId: userId.toString(),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should create project with null description', async () => {
      const userId = UserId.generate();
      const user = User.reconstitute(
        userId,
        Email.create('test@example.com'),
        'Test User',
        'hashedPassword',
        new Date(),
        new Date()
      );

      const request = {
        name: 'New Project',
        userId: userId.toString(),
      };

      (mockUserRepository.findById as any).mockResolvedValue(user);
      (mockProjectRepository.save as any).mockImplementation(async (project: Project) => project);

      const result = await createProjectUseCase.execute(request);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockProjectRepository.save).toHaveBeenCalled();
      expect(result.description).toBeNull();
    });

    it('should throw UserNotFoundError when user does not exist', async () => {
      const userId = UserId.generate();

      const request = {
        name: 'New Project',
        description: 'Project description',
        userId: userId.toString(),
      };

      (mockUserRepository.findById as any).mockResolvedValue(null);

      await expect(createProjectUseCase.execute(request))
        .rejects.toThrow(UserNotFoundError);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid user id format', async () => {
      const request = {
        name: 'New Project',
        description: 'Project description',
        userId: 'not-a-uuid',
      };

      await expect(createProjectUseCase.execute(request))
        .rejects.toThrow('Invalid UUID format');

      expect(mockUserRepository.findById).not.toHaveBeenCalled();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for empty project name', async () => {
      const userId = UserId.generate();
      const user = User.reconstitute(
        userId,
        Email.create('test@example.com'),
        'Test User',
        'hashedPassword',
        new Date(),
        new Date()
      );

      const request = {
        name: '',
        description: 'Project description',
        userId: userId.toString(),
      };

      (mockUserRepository.findById as any).mockResolvedValue(user);

      await expect(createProjectUseCase.execute(request))
        .rejects.toThrow('Project name cannot be empty');

      expect(mockUserRepository.findById).toHaveBeenCalled();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });
  });
});
