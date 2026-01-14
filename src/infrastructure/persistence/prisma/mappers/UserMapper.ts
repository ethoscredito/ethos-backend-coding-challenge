import { User as PrismaUser } from '@prisma/client';
import { User } from '../../../../domain/entities/User';
import { UserId } from '../../../../domain/value-objects/UserId';
import { Email } from '../../../../domain/value-objects/Email';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return User.reconstitute(
      UserId.create(prismaUser.id),
      Email.create(prismaUser.email),
      prismaUser.name,
      prismaUser.password,
      prismaUser.createdAt,
      prismaUser.updatedAt
    );
  }

  static toPrisma(user: User): {
    id: string;
    email: string;
    name: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: user.id.toString(),
      email: user.email.value,
      name: user.name,
      password: user.hashedPassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
