import { Router } from 'express';
import { createAuthRoutes } from './authRoutes';
import { createUserRoutes } from './userRoutes';
import { createProjectRoutes } from './projectRoutes';
import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';
import { ProjectController } from '../controllers/ProjectController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { RateLimiterMiddleware } from '../middleware/RateLimiterMiddleware';

export interface RoutesDependencies {
  authController: AuthController;
  userController: UserController;
  projectController: ProjectController;
  authMiddleware: AuthMiddleware;
  rateLimiterMiddleware: RateLimiterMiddleware;
}

export function createRoutes(dependencies: RoutesDependencies): Router {
  const router = Router();

  const {
    authController,
    userController,
    projectController,
    authMiddleware,
    rateLimiterMiddleware,
  } = dependencies;

  router.use(rateLimiterMiddleware.limit());

  router.use('/auth', createAuthRoutes(authController));
  router.use('/users', createUserRoutes(userController, authMiddleware));
  router.use('/projects', createProjectRoutes(projectController, authMiddleware));

  return router;
}
