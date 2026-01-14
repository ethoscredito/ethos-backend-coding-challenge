import { describe, it, expect } from '@jest/globals';
import { UserId } from '../../../../src/domain/value-objects/UserId';

describe('UserId Value Object', () => {
  describe('create', () => {
    it('should create UserId with valid UUID', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const userId = UserId.create(validUuid);

      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toBe(validUuid);
    });

    it('should throw error for invalid UUID format', () => {
      expect(() => UserId.create('not-a-uuid')).toThrow('Invalid UUID format');
    });

    it('should throw error for empty string', () => {
      expect(() => UserId.create('')).toThrow('Invalid UUID format');
    });

    it('should accept UUID in uppercase', () => {
      const uppercaseUuid = '123E4567-E89B-12D3-A456-426614174000';
      const userId = UserId.create(uppercaseUuid);

      expect(userId.value).toBe(uppercaseUuid.toLowerCase());
    });

    it('should trim whitespace before validation', () => {
      const validUuid = '  123e4567-e89b-12d3-a456-426614174000  ';
      const userId = UserId.create(validUuid);

      expect(userId.value).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should throw error for UUID with invalid characters', () => {
      expect(() => UserId.create('123g4567-e89b-12d3-a456-426614174000')).toThrow('Invalid UUID format');
    });

    it('should throw error for UUID with wrong length', () => {
      expect(() => UserId.create('123e4567-e89b-12d3-a456')).toThrow('Invalid UUID format');
    });
  });

  describe('generate', () => {
    it('should generate a valid UUID', () => {
      const userId = UserId.generate();

      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('should generate unique UUIDs', () => {
      const userId1 = UserId.generate();
      const userId2 = UserId.generate();

      expect(userId1.value).not.toBe(userId2.value);
    });
  });

  describe('equals', () => {
    it('should return true for UserIds with same value', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const userId1 = UserId.create(uuid);
      const userId2 = UserId.create(uuid);

      expect(userId1.equals(userId2)).toBe(true);
    });

    it('should return false for UserIds with different values', () => {
      const userId1 = UserId.create('123e4567-e89b-12d3-a456-426614174000');
      const userId2 = UserId.create('223e4567-e89b-12d3-a456-426614174000');

      expect(userId1.equals(userId2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const userId = UserId.create('123e4567-e89b-12d3-a456-426614174000');
      expect(userId.equals(null as any)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const userId = UserId.create('123e4567-e89b-12d3-a456-426614174000');
      expect(userId.equals(undefined as any)).toBe(false);
    });

    it('should be case-insensitive when comparing', () => {
      const userId1 = UserId.create('123e4567-e89b-12d3-a456-426614174000');
      const userId2 = UserId.create('123E4567-E89B-12D3-A456-426614174000');

      expect(userId1.equals(userId2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return the UUID string', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const userId = UserId.create(uuid);

      expect(userId.toString()).toBe(uuid);
    });
  });
});
