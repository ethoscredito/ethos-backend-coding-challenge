import { Project as PrismaProject } from '@prisma/client';
import { Project } from '../../../../domain/entities/Project';
import { ProjectId } from '../../../../domain/value-objects/ProjectId';
import { UserId } from '../../../../domain/value-objects/UserId';

export class ProjectMapper {
  static toDomain(prismaProject: PrismaProject): Project {
    return Project.reconstitute(
      ProjectId.create(prismaProject.id),
      prismaProject.name,
      prismaProject.description,
      UserId.create(prismaProject.userId),
      prismaProject.createdAt,
      prismaProject.updatedAt
    );
  }

  static toPrisma(project: Project): {
    id: string;
    name: string;
    description: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  } {
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
