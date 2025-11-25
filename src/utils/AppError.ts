export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: Record<string, any>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 400,
    code?: string,
    details?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    // Manter stack trace correta
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  // Métodos estáticos para erros comuns
  static badRequest(message: string, details?: Record<string, any>): AppError {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Não autorizado'): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Acesso negado'): AppError {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Recurso não encontrado'): AppError {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string, details?: Record<string, any>): AppError {
    return new AppError(message, 409, 'CONFLICT', details);
  }

  static validation(message: string, details?: Record<string, any>): AppError {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }

  static internal(message: string = 'Erro interno do servidor'): AppError {
    return new AppError(message, 500, 'INTERNAL_ERROR');
  }
}
