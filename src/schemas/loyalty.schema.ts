import { z } from 'zod';

export const createLoyaltyProgramSchema = z.object({
  points_per_order: z
    .number()
    .int()
    .positive('Pontos por pedido devem ser maiores que zero')
    .default(1),
  discount_per_point: z
    .number()
    .positive('Desconto por ponto deve ser maior que zero')
    .default(0.01)
    .describe('Desconto em percentual por ponto (ex: 0.01 = 0.01%)'),
});

export const updateLoyaltyProgramSchema = z.object({
  points_per_order: z
    .number()
    .int()
    .positive()
    .optional(),
  discount_per_point: z
    .number()
    .positive()
    .optional(),
  active: z.boolean().optional(),
});

export type CreateLoyaltyProgramInput = z.infer<
  typeof createLoyaltyProgramSchema
>;
export type UpdateLoyaltyProgramInput = z.infer<
  typeof updateLoyaltyProgramSchema
>;

