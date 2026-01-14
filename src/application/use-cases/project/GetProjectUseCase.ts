import { IProjectRepository } from '../../../domain/repositories/IProjectRepository';
import { ProjectResponseDTO } from '../../dtos/project/ProjectResponseDTO';
import { ProjectId } from '../../../domain/value-objects/ProjectId';
import { UserId } from '../../../domain/value-objects/UserId';
import { ProjectNotFoundError } from '../../../domain/errors/ProjectNotFoundError';
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError';

export class GetProjectUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(request: { id: string; userId: string }): Promise<ProjectResponseDTO> {
    const projectId = ProjectId.create(request.id);
    const userId = UserId.create(request.userId);

    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError();
    }

    if (!project.belongsToUser(userId)) {
      throw new UnauthorizedError();
    }

    return {
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      userId: project.userId.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
