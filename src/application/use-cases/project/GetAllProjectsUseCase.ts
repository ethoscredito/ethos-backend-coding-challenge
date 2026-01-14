import { IProjectRepository } from '../../../domain/repositories/IProjectRepository';
import { ProjectResponseDTO } from '../../dtos/project/ProjectResponseDTO';
import { UserId } from '../../../domain/value-objects/UserId';

export class GetAllProjectsUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(request: { userId: string }): Promise<ProjectResponseDTO[]> {
    const userId = UserId.create(request.userId);

    const projects = await this.projectRepository.findByUserId(userId);

    return projects.map(project => ({
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      userId: project.userId.toString(),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));
  }
}
