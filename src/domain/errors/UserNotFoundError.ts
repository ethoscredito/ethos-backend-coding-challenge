import { DomainError } from './DomainError';

export class UserNotFoundError extends DomainError {
  constructor(message: string = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}
