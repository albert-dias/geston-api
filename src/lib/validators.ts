import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema, ZodTypeAny } from 'zod';
import { AppError } from '@/utils/AppError';

export function validateBody<T extends ZodTypeAny>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: ZodError['issues'][0]) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new AppError(
          `Dados inválidos: ${errors.map((e: { message: string }) => e.message).join(', ')}`,
          400
        );
      }
      throw error;
    }
  };
}

export function validateQuery<T extends ZodTypeAny>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.query);
      req.query = parsed as typeof req.query;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: ZodError['issues'][0]) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new AppError(
          `Parâmetros inválidos: ${errors.map((e: { message: string }) => e.message).join(', ')}`,
          400
        );
      }
      throw error;
    }
  };
}

export function validateParams<T extends ZodTypeAny>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.params);
      req.params = parsed as typeof req.params;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: ZodError['issues'][0]) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        throw new AppError(
          `Parâmetros inválidos: ${errors.map((e: { message: string }) => e.message).join(', ')}`,
          400
        );
      }
      throw error;
    }
  };
}

