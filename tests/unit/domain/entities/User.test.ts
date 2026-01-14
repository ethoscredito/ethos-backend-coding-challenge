import { describe, it, expect, beforeEach } from '@jest/globals';
import { User } from '../../../../src/domain/entities/User';
import { UserId } from '../../../../src/domain/value-objects/UserId';
import { Email } from '../../../../src/domain/value-objects/Email';
import { Password } from '../../../../src/domain/value-objects/Password';

describe('User Entity', () => {
  let validEmail: Email;
  let validPassword: Password;
  let validName: string;

  beforeEach(() => {
    validEmail = Email.create('test@example.com');
    validPassword = Password.create('ValidPass123');
    validName = 'John Doe';
  });

  describe('create', () => {
    it('should create a new user with generated ID and timestamps', async () => {
      const user = await User.create(validEmail, validName, validPassword);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeInstanceOf(UserId);
      expect(user.email.equals(validEmail)).toBe(true);
      expect(user.name).toBe(validName);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBeCloseTo(user.updatedAt.getTime(), -2);
    });

    it('should hash the password when creating user', async () => {
      const user = await User.create(validEmail, validName, validPassword);

      expect(user.hashedPassword).toBeDefined();
      expect(user.hashedPassword).not.toBe('ValidPass123');
      expect(user.hashedPassword.startsWith('$2b$')).toBe(true);
    });

    it('should throw error for empty name', async () => {
      await expect(User.create(validEmail, '', validPassword))
        .rejects.toThrow('User name cannot be empty');
    });

    it('should throw error for whitespace-only name', async () => {
      await expect(User.create(validEmail, '   ', validPassword))
        .rejects.toThrow('User name cannot be empty');
    });

    it('should trim name before creating user', async () => {
      const user = await User.create(validEmail, '  John Doe  ', validPassword);
      expect(user.name).toBe('John Doe');
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute an existing user from persistence', () => {
      const id = UserId.generate();
      const hashedPassword = '$2b$10$abcdefghijklmnopqrstuvwxyz';
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const user = User.reconstitute(id, validEmail, validName, hashedPassword, createdAt, updatedAt);

      expect(user).toBeInstanceOf(User);
      expect(user.id.equals(id)).toBe(true);
      expect(user.email.equals(validEmail)).toBe(true);
      expect(user.name).toBe(validName);
      expect(user.hashedPassword).toBe(hashedPassword);
      expect(user.createdAt).toBe(createdAt);
      expect(user.updatedAt).toBe(updatedAt);
    });

    it('should throw error for empty name when reconstituting', () => {
      const id = UserId.generate();
      const hashedPassword = '$2b$10$abcdefghijklmnopqrstuvwxyz';
      const createdAt = new Date();
      const updatedAt = new Date();

      expect(() => User.reconstitute(id, validEmail, '', hashedPassword, createdAt, updatedAt))
        .toThrow('User name cannot be empty');
    });
  });

  describe('verifyPassword', () => {
    it('should return true when password matches', async () => {
      const user = await User.create(validEmail, validName, validPassword);
      const isValid = await user.verifyPassword('ValidPass123');

      expect(isValid).toBe(true);
    });

    it('should return false when password does not match', async () => {
      const user = await User.create(validEmail, validName, validPassword);
      const isValid = await user.verifyPassword('WrongPassword');

      expect(isValid).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('should update name and email', async () => {
      const user = await User.create(validEmail, validName, validPassword);
      const newEmail = Email.create('newemail@example.com');
      const newName = 'Jane Doe';

      const originalUpdatedAt = user.updatedAt;

      // Wait 1ms to ensure updatedAt changes
      await new Promise(resolve => setTimeout(resolve, 1));

      user.updateProfile(newEmail, newName);

      expect(user.email.equals(newEmail)).toBe(true);
      expect(user.name).toBe(newName);
      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should throw error when updating with empty name', async () => {
      const user = await User.create(validEmail, validName, validPassword);
      const newEmail = Email.create('newemail@example.com');

      expect(() => user.updateProfile(newEmail, '')).toThrow('User name cannot be empty');
    });

    it('should trim name when updating', async () => {
      const user = await User.create(validEmail, validName, validPassword);
      user.updateProfile(validEmail, '  Updated Name  ');

      expect(user.name).toBe('Updated Name');
    });
  });

  describe('updatePassword', () => {
    it('should update password and hash it', async () => {
      const user = await User.create(validEmail, validName, validPassword);
      const oldHashedPassword = user.hashedPassword;
      const newPassword = Password.create('NewPassword123');

      await user.updatePassword(newPassword);

      expect(user.hashedPassword).not.toBe(oldHashedPassword);
      expect(await user.verifyPassword('NewPassword123')).toBe(true);
      expect(await user.verifyPassword('ValidPass123')).toBe(false);
    });

    it('should update the updatedAt timestamp', async () => {
      const user = await User.create(validEmail, validName, validPassword);
      const originalUpdatedAt = user.updatedAt;

      // Wait 1ms to ensure updatedAt changes
      await new Promise(resolve => setTimeout(resolve, 1));

      const newPassword = Password.create('NewPassword123');
      await user.updatePassword(newPassword);

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('equals', () => {
    it('should return true for users with same ID', async () => {
      const id = UserId.generate();
      const user1 = User.reconstitute(id, validEmail, 'User 1', 'hash1', new Date(), new Date());
      const user2 = User.reconstitute(id, Email.create('different@example.com'), 'User 2', 'hash2', new Date(), new Date());

      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false for users with different IDs', async () => {
      const user1 = await User.create(validEmail, validName, validPassword);
      const user2 = await User.create(Email.create('other@example.com'), 'Other Name', Password.create('OtherPass123'));

      expect(user1.equals(user2)).toBe(false);
    });

    it('should return false when comparing with null', async () => {
      const user = await User.create(validEmail, validName, validPassword);
      expect(user.equals(null as any)).toBe(false);
    });
  });
});
