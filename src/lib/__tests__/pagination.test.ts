import { describe, it, expect } from 'vitest';
import {
  normalizePaginationParams,
  createPaginationMeta,
} from '../pagination';

describe('Pagination Utils', () => {
  describe('normalizePaginationParams', () => {
    it('deve usar valores padrão quando não fornecidos', () => {
      const result = normalizePaginationParams(undefined, undefined);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(0);
    });

    it('deve normalizar valores válidos', () => {
      const result = normalizePaginationParams(2, 10);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(10); // (2-1) * 10
    });

    it('deve usar página padrão se fornecida inválida', () => {
      const result = normalizePaginationParams(0, 10);
      expect(result.page).toBe(1);
    });

    it('deve usar limite padrão se fornecida inválida', () => {
      const result = normalizePaginationParams(1, 0);
      expect(result.limit).toBe(20);
    });

    it('deve limitar máximo a 100', () => {
      const result = normalizePaginationParams(1, 200);
      expect(result.limit).toBe(100);
    });
  });

  describe('createPaginationMeta', () => {
    it('deve criar meta corretamente', () => {
      const meta = createPaginationMeta(100, 1, 20);

      expect(meta.total).toBe(100);
      expect(meta.page).toBe(1);
      expect(meta.limit).toBe(20);
      expect(meta.totalPages).toBe(5);
      expect(meta.hasNextPage).toBe(true);
      expect(meta.hasPreviousPage).toBe(false);
    });

    it('deve indicar quando não há próxima página', () => {
      const meta = createPaginationMeta(100, 5, 20);

      expect(meta.hasNextPage).toBe(false);
      expect(meta.hasPreviousPage).toBe(true);
    });

    it('deve calcular total de páginas corretamente', () => {
      const meta1 = createPaginationMeta(100, 1, 20);
      expect(meta1.totalPages).toBe(5);

      const meta2 = createPaginationMeta(99, 1, 20);
      expect(meta2.totalPages).toBe(5); // Math.ceil(99/20) = 5
    });
  });
});

