import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { DeleteProjectUseCase } from '../../../../../src/application/use-cases/project/DeleteProjectUseCase';
import { IProjectRepository } from '../../../../../src/domain/repositories/IProjectRepository';
import { Project } from '../../../../../src/domain/entities/Project';
import { ProjectId } from '../../../../../src/domain/value-objects/ProjectId';
import { UserId } from '../../../../../src/domain/value-objects/UserId';
import { ProjectNotFoundError } from '../../../../../src/domain/errors/ProjectNotFoundError';
import { UnauthorizedError } from '../../../../../src/domain/errors/UnauthorizedError';

describe('DeleteProjectUseCase', () => {
  let deleteProjectUseCase: DeleteProjectUseCase;
  let mockProjectRepository: IProjectRepository;

  beforeEach(() => {
    mockProjectRepository = {
      findById: jest.fn() as any,
      findByUserId: jest.fn() as any,
      findAll: jest.fn() as any,
      save: jest.fn() as any,
      delete: jest.fn() as any,
    };

    deleteProjectUseCase = new DeleteProjectUseCase(mockProjectRepository);
  });

  describe('execute', () => {
    it('should successfully delete a project when user owns it', async () => {
      const projectId = ProjectId.generate();
      const userId = UserId.generate();
      const project = Project.reconstitute(
        projectId,
        'Test Project',
        'Description',
        userId,
        new Date(),
        new Date()
      );

      (mockProjectRepository.findById as any).mockResolvedValue(project);
      (mockProjectRepository.delete as any).mockResolvedValue(true);

      await deleteProjectUseCase.execute({
        id: projectId.toString(),
        userId: userId.toString(),
      });

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.delete).toHaveBeenCalledWith(projectId);
    });

    it('should throw ProjectNotFoundError when project does not exist on findById', async () => {
      const projectId = ProjectId.generate();
      const userId = UserId.generate();

      (mockProjectRepository.findById as any).mockResolvedValue(null);

      await expect(deleteProjectUseCase.execute({
        id: projectId.toString(),
        userId: userId.toString(),
      })).rejects.toThrow(ProjectNotFoundError);

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ProjectNotFoundError when delete returns false', async () => {
      const projectId = ProjectId.generate();
      const userId = UserId.generate();
      const project = Project.reconstitute(
        projectId,
        'Test Project',
        'Description',
        userId,
        new Date(),
        new Date()
      );

      (mockProjectRepository.findById as any).mockResolvedValue(project);
      (mockProjectRepository.delete as any).mockResolvedValue(false);

      await expect(deleteProjectUseCase.execute({
        id: projectId.toString(),
        userId: userId.toString(),
      })).rejects.toThrow(ProjectNotFoundError);

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.delete).toHaveBeenCalledWith(projectId);
    });

    it('should throw UnauthorizedError when user does not own project', async () => {
      const projectId = ProjectId.generate();
      const ownerId = UserId.generate();
      const differentUserId = UserId.generate();
      const project = Project.reconstitute(
        projectId,
        'Test Project',
        'Description',
        ownerId,
        new Date(),
        new Date()
      );

      (mockProjectRepository.findById as any).mockResolvedValue(project);

      await expect(deleteProjectUseCase.execute({
        id: projectId.toString(),
        userId: differentUserId.toString(),
      })).rejects.toThrow(UnauthorizedError);

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error for invalid project id format', async () => {
      const userId = UserId.generate();

      await expect(deleteProjectUseCase.execute({
        id: 'not-a-uuid',
        userId: userId.toString(),
      })).rejects.toThrow('Invalid UUID format');

      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
      expect(mockProjectRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error for invalid user id format', async () => {
      const projectId = ProjectId.generate();

      await expect(deleteProjectUseCase.execute({
        id: projectId.toString(),
        userId: 'not-a-uuid',
      })).rejects.toThrow('Invalid UUID format');

      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
      expect(mockProjectRepository.delete).not.toHaveBeenCalled();
    });
  });
});
