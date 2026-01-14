import { DomainError } from './DomainError';

export class InvalidCredentialsError extends DomainError {
  constructor(message: string = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}
