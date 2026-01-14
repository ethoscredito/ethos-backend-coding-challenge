import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../../domain/errors/DomainError';
import { UserNotFoundError } from '../../../domain/errors/UserNotFoundError';
import { ProjectNotFoundError } from '../../../domain/errors/ProjectNotFoundError';
import { InvalidCredentialsError } from '../../../domain/errors/InvalidCredentialsError';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);

  if (error instanceof UserNotFoundError || error instanceof ProjectNotFoundError) {
    res.status(404).json({
      error: 'Not found',
      message: error.message,
    });
    return;
  }

  if (error instanceof InvalidCredentialsError) {
    res.status(401).json({
      error: 'Authentication failed',
      message: error.message,
    });
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.status(403).json({
      error: 'Forbidden',
      message: error.message,
    });
    return;
  }

  if (error instanceof DomainError) {
    res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
  });
}
