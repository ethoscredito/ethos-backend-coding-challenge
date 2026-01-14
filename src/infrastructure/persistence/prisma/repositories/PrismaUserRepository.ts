import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../../../domain/repositories/IUserRepository';
import { User } from '../../../../domain/entities/User';
import { UserId } from '../../../../domain/value-objects/UserId';
import { Email } from '../../../../domain/value-objects/Email';
import { UserMapper } from '../mappers/UserMapper';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UserId): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id: id.toString() },
    });

    if (!prismaUser) {
      return null;
    }

    return UserMapper.toDomain(prismaUser);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email: email.value },
    });

    if (!prismaUser) {
      return null;
    }

    return UserMapper.toDomain(prismaUser);
  }

  async findAll(): Promise<User[]> {
    const prismaUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return prismaUsers.map(UserMapper.toDomain);
  }

  async save(user: User): Promise<User> {
    const prismaData = UserMapper.toPrisma(user);

    const savedUser = await this.prisma.user.upsert({
      where: { id: prismaData.id },
      update: {
        email: prismaData.email,
        name: prismaData.name,
        password: prismaData.password,
        updatedAt: prismaData.updatedAt,
      },
      create: prismaData,
    });

    return UserMapper.toDomain(savedUser);
  }

  async delete(id: UserId): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id: id.toString() },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.value },
    });

    return count > 0;
  }
}
