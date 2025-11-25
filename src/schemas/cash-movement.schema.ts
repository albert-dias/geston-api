import { z } from 'zod';

export const createCashMovementSchema = z.object({
  type: z.enum(['ENTRY', 'EXIT']),
  amount: z
    .number()
    .int()
    .positive('Valor deve ser maior que zero')
    .min(1, 'Valor deve ser pelo menos 1 centavo'),
  description: z
    .string()
    .min(3, 'Descrição deve ter no mínimo 3 caracteres')
    .max(255, 'Descrição deve ter no máximo 255 caracteres')
    .trim(),
  order_id: z.string().uuid('ID do pedido inválido').optional(),
  employee_id: z.string().uuid('ID do funcionário inválido').optional(),
});

export type CreateCashMovementInput = z.infer<typeof createCashMovementSchema>;

