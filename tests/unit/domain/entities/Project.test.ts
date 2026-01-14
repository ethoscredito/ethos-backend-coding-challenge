import { describe, it, expect, beforeEach } from '@jest/globals';
import { Project } from '../../../../src/domain/entities/Project';
import { ProjectId } from '../../../../src/domain/value-objects/ProjectId';
import { UserId } from '../../../../src/domain/value-objects/UserId';

describe('Project Entity', () => {
  let validName: string;
  let validDescription: string;
  let validUserId: UserId;

  beforeEach(() => {
    validName = 'My Project';
    validDescription = 'A test project description';
    validUserId = UserId.generate();
  });

  describe('create', () => {
    it('should create a new project with generated ID and timestamps', () => {
      const project = Project.create(validName, validDescription, validUserId);

      expect(project).toBeInstanceOf(Project);
      expect(project.id).toBeInstanceOf(ProjectId);
      expect(project.name).toBe(validName);
      expect(project.description).toBe(validDescription);
      expect(project.userId.equals(validUserId)).toBe(true);
      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
      expect(project.createdAt.getTime()).toBeCloseTo(project.updatedAt.getTime(), -2);
    });

    it('should create project with null description', () => {
      const project = Project.create(validName, null, validUserId);

      expect(project.name).toBe(validName);
      expect(project.description).toBeNull();
    });

    it('should throw error for empty name', () => {
      expect(() => Project.create('', validDescription, validUserId))
        .toThrow('Project name cannot be empty');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => Project.create('   ', validDescription, validUserId))
        .toThrow('Project name cannot be empty');
    });

    it('should trim name before creating project', () => {
      const project = Project.create('  My Project  ', validDescription, validUserId);
      expect(project.name).toBe('My Project');
    });

    it('should trim description if provided', () => {
      const project = Project.create(validName, '  Description  ', validUserId);
      expect(project.description).toBe('Description');
    });

    it('should handle empty string description as null', () => {
      const project = Project.create(validName, '', validUserId);
      expect(project.description).toBeNull();
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute an existing project from persistence', () => {
      const id = ProjectId.generate();
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const project = Project.reconstitute(
        id,
        validName,
        validDescription,
        validUserId,
        createdAt,
        updatedAt
      );

      expect(project).toBeInstanceOf(Project);
      expect(project.id.equals(id)).toBe(true);
      expect(project.name).toBe(validName);
      expect(project.description).toBe(validDescription);
      expect(project.userId.equals(validUserId)).toBe(true);
      expect(project.createdAt).toBe(createdAt);
      expect(project.updatedAt).toBe(updatedAt);
    });

    it('should throw error for empty name when reconstituting', () => {
      const id = ProjectId.generate();
      const createdAt = new Date();
      const updatedAt = new Date();

      expect(() => Project.reconstitute(id, '', validDescription, validUserId, createdAt, updatedAt))
        .toThrow('Project name cannot be empty');
    });
  });

  describe('update', () => {
    it('should update name and description', async () => {
      const project = Project.create(validName, validDescription, validUserId);
      const newName = 'Updated Project';
      const newDescription = 'Updated description';

      const originalUpdatedAt = project.updatedAt;

      // Wait 1ms to ensure updatedAt changes
      await new Promise(resolve => setTimeout(resolve, 1));

      project.update(newName, newDescription);

      expect(project.name).toBe(newName);
      expect(project.description).toBe(newDescription);
      expect(project.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should throw error when updating with empty name', () => {
      const project = Project.create(validName, validDescription, validUserId);

      expect(() => project.update('', 'New description'))
        .toThrow('Project name cannot be empty');
    });

    it('should trim name and description when updating', () => {
      const project = Project.create(validName, validDescription, validUserId);
      project.update('  Updated Name  ', '  Updated Description  ');

      expect(project.name).toBe('Updated Name');
      expect(project.description).toBe('Updated Description');
    });

    it('should allow null description when updating', () => {
      const project = Project.create(validName, validDescription, validUserId);
      project.update(validName, null);

      expect(project.description).toBeNull();
    });

    it('should convert empty string description to null when updating', () => {
      const project = Project.create(validName, validDescription, validUserId);
      project.update(validName, '');

      expect(project.description).toBeNull();
    });
  });

  describe('belongsToUser', () => {
    it('should return true when project belongs to user', () => {
      const project = Project.create(validName, validDescription, validUserId);

      expect(project.belongsToUser(validUserId)).toBe(true);
    });

    it('should return false when project does not belong to user', () => {
      const project = Project.create(validName, validDescription, validUserId);
      const otherUserId = UserId.generate();

      expect(project.belongsToUser(otherUserId)).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for projects with same ID', () => {
      const id = ProjectId.generate();
      const project1 = Project.reconstitute(id, 'Project 1', 'Desc 1', validUserId, new Date(), new Date());
      const project2 = Project.reconstitute(id, 'Project 2', 'Desc 2', UserId.generate(), new Date(), new Date());

      expect(project1.equals(project2)).toBe(true);
    });

    it('should return false for projects with different IDs', () => {
      const project1 = Project.create(validName, validDescription, validUserId);
      const project2 = Project.create('Other Project', 'Other description', validUserId);

      expect(project1.equals(project2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const project = Project.create(validName, validDescription, validUserId);
      expect(project.equals(null as any)).toBe(false);
    });
  });
});
