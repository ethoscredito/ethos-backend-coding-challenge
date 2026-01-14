import jwt from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../../application/ports/ITokenService';

export class JWTTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string = '24h'
  ) {}

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      throw new Error('Token verification failed');
    }
  }
}
