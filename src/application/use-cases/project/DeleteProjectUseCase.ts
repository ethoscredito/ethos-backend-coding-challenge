import { IProjectRepository } from '../../../domain/repositories/IProjectRepository';
import { ProjectId } from '../../../domain/value-objects/ProjectId';
import { UserId } from '../../../domain/value-objects/UserId';
import { ProjectNotFoundError } from '../../../domain/errors/ProjectNotFoundError';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

export class DeleteProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(request: { id: string; userId: string }): Promise<void> {
    const projectId = ProjectId.create(request.id);
    const userId = UserId.create(request.userId);

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError();
    }

    if (!project.belongsToUser(userId)) {
      throw new UnauthorizedError();
    }

    const deleted = await this.projectRepository.delete(projectId);
    if (!deleted) {
      throw new ProjectNotFoundError();
    }
  }
}
