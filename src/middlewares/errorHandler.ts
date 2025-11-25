import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '@/utils/AppError';

interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  details?: Record<string, any>;
  stack?: string;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log do erro (em produção, usar um logger apropriado)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  } else {
    // Em produção, log apenas informações essenciais
    console.error('Error:', {
      message: err.message,
      code: err instanceof AppError ? err.code : undefined,
      url: req.url,
      method: req.method,
    });
  }

  let errorResponse: ErrorResponse;

  // Erro customizado da aplicação
  if (err instanceof AppError) {
    errorResponse = {
      status: 'error',
      message: err.message,
      code: err.code,
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    return res.status(err.statusCode).json(errorResponse);
  }

  // Erro de validação Zod
  if (err instanceof ZodError) {
    const details = err.errors.reduce((acc, error) => {
      const path = error.path.join('.');
      acc[path] = error.message;
      return acc;
    }, {} as Record<string, string>);

    errorResponse = {
      status: 'error',
      message: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      details,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    return res.status(422).json(errorResponse);
  }

  // Erros do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let message = 'Erro no banco de dados';
    let statusCode = 500;
    let code = 'DATABASE_ERROR';

    switch (err.code) {
      case 'P2002':
        // Violação de constraint única
        const target = (err.meta?.target as string[]) || [];
        message = `Já existe um registro com este ${target.join(', ')}`;
        statusCode = 409;
        code = 'DUPLICATE_ENTRY';
        break;
      case 'P2025':
        // Registro não encontrado
        message = 'Registro não encontrado';
        statusCode = 404;
        code = 'NOT_FOUND';
        break;
      case 'P2003':
        // Violação de foreign key
        message = 'Referência inválida';
        statusCode = 400;
        code = 'INVALID_REFERENCE';
        break;
      default:
        message = `Erro no banco de dados: ${err.message}`;
    }

    errorResponse = {
      status: 'error',
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          prismaCode: err.code,
          meta: err.meta,
        },
        stack: err.stack,
      }),
    };

    return res.status(statusCode).json(errorResponse);
  }

  // Erros do Prisma - Validação
  if (err instanceof Prisma.PrismaClientValidationError) {
    errorResponse = {
      status: 'error',
      message: 'Dados inválidos para o banco de dados',
      code: 'VALIDATION_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        details: { originalError: err.message },
        stack: err.stack,
      }),
    };

    return res.status(422).json(errorResponse);
  }

  // Erro não tratado
  errorResponse = {
    status: 'error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : err.message || 'Erro interno do servidor',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(500).json(errorResponse);
}

