import { describe, it, expect } from '@jest/globals';
import { ProjectId } from '../../../../src/domain/value-objects/ProjectId';

describe('ProjectId Value Object', () => {
  describe('create', () => {
    it('should create ProjectId with valid UUID', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const projectId = ProjectId.create(validUuid);

      expect(projectId).toBeInstanceOf(ProjectId);
      expect(projectId.value).toBe(validUuid);
    });

    it('should throw error for invalid UUID format', () => {
      expect(() => ProjectId.create('not-a-uuid')).toThrow('Invalid UUID format');
    });

    it('should throw error for empty string', () => {
      expect(() => ProjectId.create('')).toThrow('Invalid UUID format');
    });

    it('should accept UUID in uppercase', () => {
      const uppercaseUuid = '123E4567-E89B-12D3-A456-426614174000';
      const projectId = ProjectId.create(uppercaseUuid);

      expect(projectId.value).toBe(uppercaseUuid.toLowerCase());
    });

    it('should trim whitespace before validation', () => {
      const validUuid = '  123e4567-e89b-12d3-a456-426614174000  ';
      const projectId = ProjectId.create(validUuid);

      expect(projectId.value).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw error for UUID with invalid characters', () => {
      expect(() => ProjectId.create('123g4567-e89b-12d3-a456-426614174000')).toThrow('Invalid UUID format');
    });

    it('should throw error for UUID with wrong length', () => {
      expect(() => ProjectId.create('123e4567-e89b-12d3-a456')).toThrow('Invalid UUID format');
    });
  });

  describe('generate', () => {
    it('should generate a valid UUID', () => {
      const projectId = ProjectId.generate();

      expect(projectId).toBeInstanceOf(ProjectId);
      expect(projectId.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('should generate unique UUIDs', () => {
      const projectId1 = ProjectId.generate();
      const projectId2 = ProjectId.generate();

      expect(projectId1.value).not.toBe(projectId2.value);
    });
  });

  describe('equals', () => {
    it('should return true for ProjectIds with same value', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const projectId1 = ProjectId.create(uuid);
      const projectId2 = ProjectId.create(uuid);

      expect(projectId1.equals(projectId2)).toBe(true);
    });

    it('should return false for ProjectIds with different values', () => {
      const projectId1 = ProjectId.create('123e4567-e89b-12d3-a456-426614174000');
      const projectId2 = ProjectId.create('223e4567-e89b-12d3-a456-426614174000');

      expect(projectId1.equals(projectId2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const projectId = ProjectId.create('123e4567-e89b-12d3-a456-426614174000');
      expect(projectId.equals(null as any)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const projectId = ProjectId.create('123e4567-e89b-12d3-a456-426614174000');
      expect(projectId.equals(undefined as any)).toBe(false);
    });

    it('should be case-insensitive when comparing', () => {
      const projectId1 = ProjectId.create('123e4567-e89b-12d3-a456-426614174000');
      const projectId2 = ProjectId.create('123E4567-E89B-12D3-A456-426614174000');

      expect(projectId1.equals(projectId2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return the UUID string', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const projectId = ProjectId.create(uuid);

      expect(projectId.toString()).toBe(uuid);
    });
  });
});
