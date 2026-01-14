import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UpdateProjectUseCase } from '../../../../../src/application/use-cases/project/UpdateProjectUseCase';
import { IProjectRepository } from '../../../../../src/domain/repositories/IProjectRepository';
import { Project } from '../../../../../src/domain/entities/Project';
import { ProjectId } from '../../../../../src/domain/value-objects/ProjectId';
import { UserId } from '../../../../../src/domain/value-objects/UserId';
import { ProjectNotFoundError } from '../../../../../src/domain/errors/ProjectNotFoundError';
import { UnauthorizedError } from '../../../../../src/domain/errors/UnauthorizedError';

describe('UpdateProjectUseCase', () => {
  let updateProjectUseCase: UpdateProjectUseCase;
  let mockProjectRepository: IProjectRepository;

  beforeEach(() => {
    mockProjectRepository = {
      findById: jest.fn() as any,
      findByUserId: jest.fn() as any,
      findAll: jest.fn() as any,
      save: jest.fn() as any,
      delete: jest.fn() as any,
    };

    updateProjectUseCase = new UpdateProjectUseCase(mockProjectRepository);
  });

  describe('execute', () => {
    it('should successfully update project name', async () => {
      const projectId = ProjectId.generate();
      const userId = UserId.generate();
      const project = Project.reconstitute(
        projectId,
        'Old Name',
        'Old description',
        userId,
        new Date(),
        new Date()
      );

      (mockProjectRepository.findById as any).mockResolvedValue(project);
      (mockProjectRepository.save as any).mockImplementation(async (project: Project) => project);

      const result = await updateProjectUseCase.execute({
        id: projectId.toString(),
        userId: userId.toString(),
        name: 'New Name',
      });

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('New Name');
      expect(result.description).toBe('Old description');
    });

    it('should successfully update project description', async () => {
      const projectId = ProjectId.generate();
      const userId = UserId.generate();
      const project = Project.reconstitute(
        projectId,
        'Project Name',
        'Old description',
        userId,
        new Date(),
        new Date()
      );

      (mockProjectRepository.findById as any).mockResolvedValue(project);
      (mockProjectRepository.save as any).mockImplementation(async (project: Project) => project);

      const result = await updateProjectUseCase.execute({
        id: projectId.toString(),
        userId: userId.toString(),
        description: 'New description',
      });

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Project Name');
      expect(result.description).toBe('New description');
    });

    it('should successfully update both name and description', async () => {
      const projectId = ProjectId.generate();
      const userId = UserId.generate();
      const project = Project.reconstitute(
        projectId,
        'Old Name',
        'Old description',
        userId,
        new Date(),
        new Date()
      );

      (mockProjectRepository.findById as any).mockResolvedValue(project);
      (mockProjectRepository.save as any).mockImplementation(async (project: Project) => project);

      const result = await updateProjectUseCase.execute({
        id: projectId.toString(),
        userId: userId.toString(),
        name: 'New Name',
        description: 'New description',
      });

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('New Name');
      expect(result.description).toBe('New description');
    });

    it('should throw ProjectNotFoundError when project does not exist', async () => {
      const projectId = ProjectId.generate();
      const userId = UserId.generate();

      (mockProjectRepository.findById as any).mockResolvedValue(null);

      await expect(updateProjectUseCase.execute({
        id: projectId.toString(),
        userId: userId.toString(),
        name: 'New Name',
      })).rejects.toThrow(ProjectNotFoundError);

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError when user does not own project', async () => {
      const projectId = ProjectId.generate();
      const ownerId = UserId.generate();
      const differentUserId = UserId.generate();
      const project = Project.reconstitute(
        projectId,
        'Project Name',
        'Description',
        ownerId,
        new Date(),
        new Date()
      );

      (mockProjectRepository.findById as any).mockResolvedValue(project);

      await expect(updateProjectUseCase.execute({
        id: projectId.toString(),
        userId: differentUserId.toString(),
        name: 'New Name',
      })).rejects.toThrow(UnauthorizedError);

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid project id format', async () => {
      const userId = UserId.generate();

      await expect(updateProjectUseCase.execute({
        id: 'not-a-uuid',
        userId: userId.toString(),
        name: 'New Name',
      })).rejects.toThrow('Invalid UUID format');

      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for invalid user id format', async () => {
      const projectId = ProjectId.generate();

      await expect(updateProjectUseCase.execute({
        id: projectId.toString(),
        userId: 'not-a-uuid',
        name: 'New Name',
      })).rejects.toThrow('Invalid UUID format');

      expect(mockProjectRepository.findById).not.toHaveBeenCalled();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('should throw error for empty project name', async () => {
      const projectId = ProjectId.generate();
      const userId = UserId.generate();
      const project = Project.reconstitute(
        projectId,
        'Project Name',
        'Description',
        userId,
        new Date(),
        new Date()
      );

      (mockProjectRepository.findById as any).mockResolvedValue(project);

      await expect(updateProjectUseCase.execute({
        id: projectId.toString(),
        userId: userId.toString(),
        name: '',
      })).rejects.toThrow('Project name cannot be empty');

      expect(mockProjectRepository.findById).toHaveBeenCalled();
      expect(mockProjectRepository.save).not.toHaveBeenCalled();
    });

    it('should not update when no fields provided', async () => {
      const projectId = ProjectId.generate();
      const userId = UserId.generate();
      const project = Project.reconstitute(
        projectId,
        'Project Name',
        'Description',
        userId,
        new Date(),
        new Date()
      );

      (mockProjectRepository.findById as any).mockResolvedValue(project);
      (mockProjectRepository.save as any).mockImplementation(async (project: Project) => project);

      const result = await updateProjectUseCase.execute({
        id: projectId.toString(),
        userId: userId.toString(),
      });

      expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId);
      expect(mockProjectRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Project Name');
      expect(result.description).toBe('Description');
    });
  });
});
