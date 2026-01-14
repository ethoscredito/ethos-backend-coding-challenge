import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GetAllProjectsUseCase } from '../../../../../src/application/use-cases/project/GetAllProjectsUseCase';
import { IProjectRepository } from '../../../../../src/domain/repositories/IProjectRepository';
import { Project } from '../../../../../src/domain/entities/Project';
import { ProjectId } from '../../../../../src/domain/value-objects/ProjectId';
import { UserId } from '../../../../../src/domain/value-objects/UserId';

describe('GetAllProjectsUseCase', () => {
  let getAllProjectsUseCase: GetAllProjectsUseCase;
  let mockProjectRepository: IProjectRepository;

  beforeEach(() => {
    mockProjectRepository = {
      findById: jest.fn() as any,
      findByUserId: jest.fn() as any,
      findAll: jest.fn() as any,
      save: jest.fn() as any,
      delete: jest.fn() as any,
    };

    getAllProjectsUseCase = new GetAllProjectsUseCase(mockProjectRepository);
  });

  describe('execute', () => {
    it('should successfully get all projects for a user', async () => {
      const userId = UserId.generate();
      const project1 = Project.reconstitute(
        ProjectId.generate(),
        'Project One',
        'Description one',
        userId,
        new Date(),
        new Date()
      );

      const project2 = Project.reconstitute(
        ProjectId.generate(),
        'Project Two',
        null,
        userId,
        new Date(),
        new Date()
      );

      (mockProjectRepository.findByUserId as any).mockResolvedValue([project1, project2]);

      const result = await getAllProjectsUseCase.execute({ userId: userId.toString() });

      expect(mockProjectRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: project1.id.toString(),
        name: 'Project One',
        description: 'Description one',
        userId: userId.toString(),
        createdAt: project1.createdAt,
        updatedAt: project1.updatedAt,
      });
      expect(result[1]).toEqual({
        id: project2.id.toString(),
        name: 'Project Two',
        description: null,
        userId: userId.toString(),
        createdAt: project2.createdAt,
        updatedAt: project2.updatedAt,
      });
    });

    it('should return empty array when user has no projects', async () => {
      const userId = UserId.generate();

      (mockProjectRepository.findByUserId as any).mockResolvedValue([]);

      const result = await getAllProjectsUseCase.execute({ userId: userId.toString() });

      expect(mockProjectRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });

    it('should throw error for invalid user id format', async () => {
      await expect(getAllProjectsUseCase.execute({ userId: 'not-a-uuid' }))
        .rejects.toThrow('Invalid UUID format');

      expect(mockProjectRepository.findByUserId).not.toHaveBeenCalled();
    });
  });
});
