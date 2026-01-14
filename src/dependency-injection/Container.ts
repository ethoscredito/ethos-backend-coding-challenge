import { getPrismaClient } from '../infrastructure/persistence/prisma/PrismaClient';
import { PrismaUserRepository } from '../infrastructure/persistence/prisma/repositories/PrismaUserRepository';
import { PrismaProjectRepository } from '../infrastructure/persistence/prisma/repositories/PrismaProjectRepository';
import { JWTTokenService } from '../infrastructure/security/JWTTokenService';
import { InMemoryRateLimiter } from '../infrastructure/security/InMemoryRateLimiter';

import { LoginUseCase } from '../application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '../application/use-cases/auth/RegisterUseCase';
import { CreateUserUseCase } from '../application/use-cases/user/CreateUserUseCase';
import { GetUserUseCase } from '../application/use-cases/user/GetUserUseCase';
import { GetAllUsersUseCase } from '../application/use-cases/user/GetAllUsersUseCase';
import { UpdateUserUseCase } from '../application/use-cases/user/UpdateUserUseCase';
import { DeleteUserUseCase } from '../application/use-cases/user/DeleteUserUseCase';
import { CreateProjectUseCase } from '../application/use-cases/project/CreateProjectUseCase';
import { GetProjectUseCase } from '../application/use-cases/project/GetProjectUseCase';
import { GetAllProjectsUseCase } from '../application/use-cases/project/GetAllProjectsUseCase';
import { UpdateProjectUseCase } from '../application/use-cases/project/UpdateProjectUseCase';
import { DeleteProjectUseCase } from '../application/use-cases/project/DeleteProjectUseCase';

import { AuthController } from '../presentation/http/controllers/AuthController';
import { UserController } from '../presentation/http/controllers/UserController';
import { ProjectController } from '../presentation/http/controllers/ProjectController';
import { AuthMiddleware } from '../presentation/http/middleware/AuthMiddleware';
import { RateLimiterMiddleware } from '../presentation/http/middleware/RateLimiterMiddleware';

export class Container {
  private static instance: Container;

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  // Infrastructure
  getPrismaClient() {
    return getPrismaClient();
  }

  getUserRepository() {
    return new PrismaUserRepository(this.getPrismaClient());
  }

  getProjectRepository() {
    return new PrismaProjectRepository(this.getPrismaClient());
  }

  getTokenService() {
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    return new JWTTokenService(jwtSecret);
  }

  getRateLimiter() {
    const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
    const maxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
    return new InMemoryRateLimiter(windowMs, maxRequests);
  }

  // Auth Use Cases
  getLoginUseCase() {
    return new LoginUseCase(this.getUserRepository(), this.getTokenService());
  }

  getRegisterUseCase() {
    return new RegisterUseCase(this.getUserRepository(), this.getTokenService());
  }

  // User Use Cases
  getCreateUserUseCase() {
    return new CreateUserUseCase(this.getUserRepository());
  }

  getGetUserUseCase() {
    return new GetUserUseCase(this.getUserRepository());
  }

  getGetAllUsersUseCase() {
    return new GetAllUsersUseCase(this.getUserRepository());
  }

  getUpdateUserUseCase() {
    return new UpdateUserUseCase(this.getUserRepository());
  }

  getDeleteUserUseCase() {
    return new DeleteUserUseCase(this.getUserRepository());
  }

  // Project Use Cases
  getCreateProjectUseCase() {
    return new CreateProjectUseCase(this.getProjectRepository(), this.getUserRepository());
  }

  getGetProjectUseCase() {
    return new GetProjectUseCase(this.getProjectRepository());
  }

  getGetAllProjectsUseCase() {
    return new GetAllProjectsUseCase(this.getProjectRepository());
  }

  getUpdateProjectUseCase() {
    return new UpdateProjectUseCase(this.getProjectRepository());
  }

  getDeleteProjectUseCase() {
    return new DeleteProjectUseCase(this.getProjectRepository());
  }

  // Controllers
  getAuthController() {
    return new AuthController(this.getLoginUseCase(), this.getRegisterUseCase());
  }

  getUserController() {
    return new UserController(
      this.getCreateUserUseCase(),
      this.getGetUserUseCase(),
      this.getGetAllUsersUseCase(),
      this.getUpdateUserUseCase(),
      this.getDeleteUserUseCase()
    );
  }

  getProjectController() {
    return new ProjectController(
      this.getCreateProjectUseCase(),
      this.getGetProjectUseCase(),
      this.getGetAllProjectsUseCase(),
      this.getUpdateProjectUseCase(),
      this.getDeleteProjectUseCase()
    );
  }

  // Middleware
  getAuthMiddleware() {
    return new AuthMiddleware(this.getTokenService());
  }

  getRateLimiterMiddleware() {
    return new RateLimiterMiddleware(this.getRateLimiter());
  }
}
