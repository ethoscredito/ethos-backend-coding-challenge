import { DomainError } from './DomainError';

export class ProjectNotFoundError extends DomainError {
  constructor(message: string = 'Project not found') {
    super(message);
    this.name = 'ProjectNotFoundError';
    Object.setPrototypeOf(this, ProjectNotFoundError.prototype);
  }
}
