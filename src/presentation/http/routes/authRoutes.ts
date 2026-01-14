import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/ValidationMiddleware';
import { loginSchema, registerSchema } from '../validators/authValidators';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  router.post(
    '/login',
    validateRequest(loginSchema),
    authController.login()
  );

  router.post(
    '/register',
    validateRequest(registerSchema),
    authController.register()
  );

  return router;
}
