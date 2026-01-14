import { Request, Response, NextFunction } from 'express';
import { IRateLimiter } from '../../../application/ports/IRateLimiter';
import { AuthenticatedRequest } from './AuthMiddleware';

export class RateLimiterMiddleware {
  constructor(private readonly rateLimiter: IRateLimiter) {}

  limit() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authenticatedReq = req as AuthenticatedRequest;
        const identifier = authenticatedReq.user?.userId || req.ip || 'anonymous';

        const result = await this.rateLimiter.checkLimit(identifier);

        res.setHeader('X-RateLimit-Limit', String(result.remainingRequests + (result.allowed ? 1 : 0)));
        res.setHeader('X-RateLimit-Remaining', String(result.remainingRequests));
        res.setHeader('X-RateLimit-Reset', result.resetTime.toISOString());

        if (!result.allowed) {
          res.status(429).json({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: result.resetTime.toISOString(),
          });
          return;
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}
