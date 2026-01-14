import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../../application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '../../../application/use-cases/auth/RegisterUseCase';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase
  ) {}

  login() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.loginUseCase.execute(req.body);
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    };
  }

  register() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await this.registerUseCase.execute(req.body);
        res.status(201).json(result);
      } catch (error) {
        next(error);
      }
    };
  }
}
