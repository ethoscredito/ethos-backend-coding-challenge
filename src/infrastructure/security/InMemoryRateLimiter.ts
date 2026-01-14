import { IRateLimiter, RateLimitResult } from '../../application/ports/IRateLimiter';

interface RequestRecord {
  timestamps: number[];
  resetTime: Date;
}

export class InMemoryRateLimiter implements IRateLimiter {
  private readonly requests: Map<string, RequestRecord>;
  private readonly cleanupIntervalMs = 60000; // Clean up every minute
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly windowMs: number,
    private readonly maxRequests: number
  ) {
    this.requests = new Map();
    this.startCleanup();
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.requests.get(identifier);
    if (!record) {
      record = {
        timestamps: [],
        resetTime: new Date(now + this.windowMs),
      };
      this.requests.set(identifier, record);
    }

    record.timestamps = record.timestamps.filter(timestamp => timestamp > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldestTimestamp = record.timestamps[0];
      const resetTime = new Date(oldestTimestamp + this.windowMs);

      return {
        allowed: false,
        remainingRequests: 0,
        resetTime,
      };
    }

    record.timestamps.push(now);
    record.resetTime = new Date(now + this.windowMs);

    const remainingRequests = this.maxRequests - record.timestamps.length;

    return {
      allowed: true,
      remainingRequests,
      resetTime: record.resetTime,
    };
  }

  async resetLimit(identifier: string): Promise<void> {
    this.requests.delete(identifier);
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupIntervalMs);

    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [identifier, record] of this.requests.entries()) {
      record.timestamps = record.timestamps.filter(timestamp => timestamp > windowStart);

      if (record.timestamps.length === 0) {
        this.requests.delete(identifier);
      }
    }
  }

  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}
