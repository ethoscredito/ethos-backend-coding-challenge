import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '../../../application/use-cases/user/CreateUserUseCase';
import { GetUserUseCase } from '../../../application/use-cases/user/GetUserUseCase';
import { GetAllUsersUseCase } from '../../../application/use-cases/user/GetAllUsersUseCase';
import { UpdateUserUseCase } from '../../../application/use-cases/user/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../../application/use-cases/user/DeleteUserUseCase';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase
  ) {}

  create() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.createUserUseCase.execute(req.body);
        res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    };
  }

  getById() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.getUserUseCase.execute({ id: req.params.id });
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    };
  }

  getAll() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.getAllUsersUseCase.execute();
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    };
  }

  update() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.updateUserUseCase.execute({
          id: req.params.id,
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
        await this.deleteUserUseCase.execute({ id: req.params.id });
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    };
  }
}
