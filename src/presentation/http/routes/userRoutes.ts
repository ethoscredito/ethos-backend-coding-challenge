import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
import { validateRequest } from '../middleware/ValidationMiddleware';
import { createUserSchema, updateUserSchema, userIdParamSchema } from '../validators/userValidators';

export function createUserRoutes(
  userController: UserController,
  authMiddleware: AuthMiddleware
): Router {
  const router = Router();

  router.use(authMiddleware.authenticate());

  router.post(
    '/',
    validateRequest(createUserSchema),
    userController.create()
  );

  router.get(
    '/',
    userController.getAll()
  );

  router.get(
    '/:id',
    validateRequest(userIdParamSchema, 'params'),
    userController.getById()
  );

  router.put(
    '/:id',
    validateRequest(userIdParamSchema, 'params'),
    validateRequest(updateUserSchema),
    userController.update()
  );

  router.delete(
    '/:id',
    validateRequest(userIdParamSchema, 'params'),
    userController.delete()
  );

  return router;
}
