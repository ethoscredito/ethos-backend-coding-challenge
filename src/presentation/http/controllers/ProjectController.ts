import { Request, Response, NextFunction } from 'express';
import { CreateProjectUseCase } from '../../../application/use-cases/project/CreateProjectUseCase';
import { GetProjectUseCase } from '../../../application/use-cases/project/GetProjectUseCase';
import { GetAllProjectsUseCase } from '../../../application/use-cases/project/GetAllProjectsUseCase';
import { UpdateProjectUseCase } from '../../../application/use-cases/project/UpdateProjectUseCase';
import { DeleteProjectUseCase } from '../../../application/use-cases/project/DeleteProjectUseCase';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware';

export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly getProjectUseCase: GetProjectUseCase,
    private readonly getAllProjectsUseCase: GetAllProjectsUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase
  ) {}

  create() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authenticatedReq = req as AuthenticatedRequest;
        const result = await this.createProjectUseCase.execute({
          ...req.body,
          userId: authenticatedReq.user!.userId,
        });
        res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    };
  }

  getById() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authenticatedReq = req as AuthenticatedRequest;
        const result = await this.getProjectUseCase.execute({
          id: req.params.id,
          userId: authenticatedReq.user!.userId,
        });
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    };
  }

  getAll() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authenticatedReq = req as AuthenticatedRequest;
        const result = await this.getAllProjectsUseCase.execute({
          userId: authenticatedReq.user!.userId,
        });
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    };
  }

  update() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authenticatedReq = req as AuthenticatedRequest;
        const result = await this.updateProjectUseCase.execute({
          id: req.params.id,
          userId: authenticatedReq.user!.userId,
          ...req.body,
        });
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    };
  }

  delete() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authenticatedReq = req as AuthenticatedRequest;
        await this.deleteProjectUseCase.execute({
          id: req.params.id,
          userId: authenticatedReq.user!.userId,
        });
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    };
  }
}
