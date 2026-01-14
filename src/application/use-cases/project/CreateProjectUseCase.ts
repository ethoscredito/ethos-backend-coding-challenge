import { IProjectRepository } from '../../../domain/repositories/IProjectRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { CreateProjectDTO } from '../../dtos/project/CreateProjectDTO';
import { ProjectResponseDTO } from '../../dtos/project/ProjectResponseDTO';
import { UserId } from '../../../domain/value-objects/UserId';
import { Project } from '../../../domain/entities/Project';
import { UserNotFoundError } from '../../../domain/errors/UserNotFoundError';

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(request: CreateProjectDTO): Promise<ProjectResponseDTO> {
    const userId = UserId.create(request.userId);

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const project = await Project.create(
      request.name,
      request.description || null,
      userId
    );

    await this.projectRepository.save(project);

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
