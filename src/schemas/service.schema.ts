import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome do serviço deve ter no mínimo 2 caracteres')
    .max(255, 'Nome do serviço deve ter no máximo 255 caracteres')
    .trim(),
  value: z
    .number()
    .int()
    .positive('Valor deve ser maior que zero')
    .min(1, 'Valor deve ser pelo menos 1 centavo'),
  stock_quantity: z.number().int().min(0).default(0).optional(),
  minimum_stock: z.number().int().min(0).optional(),
});

export const updateServiceSchema = z.object({
  id: z.string().uuid('ID do serviço inválido'),
  name: z
    .string()
    .min(2, 'Nome do serviço deve ter no mínimo 2 caracteres')
    .max(255, 'Nome do serviço deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  value: z
    .number()
    .int()
    .positive('Valor deve ser maior que zero')
    .min(1, 'Valor deve ser pelo menos 1 centavo')
    .optional(),
  stock_quantity: z.number().int().min(0).optional(),
  minimum_stock: z.number().int().min(0).optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

