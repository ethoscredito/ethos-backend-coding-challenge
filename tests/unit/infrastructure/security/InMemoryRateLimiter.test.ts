import { describe, it, expect, beforeEach } from '@jest/globals';
import { InMemoryRateLimiter } from '../../../../src/infrastructure/security/InMemoryRateLimiter';

describe('InMemoryRateLimiter', () => {
  let rateLimiter: InMemoryRateLimiter;
  const windowMs = 1000; // 1 second
  const maxRequests = 3;

  beforeEach(() => {
    rateLimiter = new InMemoryRateLimiter(windowMs, maxRequests);
  });

  describe('checkLimit', () => {
    it('should allow requests within the limit', async () => {
      const identifier = 'user-123';

      const result1 = await rateLimiter.checkLimit(identifier);
      const result2 = await rateLimiter.checkLimit(identifier);
      const result3 = await rateLimiter.checkLimit(identifier);

      expect(result1.allowed).toBe(true);
      expect(result1.remainingRequests).toBe(2);
      expect(result2.allowed).toBe(true);
      expect(result2.remainingRequests).toBe(1);
      expect(result3.allowed).toBe(true);
      expect(result3.remainingRequests).toBe(0);
    });

    it('should block requests that exceed the limit', async () => {
      const identifier = 'user-123';

      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      const result4 = await rateLimiter.checkLimit(identifier);

      expect(result4.allowed).toBe(false);
      expect(result4.remainingRequests).toBe(0);
    });

    it('should track different identifiers separately', async () => {
      const identifier1 = 'user-123';
      const identifier2 = 'user-456';

      const result1 = await rateLimiter.checkLimit(identifier1);
      const result2 = await rateLimiter.checkLimit(identifier2);

      expect(result1.allowed).toBe(true);
      expect(result1.remainingRequests).toBe(2);
      expect(result2.allowed).toBe(true);
      expect(result2.remainingRequests).toBe(2);
    });

    it('should reset limit after window expires', async () => {
      const identifier = 'user-123';
      const shortWindowLimiter = new InMemoryRateLimiter(100, 2); // 100ms window

      await shortWindowLimiter.checkLimit(identifier);
      await shortWindowLimiter.checkLimit(identifier);
      const result3 = await shortWindowLimiter.checkLimit(identifier);
      expect(result3.allowed).toBe(false);

      await new Promise(resolve => setTimeout(resolve, 150));

      const result4 = await shortWindowLimiter.checkLimit(identifier);
      expect(result4.allowed).toBe(true);
      expect(result4.remainingRequests).toBe(1);
    });

    it('should return reset time in the future', async () => {
      const identifier = 'user-123';
      const now = Date.now();

      const result = await rateLimiter.checkLimit(identifier);

      expect(result.resetTime.getTime()).toBeGreaterThan(now);
      expect(result.resetTime.getTime()).toBeLessThanOrEqual(now + windowMs);
    });

    it('should clean up old entries automatically', async () => {
      const identifier = 'user-123';
      const shortWindowLimiter = new InMemoryRateLimiter(50, 5);

      await shortWindowLimiter.checkLimit(identifier);
      await shortWindowLimiter.checkLimit(identifier);

      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await shortWindowLimiter.checkLimit(identifier);

      expect(result.allowed).toBe(true);
      expect(result.remainingRequests).toBe(4);
    });
  });

  describe('resetLimit', () => {
    it('should reset the limit for a specific identifier', async () => {
      const identifier = 'user-123';

      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);
      await rateLimiter.checkLimit(identifier);

      let result = await rateLimiter.checkLimit(identifier);
      expect(result.allowed).toBe(false);

      await rateLimiter.resetLimit(identifier);

      result = await rateLimiter.checkLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.remainingRequests).toBe(2);
    });

    it('should not affect other identifiers when resetting', async () => {
      const identifier1 = 'user-123';
      const identifier2 = 'user-456';

      await rateLimiter.checkLimit(identifier1);
      await rateLimiter.checkLimit(identifier2);

      await rateLimiter.resetLimit(identifier1);

      const result1 = await rateLimiter.checkLimit(identifier1);
      expect(result1.remainingRequests).toBe(2);

      const result2 = await rateLimiter.checkLimit(identifier2);
      expect(result2.remainingRequests).toBe(1);
    });
  });
});
