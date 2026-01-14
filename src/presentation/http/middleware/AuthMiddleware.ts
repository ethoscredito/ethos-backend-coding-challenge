import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '../../../application/ports/ITokenService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export class AuthMiddleware {
  constructor(private readonly tokenService: ITokenService) {}

  authenticate() {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
          res.status(401).json({ error: 'No authorization header provided' });
          return;
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
          res.status(401).json({ error: 'Invalid authorization header format. Use: Bearer <token>' });
          return;
        }

        const token = parts[1];
        const payload = this.tokenService.verifyToken(token);

        (req as AuthenticatedRequest).user = {
          userId: payload.userId,
          email: payload.email,
        };

        next();
      } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
      }
    };
  }
}
