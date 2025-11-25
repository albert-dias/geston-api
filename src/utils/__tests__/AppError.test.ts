import { describe, it, expect } from 'vitest';
import { AppError } from '../AppError';

describe('AppError', () => {
  it('deve criar erro com mensagem e status code padrão', () => {
    const error = new AppError('Erro de teste');

    expect(error.message).toBe('Erro de teste');
    expect(error.statusCode).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  it('deve criar erro com status code customizado', () => {
    const error = new AppError('Não encontrado', 404);

    expect(error.message).toBe('Não encontrado');
    expect(error.statusCode).toBe(404);
  });

  it('deve criar erro com código e detalhes', () => {
    const details = { field: 'email', reason: 'já existe' };
    const error = new AppError('Erro', 409, 'CONFLICT', details);

    expect(error.code).toBe('CONFLICT');
    expect(error.details).toEqual(details);
  });

  describe('Métodos estáticos', () => {
    it('badRequest deve criar erro 400', () => {
      const error = AppError.badRequest('Requisição inválida');

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('BAD_REQUEST');
      expect(error.message).toBe('Requisição inválida');
    });

    it('unauthorized deve criar erro 401', () => {
      const error = AppError.unauthorized();

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('forbidden deve criar erro 403', () => {
      const error = AppError.forbidden();

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });

    it('notFound deve criar erro 404', () => {
      const error = AppError.notFound('Recurso não encontrado');

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('conflict deve criar erro 409', () => {
      const error = AppError.conflict('Conflito');

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });

    it('validation deve criar erro 422', () => {
      const details = { email: 'inválido' };
      const error = AppError.validation('Erro de validação', details);

      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toEqual(details);
    });

    it('internal deve criar erro 500', () => {
      const error = AppError.internal();

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
    });
  });
});

