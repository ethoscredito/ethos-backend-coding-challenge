import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GetProjectUseCase } from '../../../../../src/application/use-cases/project/GetProjectUseCase';
import { IProjectRepository } from '../../../../../src/domain/repositories/IProjectRepository';
import { Project } from '../../../../../src/domain/entities/Project';
import { ProjectId } from '../../../../../src/domain/value-objects/ProjectId';
import { UserId } from '../../../../../src/domain/value-objects/UserId';
import { ProjectNotFoundError } from '../../../../../src/domain/errors/ProjectNotFoundError';
import { UnauthorizedError } from '../../../../../src/domain/errors/UnauthorizedError';

describe('GetProjectUseCase', () => {
  let getProjectUseCase: GetProjectUseCase;
  let mockProjectRepository: IProjectRepository;

  beforeEach(() => {
    mockProjectRepository = {
      findById: jest.fn() as any,
      findByUserId: jest.fn() as any,
      findAll: jest.fn() as any,
      save: jest.fn() as any,
      delete: jest.fn() as any,
    };

    getProjectUseCase = new GetProjectUseCase(mockProjectRepository);
  });

  describe('execute', () => {
    it('should successfully get a project when user owns it', async () => {
      const projectId = ProjectId.generate();
      const userId = UserId.generate();
      const project = Project.reconstitute(
        projectId,
        'Test Project',
        'Test description',
        userId,
        new Date(),
        new Date()
      );

      (mockProjectRepository.findById as any).mockResolvedValue(project);

      const result = await getProjectUseCase.execute({
        id: projectId.toString(),
        userId: userId.toString(),
      });

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(result).toEqual({
        id: projectId.toString(),
        name: 'Test Project',
        description: 'Test description',
        userId: userId.toString(),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    });

    it('should throw ProjectNotFoundError when project does not exist', async () => {
      const projectId = ProjectId.generate();
      const userId = UserId.generate();

      (mockProjectRepository.findById as any).mockResolvedValue(null);

      await expect(getProjectUseCase.execute({
        id: projectId.toString(),
        userId: userId.toString(),
      })).rejects.toThrow(ProjectNotFoundError);

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
    });

    it('should throw UnauthorizedError when user does not own project', async () => {
      const projectId = ProjectId.generate();
      const ownerId = UserId.generate();
      const differentUserId = UserId.generate();
      const project = Project.reconstitute(
        projectId,
        'Test Project',
        'Test description',
        ownerId,
        new Date(),
        new Date()
      );

      (mockProjectRepository.findById as any).mockResolvedValue(project);

      await expect(getProjectUseCase.execute({
        id: projectId.toString(),
        userId: differentUserId.toString(),
      })).rejects.toThrow(UnauthorizedError);

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
    });

    it('should throw error for invalid project id format', async () => {
      const userId = UserId.generate();

      await expect(getProjectUseCase.execute({
        id: 'not-a-uuid',
        userId: userId.toString(),
      })).rejects.toThrow('Invalid UUID format');

      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error for invalid user id format', async () => {
      const projectId = ProjectId.generate();

      await expect(getProjectUseCase.execute({
        id: projectId.toString(),
        userId: 'not-a-uuid',
      })).rejects.toThrow('Invalid UUID format');

      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
    });
  });
});
