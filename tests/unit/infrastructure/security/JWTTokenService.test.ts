import { describe, it, expect, beforeEach } from '@jest/globals';
import { JWTTokenService } from '../../../../src/infrastructure/security/JWTTokenService';

describe('JWTTokenService', () => {
  let jwtTokenService: JWTTokenService;
  const secret = 'test-secret-key';

  beforeEach(() => {
    jwtTokenService = new JWTTokenService(secret);
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      const token = jwtTokenService.generateToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different payloads', () => {
      const payload1 = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test1@example.com',
      };

      const payload2 = {
        userId: '223e4567-e89b-12d3-a456-426614174000',
        email: 'test2@example.com',
      };

      const token1 = jwtTokenService.generateToken(payload1);
      const token2 = jwtTokenService.generateToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const payload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      const token = jwtTokenService.generateToken(payload);
      const decoded = jwtTokenService.verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => jwtTokenService.verifyToken(invalidToken))
        .toThrow();
    });

    it('should throw error for token with wrong signature', () => {
      const payload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      const token = jwtTokenService.generateToken(payload);
      const differentSecretService = new JWTTokenService('different-secret');

      expect(() => differentSecretService.verifyToken(token))
        .toThrow();
    });

    it('should throw error for expired token', () => {
      const shortLivedService = new JWTTokenService(secret, '0s');
      const payload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      const token = shortLivedService.generateToken(payload);

      // Wait a bit to ensure token expires
      return new Promise(resolve => setTimeout(resolve, 100))
        .then(() => {
          expect(() => shortLivedService.verifyToken(token))
            .toThrow();
        });
    });
  });
});
