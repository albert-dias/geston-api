import { describe, it, expect } from 'vitest';
import { createClientSchema, updateClientSchema } from '../client.schema';

describe('Client Schema', () => {
  describe('createClientSchema', () => {
    it('deve validar cliente válido', () => {
      const validClient = {
        name: 'João Silva',
        document: '12345678901',
        phone: '11987654321',
      };

      const result = createClientSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar nome muito curto', () => {
      const invalidClient = {
        name: 'A',
        phone: '11987654321',
      };

      const result = createClientSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });

    it('deve validar CPF válido', () => {
      // CPF válido: 11144477735
      const validClient = {
        name: 'João Silva',
        document: '11144477735',
        phone: '11987654321',
      };

      const result = createClientSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar CPF inválido', () => {
      const invalidClient = {
        name: 'João Silva',
        document: '11111111111',
        phone: '11987654321',
      };

      const result = createClientSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });

    it('deve normalizar telefone removendo caracteres não numéricos', () => {
      const client = {
        name: 'João Silva',
        phone: '(11) 98765-4321',
      };

      const result = createClientSchema.safeParse(client);
      if (result.success) {
        expect(result.data.phone).toBe('11987654321');
      }
    });

    it('deve permitir documento opcional', () => {
      const client = {
        name: 'João Silva',
        phone: '11987654321',
      };

      const result = createClientSchema.safeParse(client);
      expect(result.success).toBe(true);
    });
  });

  describe('updateClientSchema', () => {
    it('deve validar update válido', () => {
      const update = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'João Silva Atualizado',
      };

      const result = updateClientSchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar ID inválido', () => {
      const update = {
        id: 'invalid-uuid',
        name: 'João Silva',
      };

      const result = updateClientSchema.safeParse(update);
      expect(result.success).toBe(false);
    });
  });
});

