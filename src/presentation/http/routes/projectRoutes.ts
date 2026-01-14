import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { validateRequest } from '../middleware/ValidationMiddleware';
import { createProjectSchema, updateProjectSchema, projectIdParamSchema } from '../validators/projectValidators';

export function createProjectRoutes(
  projectController: ProjectController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();

  router.use(authMiddleware.authenticate());

  router.post(
    '/',
    validateRequest(createProjectSchema),
    projectController.create()
  );

  router.get(
    '/',
    projectController.getAll()
  );

  router.get(
    '/:id',
    validateRequest(projectIdParamSchema, 'params'),
    projectController.getById()
  );

  router.put(
    '/:id',
    validateRequest(projectIdParamSchema, 'params'),
    validateRequest(updateProjectSchema),
    projectController.update()
  );

  router.delete(
    '/:id',
    validateRequest(projectIdParamSchema, 'params'),
    projectController.delete()
  );

  return router;
}
