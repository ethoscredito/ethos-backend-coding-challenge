import { describe, it, expect, beforeAll } from '@jest/globals';
import { Password } from '../../../../src/domain/value-objects/Password';

describe('Password Value Object', () => {
  describe('create', () => {
    it('should create a valid password with minimum 8 characters', () => {
      const password = Password.create('ValidPass123');
      expect(password).toBeInstanceOf(Password);
      expect(password.value).toBe('ValidPass123');
    });

    it('should throw error for password shorter than 8 characters', () => {
      expect(() => Password.create('short')).toThrow('Password must be at least 8 characters long');
    });

    it('should throw error for empty password', () => {
      expect(() => Password.create('')).toThrow('Password must be at least 8 characters long');
    });

    it('should accept password with exactly 8 characters', () => {
      const password = Password.create('12345678');
      expect(password.value).toBe('12345678');
    });

    it('should trim whitespace before validation', () => {
      expect(() => Password.create('  short  ')).toThrow('Password must be at least 8 characters long');
    });

    it('should accept long passwords', () => {
      const longPassword = 'a'.repeat(100);
      const password = Password.create(longPassword);
      expect(password.value).toBe(longPassword);
    });
  });

  describe('hash', () => {
    it('should hash the password using bcrypt', async () => {
      const password = Password.create('SecurePass123');
      const hashed = await password.hash();

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe('SecurePass123');
      expect(hashed.startsWith('$2b$')).toBe(true); // bcrypt hash prefix
    });

    it('should generate different hashes for same password (due to salt)', async () => {
      const password1 = Password.create('SamePassword123');
      const password2 = Password.create('SamePassword123');

      const hash1 = await password1.hash();
      const hash2 = await password2.hash();

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true when plain password matches hashed password', async () => {
      const plainPassword = 'MySecretPass123';
      const password = Password.create(plainPassword);
      const hashed = await password.hash();

      const result = await Password.compare(plainPassword, hashed);
      expect(result).toBe(true);
    });

    it('should return false when plain password does not match hashed password', async () => {
      const password = Password.create('CorrectPass123');
      const hashed = await password.hash();

      const result = await Password.compare('WrongPass123', hashed);
      expect(result).toBe(false);
    });

    it('should return false for empty string comparison', async () => {
      const password = Password.create('ValidPass123');
      const hashed = await password.hash();

      const result = await Password.compare('', hashed);
      expect(result).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for passwords with same value', () => {
      const password1 = Password.create('SamePass123');
      const password2 = Password.create('SamePass123');

      expect(password1.equals(password2)).toBe(true);
    });

    it('should return false for passwords with different values', () => {
      const password1 = Password.create('Password123');
      const password2 = Password.create('Different123');

      expect(password1.equals(password2)).toBe(false);
    });

    it('should return false when comparing with null', () => {
      const password = Password.create('ValidPass123');
      expect(password.equals(null as any)).toBe(false);
    });

    it('should return false when comparing with undefined', () => {
      const password = Password.create('ValidPass123');
      expect(password.equals(undefined as any)).toBe(false);
    });
  });
});
