import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export type ValidationTarget = 'body' | 'params' | 'query';

export function validateRequest(schema: z.ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[target];
      const validatedData = schema.parse(dataToValidate);
      req[target] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          error: 'Validation error',
          details: errorMessages,
        });
        return;
      }
      next(error);
    }
  };
}
