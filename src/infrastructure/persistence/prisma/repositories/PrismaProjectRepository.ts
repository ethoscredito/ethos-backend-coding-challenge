import { PrismaClient } from '@prisma/client';
import { IProjectRepository } from '../../../../domain/repositories/IProjectRepository';
import { Project } from '../../../../domain/entities/Project';
import { ProjectId } from '../../../../domain/value-objects/ProjectId';
import { UserId } from '../../../../domain/value-objects/UserId';
import { ProjectMapper } from '../mappers/ProjectMapper';

export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: ProjectId): Promise<Project | null> {
    const prismaProject = await this.prisma.project.findUnique({
      where: { id: id.toString() },
    });

    if (!prismaProject) {
      return null;
    }

    return ProjectMapper.toDomain(prismaProject);
  }

  async findByUserId(userId: UserId): Promise<Project[]> {
    const prismaProjects = await this.prisma.project.findMany({
      where: { userId: userId.toString() },
      orderBy: { createdAt: 'desc' },
    });

    return prismaProjects.map(ProjectMapper.toDomain);
  }

  async findAll(): Promise<Project[]> {
    const prismaProjects = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return prismaProjects.map(ProjectMapper.toDomain);
  }

  async save(project: Project): Promise<Project> {
    const prismaData = ProjectMapper.toPrisma(project);

    const savedProject = await this.prisma.project.upsert({
      where: { id: prismaData.id },
      update: {
        name: prismaData.name,
        description: prismaData.description,
        userId: prismaData.userId,
        updatedAt: prismaData.updatedAt,
      },
      create: prismaData,
    });

    return ProjectMapper.toDomain(savedProject);
  }

  async delete(id: ProjectId): Promise<boolean> {
    try {
      await this.prisma.project.delete({
        where: { id: id.toString() },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
