import 'dotenv/config';
import express from 'express';
import { Container } from './dependency-injection/Container';
import { createRoutes } from './presentation/http/routes';
import { errorHandler } from './presentation/http/middleware/ErrorHandlerMiddleware';

const app = express();

app.use(express.json());

const container = Container.getInstance();

const routes = createRoutes({
  authController: container.getAuthController(),
  userController: container.getUserController(),
  projectController: container.getProjectController(),
  authMiddleware: container.getAuthMiddleware(),
  rateLimiterMiddleware: container.getRateLimiterMiddleware(),
});

app.use('/api', routes);

app.use(errorHandler);

export default app;
