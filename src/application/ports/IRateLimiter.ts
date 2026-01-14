export interface RateLimitResult {
  allowed: boolean;
  remainingRequests: number;
  resetTime: Date;
}

export interface IRateLimiter {

  checkLimit(identifier: string): Promise<RateLimitResult>;

  resetLimit(identifier: string): Promise<void>;
}
